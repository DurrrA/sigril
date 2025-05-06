import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // You may need to install this: npm install uuid

// Create directory if it doesn't exist
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse form data with file
    const formData = await req.formData();
    const file = formData.get("paymentProof") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, JPG and PNG are allowed" },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }
    
    // Generate unique filename to prevent overwriting
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `payment_${uuidv4()}.${fileExt}`;
    
    // Define paths
    const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/payments/${fileName}`;
    
    // Ensure directory exists
    ensureDirectoryExists(uploadDir);
    
    // Convert file to buffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);
    
    // Return success with file URL
    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
      filename: fileName
    });
    
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Set body parser config to handle large files
export const config = {
  api: {
    bodyParser: false,
  },
};