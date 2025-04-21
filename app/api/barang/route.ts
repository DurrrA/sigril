import { loginIsRequiredServer } from "@/lib/auth";
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
    });

    return NextResponse.json(newBarang, { status: 201 });
  } catch (error) {
    console.error("Error creating barang:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create barang" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await loginIsRequiredServer();

  try {
    const barangList = await prisma.barang.findMany();
    return NextResponse.json(barangList, { status: 200 });
  } catch (error) {
    console.error("Error retrieving barang:", error);
    return NextResponse.json(
      { error: "Failed to retrieve barang" },
      { status: 500 }
    );
  }
}