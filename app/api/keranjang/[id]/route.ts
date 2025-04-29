import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';


const keranjangSchema = z.object({
    id_barang: z.number().min(1, 'ID Barang is required'),
    id_user: z.number().min(1, 'ID User is required'),
    jumlah: z.number().min(1, 'Jumlah is required'),
    subtotal: z.number().min(0, 'Subtotal is required'),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const validatedData = keranjangSchema.parse(body); // Validate the incoming data

        const updatedKeranjang = await prisma.keranjang.update({
            where: { id: Number((await params).id) },
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
            { message: 'Keranjang updated successfully', data: updatedKeranjang },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating keranjang:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: 'Failed to update keranjang' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const deletedKeranjang = await prisma.keranjang.delete({
            where: { id: Number((await params).id) },
            include: {
                barang: true,
                user: true,
            },
        });

        return NextResponse.json(
            { message: 'Keranjang deleted successfully', data: deletedKeranjang },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting keranjang:', error);
        return NextResponse.json(
            { message: 'Failed to delete keranjang' },
            { status: 500 }
        );
    }
}