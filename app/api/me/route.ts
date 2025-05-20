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
      }
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
    const contentType = request.headers.get("content-type") || "";
    
    // Handle JSON request (for location updates)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      
      // Check if this is a location update
      if (body.lat !== undefined && body.lng !== undefined) {
        // Update user location
        const updatedUser = await prisma.user.update({
          where: { email: session.user?.email ?? "" },
          data: {
            location_lat: body.lat,
            location_lng: body.lng,
            location_address: body.address || null
          }
        });
        
        return NextResponse.json({
          success: true,
          message: "Location updated successfully",
          data: {
            location: {
              lat: updatedUser.location_lat,
              lng: updatedUser.location_lng,
              address: updatedUser.location_address
            }
          }
        });
      }
    }
    
    // Process multipart form data
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const fullName = formData.get("fullName") as string;
    const dateOfBirthStr = formData.get("dateOfBirth") as string | null;
    const avatarFile = formData.get("avatar") as File | null;
    const locationLat = formData.get("locationLat") ? parseFloat(formData.get("locationLat") as string) : undefined;
    const locationLng = formData.get("locationLng") ? parseFloat(formData.get("locationLng") as string) : undefined;
    const locationAddress = formData.get("locationAddress") as string | null;
    
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
        
        // Add location fields if provided
        location_lat: locationLat !== undefined ? locationLat : undefined,
        location_lng: locationLng !== undefined ? locationLng : undefined,
        location_address: locationAddress || undefined,
      }
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