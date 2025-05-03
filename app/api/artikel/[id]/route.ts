import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Use singleton instance
import { requireAdmin } from "@/lib/auth";

// Fix GET handler signature
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await context.params).id);
    
    const artikel = await prisma.artikel.findUnique({
      where: {
        id,
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

    return NextResponse.json({
      message: "Artikel fetched successfully",
      data: artikel,
    }, { status: 200
    });
  } catch (error) {
    console.error("Error fetching artikel:", error);
    return NextResponse.json({ error: "Gagal mengambil data artikel" }, { status: 500 });
  }
}

// Fix PUT handler signature
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin();
  
  // Return JSON responses instead of redirects for API routes
  if (!authCheck.isAuthenticated) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  
  if (!authCheck.isAuthorized) {
    return NextResponse.json({ error: "Admin privileges required" }, { status: 403 });
  }

  try {
    const id = parseInt((await context.params).id);
    const body = await request.json();
    const { judul, konten, foto, id_tags, is_published, publishAt } = body;

    const artikel = await prisma.artikel.update({
      where: { id },
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

    return NextResponse.json({
      message: "Artikel berhasil diperbarui",
      data: artikel,
    });
  } catch (error) {
    console.error("Error updating artikel:", error);
    return NextResponse.json({ error: "Gagal update artikel" }, { status: 500 });
  }
}

// Fix DELETE handler signature
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin();
  
  // Return JSON responses instead of redirects for API routes
  if (!authCheck.isAuthenticated) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  
  if (!authCheck.isAuthorized) {
    return NextResponse.json({ error: "Admin privileges required" }, { status: 403 });
  }

  try {
    const id = parseInt((await context.params).id);
    
    await prisma.artikel.update({
      where: { id },
      data: {
        is_deleted: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      message: "Artikel berhasil dihapus",
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting artikel:", error);
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}