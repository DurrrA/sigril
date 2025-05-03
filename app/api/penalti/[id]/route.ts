// /api/penalti/[id].ts
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validasi untuk penalti update
const penaltiSchema = z.object({
  nama: z.string().min(1, "Nama penalti wajib diisi"),
  nilai: z.number().min(1, "Nilai penalti wajib lebih besar dari 0"),
  deskripsi: z.string().optional(),
});

// /api/penalti/[id].ts

// GET /api/penalti/[id] (Get Penalti by ID)
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
      const penaltiId = parseInt(params.id); // Ambil ID dari URL
      if (isNaN(penaltiId)) {
        return NextResponse.json({ message: "Invalid ID parameter" }, { status: 400 });
      }
  
      const penalti = await prisma.penalti.findUnique({
        where: { id: penaltiId },
      });
  
      if (!penalti) {
        return NextResponse.json({ message: "Penalti not found" }, { status: 404 });
      }
  
      return NextResponse.json(
        { message: "Penalti fetched successfully", data: penalti },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching penalti:", error);
      return NextResponse.json({ message: "Failed to fetch penalti" }, { status: 500 });
    }
  }
  
  
// DELETE /api/penalti/[id] (Delete Penalti by ID)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid ID provided" },
        { status: 400 }
      );
    }

    const deletedPenalti = await prisma.penalti.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Penalti deleted successfully", data: deletedPenalti },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting penalti:", error);
    return NextResponse.json(
      { message: "Failed to delete penalti" },
      { status: 500 }
    );
  }
}
