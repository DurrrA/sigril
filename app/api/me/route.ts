// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authConfig } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { join } from "path";
import { writeFile } from "fs/promises";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email ?? "" },
      include: {
        role: true,
        transaksi: true,
        keranjang: true,
        penalti: true,
        review: true,
        sewa_req: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      message: "Data retrieved successfully",
      data: { user }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Process multipart form data
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const fullName = formData.get("fullName") as string;
    const dateOfBirthStr = formData.get("dateOfBirth") as string | null;
    const avatarFile = formData.get("avatar") as File | null;
    
    // Handle avatar file upload
    let avatarPath = null;
    if (avatarFile) {
      // Create a unique filename
      const filename = `${uuidv4()}-${avatarFile.name}`;
      
      // Set the path where the file will be saved (adjust as needed)
      const publicDir = join(process.cwd(), 'public', 'uploads');
      avatarPath = `/uploads/${filename}`;
      
      // Convert file to buffer
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save the file
      await writeFile(join(publicDir, filename), buffer);
    }
    
    // Update user in database
    const user = await prisma.user.update({
      where: { email: session.user?.email ?? "" },
      data: {
        username,
        no_telp: phone,
        alamat: address,
        full_name: fullName,
        date_of_birth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
        avatar: avatarPath || undefined, // Only update if a new file was uploaded
      },
      select: {
        id: true,
        username: true,
        email: true,
        no_telp: true,
        alamat: true,
        full_name: true,
        date_of_birth: true,
        avatar: true,
      },
    });
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.no_telp || "",
      address: user.alamat || "",
      fullName: user.full_name || "",
      dateOfBirth: user.date_of_birth ? user.date_of_birth.toISOString() : null,
      avatar: user.avatar || null,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}