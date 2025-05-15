import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";

// Schema for location update
const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional()
});

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = auth.user.id;
    const body = await request.json();
    const validatedData = locationSchema.parse(body);
    
    // Update user with new location data
    const updatedUser = await prisma.user.update({  // Changed from users to user
      where: { id: userId },
      data: {
        location_lat: validatedData.lat,
        location_lng: validatedData.lng,
        location_address: validatedData.address || null
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Location updated successfully"
    });
  } catch (error) {
    console.error("Failed to update location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = auth.user.id;
    
    // Get user's saved location
    const user = await prisma.user.update({  // Changed from users to user
      where: { id: userId },
      select: {
        location_lat: true,
        location_lng: true,
        location_address: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        lat: user?.location_lat || null,
        lng: user?.location_lng || null,
        address: user?.location_address || null
      }
    });
  } catch (error) {
    console.error("Failed to fetch location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}