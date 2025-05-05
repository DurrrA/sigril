import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth'; // Adjust the import path as necessary

const keranjangSchema = z.object({
  id_barang: z.number().min(1, 'ID Barang is required'),
  jumlah: z.number().min(1, 'Jumlah is required'),
});

// GET current user's cart items
export async function GET(request: NextRequest) {
  const authCheck = await requireAuth();
  if (!authCheck.isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Get user from session
    const session = await getServerSession(authConfig);
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? "" }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get cart items for this user only
    const keranjang = await prisma.keranjang.findMany({
      where: { id_user: user.id },
      include: {
        barang: true,
      },
    });

    return NextResponse.json(
      { message: 'Keranjang fetched successfully', data: keranjang },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching keranjang:', error);
    return NextResponse.json(
      { message: 'Failed to fetch keranjang' },
      { status: 500 }
    );
  }
}

// Create/add item to cart
export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (!authCheck.isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const body = await request.json();
    const validatedData = keranjangSchema.parse(body);

    // Get current user
    const session = await getServerSession(authConfig);
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? "" }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify product exists and is in stock
    const barang = await prisma.barang.findUnique({
      where: { id: validatedData.id_barang }
    });

    if (!barang) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    if (barang.stok < validatedData.jumlah) {
      return NextResponse.json(
        { message: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Calculate correct subtotal
    const subtotal = barang.harga * validatedData.jumlah;

    // Check if this product is already in cart
    const existingCartItem = await prisma.keranjang.findFirst({
      where: {
        id_barang: validatedData.id_barang,
        id_user: user.id
      }
    });

    let result;
    if (existingCartItem) {
      // Update existing cart item quantity
      result = await prisma.keranjang.update({
        where: { id: existingCartItem.id },
        data: {
          jumlah: existingCartItem.jumlah + validatedData.jumlah,
          subtotal: existingCartItem.subtotal + subtotal
        },
        include: { barang: true }
      });
    } else {
      // Create new cart item
      result = await prisma.keranjang.create({
        data: {
          id_barang: validatedData.id_barang,
          id_user: user.id,
          jumlah: validatedData.jumlah,
          subtotal: subtotal,
        },
        include: { barang: true }
      });
    }

    return NextResponse.json(
      { message: 'Item added to cart successfully', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}