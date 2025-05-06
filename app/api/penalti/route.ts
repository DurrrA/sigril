import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validasi untuk penalti
const penaltiSchema = z.object({
  nama: z.string().min(1, "Nama penalti wajib diisi"),
  nilai: z.number().min(1, "Nilai penalti wajib lebih besar dari 0"),
  deskripsi: z.string().optional(),
});

// GET /api/penalti (Get All Penalti)
export async function GET() {
  try {
    const penalti = await prisma.penalti.findMany();

    return NextResponse.json(
      { message: "Penalti fetched successfully", data: penalti },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching penalti:", error);
    return NextResponse.json(
      { message: "Failed to fetch penalti" },
      { status: 500 }
    );
  }
}

// POST /api/penalti (Create Penalti)
export async function POST(req: Request) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const body = await req.json();
    const validated = penaltiSchema.parse(body);

    const newPenalti = await prisma.penalti.create({
      data: {
        id_user: validated.id_user,
        total_bayar: validated.total_bayar,
        id_barang: validated.id_barang,
      },
    });

    return NextResponse.json(
      { message: "Penalti created successfully", data: newPenalti },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating penalti:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Failed to create penalti" }, { status: 500 });
  }
}
