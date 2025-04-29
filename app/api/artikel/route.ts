'use server';

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { loginIsRequiredServer } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const artikels = await prisma.artikel.findMany({
      where: { is_deleted: false },
      include: {
        tags: true,
        artikel_comment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(artikels);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data artikel" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await loginIsRequiredServer();
  const session = await getServerSession(authConfig);

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

    return NextResponse.json(artikel);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 });
  }
}
