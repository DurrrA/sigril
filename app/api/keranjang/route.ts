import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

const keranjangSchema = z.object({
  id_barang: z.number().min(1, 'ID Barang is required'),
  id_user: z.number().min(1, 'ID User is required'),
  jumlah: z.number().min(1, 'Jumlah is required'),
  subtotal: z.number().min(0, 'Subtotal is required'),
});

export async function GET() {
  try {
    const keranjang = await prisma.keranjang.findMany({
      include: {
        barang: true,
        user: true,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = keranjangSchema.parse(body); // Validate the incoming data

    const newKeranjang = await prisma.keranjang.create({
      data: {
        id_barang: validatedData.id_barang,
        id_user: validatedData.id_user,
        jumlah: validatedData.jumlah,
        subtotal: validatedData.subtotal,
      },
      include: {
        barang: true,
        user: true,
      },
    });

    return NextResponse.json(
      { message: 'Keranjang created successfully', data: newKeranjang },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating keranjang:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create keranjang' },
      { status: 500 }
    );
  }
}