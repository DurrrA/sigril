import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth'; // Adjust the import path as necessary


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
    
    const body = await request.json();
    // Update schema to include rental dates
    const keranjangSchema = z.object({
      id_barang: z.number().min(1, 'ID Barang is required'),
      jumlah: z.number().min(1, 'Jumlah is required'),
      startDate: z.string().datetime(), // Add validation for dates
      endDate: z.string().datetime(),
      rentalDays: z.number().min(1, 'Rental days must be at least 1')
    });
    
    const validatedData = keranjangSchema.parse(body);
    
    // Check availability before adding to cart
    const availabilityCheck = await fetch(
      `${request.nextUrl.origin}/api/sewa/availability?itemId=${validatedData.id_barang}&startDate=${validatedData.startDate}&endDate=${validatedData.endDate}`
    );
    
    if (!availabilityCheck.ok) {
      throw new Error("Couldn't verify availability");
    }
    
    const availabilityData = await availabilityCheck.json();
    if (!availabilityData.available || availabilityData.availableQuantity < validatedData.jumlah) {
      return NextResponse.json(
        { message: 'Not enough stock available for selected dates' },
        { status: 400 }
      );
    }
    
    // Get the item to calculate subtotal
    const barang = await prisma.barang.findUnique({
      where: { id: validatedData.id_barang }
    });
    
    if (!barang) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Calculate subtotal based on rental days
    const subtotal = barang.harga * validatedData.jumlah * validatedData.rentalDays;

    // Now create cart item with rental dates
    const result = await prisma.keranjang.create({
      data: {
        id_user: user.id,
        id_barang: validatedData.id_barang,
        jumlah: validatedData.jumlah,
        subtotal: subtotal,
        start_date: new Date(validatedData.startDate),
        end_date: new Date(validatedData.endDate),
        rental_days: validatedData.rentalDays
      },
      include: {
        barang: true
      }
    });

    return NextResponse.json(
      { message: 'Item added to cart successfully', data: result },
      { status: 201 }
    );
  }catch (error) {
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