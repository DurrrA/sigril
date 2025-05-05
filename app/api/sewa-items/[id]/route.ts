import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validasi untuk sewa item update
const sewaItemSchema = z.object({
  barangId: z.number().min(1, "Barang ID wajib diisi"),
  userId: z.number().min(1, "User ID wajib diisi"),
  totalBayar: z.number().min(1, "Total bayar wajib lebih besar dari 0"),
  status: z.string().min(1, "Status wajib diisi"),
});

// GET /api/sewa-items/[id] (Get Sewa Item by ID)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sewaItem = await prisma.sewa_items.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        barang: true,  // include related barang model
        user: true,    // include related user model
      },
    });

    if (!sewaItem) {
      return NextResponse.json(
        { message: "Sewa item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Sewa item fetched successfully", data: sewaItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sewa item:", error);
    return NextResponse.json(
      { message: "Failed to fetch sewa item" },
      { status: 500 }
    );
  }
}

// PUT /api/sewa-items/[id] (Update Sewa Item by ID)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const body = await req.json();
    const validated = sewaItemSchema.parse(body);

    const updatedSewaItem = await prisma.sewa_items.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        barangId: validated.barangId,
        userId: validated.userId,
        totalBayar: validated.totalBayar,
        status: validated.status,
      },
    });

    return NextResponse.json(
      { message: "Sewa item updated successfully", data: updatedSewaItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating sewa item:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Failed to update sewa item" }, { status: 500 });
  }
}

// DELETE /api/sewa-items/[id] (Delete Sewa Item by ID)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const deletedSewaItem = await prisma.sewa_items.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json(
      { message: "Sewa item deleted successfully", data: deletedSewaItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting sewa item:", error);
    return NextResponse.json(
      { message: "Failed to delete sewa item" },
      { status: 500 }
    );
  }
}
