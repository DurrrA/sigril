import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextRequest } from "next/server";

const barangSchema = z.object({
    nama: z.string().min(1, "Name is required"),
    deskripsi: z.string().min(1, "Description is required"),
    harga: z.number().min(0, "Price must be a positive number"),
    foto: z.string().optional(),
    kategori_id: z.number().min(1, "Category ID is required"),
    stok: z.number().min(0, "Stock must be a positive number"),
    harga_pinalti_per_jam: z.number(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authCheck = await requireAdmin();
    if (!authCheck.isAuthenticated) {
      // Create a URL object using the current request URL as base
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    try {
        const body = await request.json();
        const validatedData = barangSchema.parse(body); 
        const foto = validatedData.foto || "image/file.svg"; // Set foto to null if not provided
        const updatedBarang = await prisma.barang.update({
            where: { id: Number(params.id) },
            data: {
                nama: validatedData.nama,
                harga: validatedData.harga,
                deskripsi: validatedData.deskripsi,
                foto: foto,
                kategori_id: validatedData.kategori_id,
                stok: validatedData.stok,
                harga_pinalti_per_jam: validatedData.harga_pinalti_per_jam,
            },
            include: {
                kategori: true, 
            },
        });

        const response = {
            message: "Barang updated successfully",
            data: {
                id: updatedBarang.id,
                stok: updatedBarang.stok,
                foto: updatedBarang.foto,
                harga_pinalti_per_jam: updatedBarang.harga_pinalti_per_jam,
                deskripsi: updatedBarang.deskripsi,
                kategori_id: updatedBarang.kategori_id,
                harga: updatedBarang.harga,
                nama: updatedBarang.nama,
                kategori: updatedBarang.kategori
            }
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error updating barang:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors.map(e => e.message).join(", ") },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const authCheck = await requireAdmin();
    if (!authCheck.isAuthenticated) {
      // Create a URL object using the current request URL as base
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    try {
        const deletedBarang = await prisma.barang.delete({
            where: { id: Number(params.id) },
        });

        return NextResponse.json(
            { message: "Barang deleted successfully", data: deletedBarang },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting barang:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const authCheck = await requireAdmin();
    if (!authCheck.isAuthenticated) {
      // Create a URL object using the current request URL as base
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    try {
      const barang = await prisma.barang.findUnique({
        where: { id: Number(params.id) },
        include: {
          kategori: true,
        },
      });
  
      if (!barang) {
        return NextResponse.json(
          { message: "Barang not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        message: "Data retrieved successfully",
        data: barang
      });
    } catch (error) {
      console.error("Error retrieving barang:", error);
      return NextResponse.json(
        { message: "Failed to retrieve barang" },
        { status: 500 }
      );
    }
  }

  