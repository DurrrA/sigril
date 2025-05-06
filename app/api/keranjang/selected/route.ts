import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth"; 
import { authConfig } from "@/lib/auth"; // Adjust import as needed
import { Prisma } from "@prisma/client"; // Add this import

export async function GET(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || undefined }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get IDs from query params
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');
    
    // Define where clause with proper typing
    const where: Prisma.keranjangWhereInput = { id_user: user.id };
    
    // If IDs are provided, filter by them
    if (ids) {
      const idArray = ids.split(',').map(Number);
      where.id = { in: idArray };
    }
    
    // Get cart items with related product data
    const cartItems = await prisma.keranjang.findMany({
      where,
      include: {
        barang: true
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    // Transform the data for the frontend
    const transformedItems = cartItems.map(item => ({
      id: item.id.toString(),
      barangId: item.id_barang,
      name: item.barang?.nama || "Unknown Item",
      image: item.barang?.foto ? 
        (item.barang.foto.startsWith('/') ? item.barang.foto : `/${item.barang.foto}`) : 
        "/placeholder.svg",
      price: item.barang?.harga || 0,
      quantity: item.jumlah,
      startDate: item.start_date,
      endDate: item.end_date,
      rentalDays: item.rental_days,
      subtotal: item.subtotal
    }));
    
    return NextResponse.json({
      status: "success",
      data: transformedItems
    });
  } catch (error) {
    console.error("Error fetching selected cart items:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart items" },
      { status: 500 }
    );
  }
}