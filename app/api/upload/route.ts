import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from "@/lib/auth";

// Allow files up to 10MB
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await requireAdmin();
  if (!authCheck.isAuthenticated) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
  if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFilename = `${Date.now()}-${originalName}`;
    
    // Create directory path
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure the uploads directory exists
    await mkdir(uploadsDir, { recursive: true });
    
    // Save the file
    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);
    
    // Return the relative path to use in your app
    const relativePath = `/uploads/${uniqueFilename}`;
    
    return NextResponse.json({ 
      success: true,
      url: relativePath 
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error during upload" },
      { status: 500 }
    );
  }
}