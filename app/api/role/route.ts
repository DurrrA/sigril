import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextRequest } from "next/server";

const roleSchema = z.object({
  role_name: z.string().min(1, "Name is required"),
  deskripsi: z.string().min(1, "Description is required")
});

export async function GET(request: NextRequest){
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  try {
    const role = await prisma.role.findMany({
      include: {
        user: true,
      },
    });

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

export async function POST(request: NextRequest) {
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

    const newRole = await prisma.role.create({
      data: {
        role_name: validatedData.role_name,
        deskripsi: validatedData.deskripsi,
      },
    });

    return NextResponse.json(
      { message: "Role created successfully", data: newRole },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create role" },
      { status: 500 }
    );
  }
}