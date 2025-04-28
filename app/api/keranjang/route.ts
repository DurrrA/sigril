import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

const cartSchema = z.object({
  id_barang: z.number(),
  jumlah: z.number().min(1, "Quantity must be at least 1"),
});

export async function GET() {
  const session = await getServerSession(authConfig);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const cartItems = await prisma.keranjang.findMany({
      where: { id_user: user.id },
      include: { barang: true },
    });
    
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { id_barang, jumlah } = cartSchema.parse(body);
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const barang = await prisma.barang.findUnique({
      where: { id: id_barang },
    });
    
    if (!barang) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    
    // Check if item already in cart
    const existingCartItem = await prisma.keranjang.findFirst({
      where: {
        id_user: user.id,
        id_barang,
      },
    });
    
    if (existingCartItem) {
      // Update existing cart item
      const updatedCartItem = await prisma.keranjang.update({
        where: { id: existingCartItem.id },
        data: {
          jumlah: existingCartItem.jumlah + jumlah,
          subtotal: barang.harga * (existingCartItem.jumlah + jumlah),
        },
      });
      
      return NextResponse.json(updatedCartItem);
    }
    
    // Create new cart item
    const newCartItem = await prisma.keranjang.create({
      data: {
        id_user: user.id,
        id_barang,
        jumlah,
        subtotal: barang.harga * jumlah,
      },
    });
    
    return NextResponse.json(newCartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map(e => e.message) }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}