import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validasi untuk tag
const tagsSchema = z.object({
  nama: z.string().min(1, "Nama tag wajib diisi"),
});

// GET /api/tags (Get All Tags)
export async function GET() {
  try {
    const tags = await prisma.tags.findMany({
      include: { artikel: true },
    });

    return NextResponse.json(
      { message: "Tags fetched successfully", data: tags },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { message: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST /api/tags (Create Tag)
export async function POST(req: Request) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated || !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  try {
    const body = await req.json();
    const validated = tagsSchema.parse(body);

    const tag = await prisma.tags.create({
      data: {
        nama: validated.nama,
      },
    });

    return NextResponse.json(
      { message: "Tag created successfully", data: tag },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tag:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Failed to create tag" }, { status: 500 });
  }
}
