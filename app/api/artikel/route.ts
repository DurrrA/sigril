'use server';

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const artikel = await prisma.artikel.findMany({
      where: { is_deleted: false },
      include: {
        tags: true,
        artikel_comment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
        { message: "Artikel fetched successfully", data: artikel },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching artikels:", error);
    return NextResponse.json({ error: "Gagal mengambil data artikel" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const { judul, konten, foto, id_tags, publishAt, is_published } = body;

    const artikel = await prisma.artikel.create({
      data: {
        judul,
        konten,
        foto,
        id_tags,
        publishAt: new Date(publishAt),
        is_published: is_published ?? false,
      },
    });

    return NextResponse.json(
        {message : "Artikel created successfully", data: artikel},
        { status: 201 }
    );
  } catch (error) {
    console.error("Error creating artikel:", error);
    return NextResponse.json(
        { error: "Gagal membuat artikel" },
        { status: 500 }
    );
  }
}
