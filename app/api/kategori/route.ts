import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema untuk kategori
const kategoriSchema = z.object({
  nama: z.string().min(1, "Name is required"),
});

// Fetch semua kategori
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      include: {
        barang: true, // Menyertakan barang yang terkait
      },
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json(
      { message: "Kategori fetched successfully", data: kategori },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return NextResponse.json(
      { message: "Failed to fetch kategori" },
      { status: 500 }
    );
  }
}

// Menambah kategori baru
export async function POST(req: Request) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const body = await req.json();
    const validatedData = kategoriSchema.parse(body);

    const newKategori = await prisma.kategori.create({
      data: {
        nama: validatedData.nama,
      },
    });

    return NextResponse.json(
      { message: "Kategori created successfully", data: newKategori },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating kategori:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create kategori" },
      { status: 500 }
    );
  }
}
