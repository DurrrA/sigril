import { loginIsRequiredServer, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";


const barangSchema = z.object({
  nama: z.string().min(1, "Name is required"),
  deskripsi: z.string().min(1, "Description is required"),
  harga: z.number().min(0, "Price must be a positive number"),
  foto: z.string().optional(),
  kategori_id: z.number().min(1, "Category ID is required"),
  stok: z.number().min(0, "Stock must be a positive number"),
  harga_pinalti_per_jam: z.number(),
  
});

export async function POST(req: Request) {
  await loginIsRequiredServer();
  await isAdmin();
  try {
    const body = await req.json();
    const validatedData = barangSchema.parse(body); 
    const foto = validatedData.foto || "image/file.svg"; // Set foto to null if not provided
    const newBarang = await prisma.barang.create({
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
      message: "Barang created successfully",
      data: {
        id: newBarang.id,
        stok: newBarang.stok,
        foto: newBarang.foto,
        harga_pinalti_per_jam: newBarang.harga_pinalti_per_jam,
        deskripsi: newBarang.deskripsi,
        kategori_id: newBarang.kategori_id,
        harga: newBarang.harga,
        nama: newBarang.nama,
        kategori: newBarang.kategori
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating barang:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Validation error",
          error: error.errors.map((e) => e.message) 
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        message: "Failed to create barang",
        error: "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const barangList = await prisma.barang.findMany({
      include: {
        kategori: true, 
      }
    });

    // Simplified response format
    const response = {
      message: "Data retrieved successfully",
      data: barangList.map(item => ({
        id: item.id,
        stok: item.stok,
        foto: item.foto,
        harga_pinalti_per_jam: item.harga_pinalti_per_jam,
        deskripsi: item.deskripsi,
        kategori_id: item.kategori_id,
        harga: item.harga,
        nama: item.nama,
        kategori: item.kategori
      }))
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error retrieving barang:", error);
    return NextResponse.json(
      { 
        message: "Failed to retrieve barang",
        data: []
      },
      { status: 500 }
    );
  }
}