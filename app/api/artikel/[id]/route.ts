'use server';

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { loginIsRequiredServer } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const artikel = await prisma.artikel.findUnique({
      where: {
        id: parseInt(params.id),
        is_deleted: false,
      },
      include: {
        tags: true,
        artikel_comment: true,
      },
    });

    if (!artikel) {
      return NextResponse.json({ message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(artikel);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data artikel" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await loginIsRequiredServer();

  try {
    const body = await req.json();
    const { judul, konten, foto, id_tags, is_published, publishAt } = body;

    const artikel = await prisma.artikel.update({
      where: { id: parseInt(params.id) },
      data: {
        judul,
        konten,
        foto,
        id_tags,
        is_published,
        publishAt: new Date(publishAt),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(artikel);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update artikel" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await loginIsRequiredServer();

  try {
    await prisma.artikel.update({
      where: { id: parseInt(params.id) },
      data: {
        is_deleted: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}
