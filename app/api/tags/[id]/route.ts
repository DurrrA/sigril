import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validasi untuk tag update
const tagsSchema = z.object({
  nama: z.string().min(1, "Nama tag wajib diisi"),
});

// GET /api/tags/[id] (Get Tag by ID)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const tag = await prisma.tags.findUnique({
      where: { id: parseInt(params.id) },
      include: { artikel: true },
    });

    if (!tag) {
      return NextResponse.json(
        { message: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Tag fetched successfully", data: tag },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json(
      { message: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] (Update Tag by ID)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const body = await req.json();
    const validated = tagsSchema.parse(body);

    const updatedTag = await prisma.tags.update({
      where: { id: parseInt(params.id) },
      data: {
        nama: validated.nama,
      },
    });

    return NextResponse.json(
      { message: "Tag updated successfully", data: updatedTag },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tag:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Failed to update tag" }, { status: 500 });
  }
}

// DELETE /api/tags/[id] (Delete Tag by ID)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const deletedTag = await prisma.tags.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(
      { message: "Tag deleted successfully", data: deletedTag },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { message: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
