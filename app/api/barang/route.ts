import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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

export async function POST(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const kategoriId = searchParams.get('kategori');
    const search = searchParams.get('search');
    // Build the where clause based on query parameters
    const whereClause: Prisma.barangWhereInput = {};

    
    if (kategoriId) {
      whereClause.kategori_id = Number(kategoriId);
    }
    
    if (search) {
      whereClause.nama = {
        contains: search
      };
    }
    
    const barangList = await prisma.barang.findMany({
      where: whereClause,
      include: {
        kategori: true,
      },
    });
    
    return NextResponse.json({
      message: "Data retrieved successfully",
      data: barangList
    });
  } catch (error) {
    console.error("Error retrieving barang:", error);
    return NextResponse.json(
      { message: "Failed to retrieve barang", data: [] },
      { status: 500 }
    );
  }
}