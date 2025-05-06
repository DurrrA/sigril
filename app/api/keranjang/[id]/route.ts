import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth'; // Adjust the import path as necessary
import { NextRequest } from 'next/server';

const keranjangUpdateSchema = z.object({
  jumlah: z.number().min(1, 'Quantity must be at least 1'),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if cart item exists and belongs to current user
    const cartItem = await prisma.keranjang.findUnique({
      where: { id: Number(params.id) },
      include: { barang: true }
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: 'Cart item not found' },
        { status: 404 }
      );
    }

    if (cartItem.id_user !== user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to modify this cart item' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = keranjangUpdateSchema.parse(body);

    // Verify product has enough stock
    if (cartItem.barang.stok < validatedData.jumlah) {
      return NextResponse.json(
        { message: 'Not enough stock available' },
        { status: 400 }
      );
    }

    // Calculate correct subtotal
    const subtotal = cartItem.barang.harga * validatedData.jumlah;

    // Update cart item
    const updatedCartItem = await prisma.keranjang.update({
      where: { id: Number(params.id) },
      data: {
        jumlah: validatedData.jumlah,
        subtotal: subtotal
      },
      include: {
        barang: true,
      },
    });

    return NextResponse.json(
      { message: 'Cart item updated successfully', data: updatedCartItem },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating cart item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
    request: NextRequest,
    context : { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      // Correctly access params.id as a string and convert to number
      const id = Number(context.params.id);
      
      if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      }
  
      // Check if cart item exists and belongs to current user
      const cartItem = await prisma.keranjang.findUnique({
        where: { id: id }
      });
  
      if (!cartItem) {
        return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
      }
  
      // Verify ownership
      const user = await prisma.user.findUnique({
        where: { email: session.user?.email ?? "" }
      });
  
      if (!user || cartItem.id_user !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
  
      // Delete the cart item
      await prisma.keranjang.delete({
        where: { id: id }
      });
  
      return NextResponse.json(
        { message: "Item removed from cart" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting cart item:", error);
      return NextResponse.json(
        { error: "Failed to remove item from cart" },
        { status: 500 }
      );
    }
  }

  