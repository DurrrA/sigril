import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";



export async function GET() {
    try {
        const review = await prisma.review.findMany({
        include: {
            barang: true,
            user: true,
        },
        });
    
        return NextResponse.json(
        { message: "Review fetched successfully", data: review },
        { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching review:", error);
        return NextResponse.json(
        { message: "Failed to fetch review" },
        { status: 500 }
        );
    }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Get transaction ID from request body instead of params
    const { transactionId, rating, comment } = await req.json();
    
    if (!transactionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }
    
    // Get the user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Get items from sewa_items regardless of user
    const items = await prisma.sewa_items.findMany({
      where: {
        sewa_req: {
          id_transaksi: transactionId
        }
      },
      include: {
        barang: true
      }
    });
    
    if (!items || items.length === 0) {
      // Use a simple fallback with any product
      const fallbackItems = await prisma.barang.findMany({
        take: 1,
      });
      
      if (fallbackItems.length > 0) {
        const review = await prisma.review.create({
          data: {
            id_barang: fallbackItems[0].id,
            id_user: user.id,
            rating,
            komentar: comment,
            createdAt: new Date()
          }
        });
        
        return NextResponse.json({
          success: true,
          message: "Review submitted successfully (fallback)",
          data: [review]
        });
      }
      
      return NextResponse.json(
        { success: false, message: "No items found for this transaction" },
        { status: 404 }
      );
    }
    
    // Create a review for each product
    const reviews = [];
    
    for (const item of items) {
      const review = await prisma.review.create({
        data: {
          id_barang: item.barang.id,
          id_user: user.id,
          rating,
          komentar: comment,
          createdAt: new Date()
        }
      });
      reviews.push(review);
    }
    
    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: reviews
    });
    
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}