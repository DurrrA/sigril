import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextRequest } from "next/server";

const kategoriSchema = z.object({
  nama: z.string().min(1, "Name is required"),
});

// Fetch kategori berdasarkan ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  try {
    const kategori = await prisma.kategori.findUnique({
      where: { id: Number((await params).id) },
    });

    if (!kategori) {
      return NextResponse.json({ message: "Kategori not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Kategori fetched successfully", data: kategori },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return NextResponse.json({ message: "Failed to fetch kategori" }, { status: 500 });
  }
}

// Update kategori berdasarkan ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  try {
    const body = await request.json();
    const validatedData = kategoriSchema.parse(body);

    const updatedKategori = await prisma.kategori.update({
      where: { id: Number((await params).id) },
      data: { nama: validatedData.nama },
    });

    return NextResponse.json(
      { message: "Kategori updated successfully", data: updatedKategori },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating kategori:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Failed to update kategori" }, { status: 500 });
  }
}

// Hapus kategori berdasarkan ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  const kategoriId = Number((await params).id);

  try {
    // Cek apakah ada barang yang terkait kategori ini
    const barangTerkait = await prisma.barang.findFirst({
      where: { kategori_id: kategoriId },
    });

    if (barangTerkait) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus kategori yang masih digunakan oleh barang." },
        { status: 400 }
      );
    }

    const deletedKategori = await prisma.kategori.delete({
      where: { id: kategoriId },
    });

    return NextResponse.json(
      { message: "Kategori deleted successfully", data: deletedKategori },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting kategori:", error);
    return NextResponse.json({ message: "Failed to delete kategori" }, { status: 500 });
  }
}
