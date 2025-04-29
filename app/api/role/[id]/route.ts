import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextRequest } from "next/server";

const roleSchema = z.object({
  role_name: z.string().min(1, "Name is required"),
  deskripsi: z.string().min(1, "Description is required")
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated) {
    // Create a URL object using the current request URL as base
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  try {
    const role = await prisma.role.findUnique({
      where: { id: Number(params.id) },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Role fetched successfully", data: role },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { message: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  try {
    const body = await request.json();
    const validatedData = roleSchema.parse(body); 

    const updatedRole = await prisma.role.update({
      where: { id: Number(params.id) },
      data: {
        role_name: validatedData.role_name,
        deskripsi: validatedData.deskripsi,
      },
    });

    return NextResponse.json(
      { message: "Role updated successfully", data: updatedRole },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated) {
    // Create a URL object using the current request URL as base
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  try {
    const deletedRole = await prisma.role.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json(
      { message: "Role deleted successfully", data: deletedRole },
      { status: 200 }
    );
  }
  catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { message: "Failed to delete role" },
      { status: 500 }
    );
  }
}