import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validation for sewa item update - fixed field names
const sewaItemSchema = z.object({
  id_barang: z.number().min(1, "Barang ID wajib diisi"),
  harga_total: z.number().min(1, "Total bayar wajib lebih besar dari 0"),
  jumlah: z.number().min(1, "Jumlah wajib diisi"),
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
        barang: true,
        sewa_req: {
          include: {
            user: true
          }
        }
      },
    });

    if (!sewaItem) {
      return NextResponse.json(
        { message: "Sewa item not found" },
        { status: 404 }
      );
    }

    // Now get user data from the sewa_req relation
    const userData = sewaItem.sewa_req.user;

    return NextResponse.json({
      message: "Sewa item fetched successfully", 
      data: {
        ...sewaItem,
        userData
      }
    }, { status: 200 });
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
        // Fix field names to match your schema
        id_barang: validated.id_barang,
        harga_total: validated.harga_total,
        jumlah: validated.jumlah,
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