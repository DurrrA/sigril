import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client

// Update a role by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { role_name, deskripsi } = await req.json();

  if (!id || !role_name) {
    return NextResponse.json(
      { error: "Role ID and name are required" },
      { status: 400 }
    );
  }

  try {
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { role_name, deskripsi },
    });

    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// Delete a role by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Role ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.role.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Role deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}