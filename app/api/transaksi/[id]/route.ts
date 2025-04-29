import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest } from 'next/server';

const transaksiSchema = z.object({
    id_user: z.number().min(1, 'ID User is required'),
    total_pembayaran: z.number().min(0, 'Total Pembayaran is required'),
    status: z.enum(['pending', 'success', 'failed']),
    tanggal_transaksi: z.string().optional(),
    bukti_pembayaran: z.string()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const validatedData = transaksiSchema.parse(body); // Validate the incoming data

        const updatedTransaksi = await prisma.transaksi.update({
            where: { id: Number((await params).id) },
            data: {
                id_user: validatedData.id_user,
                total_pembayaran: validatedData.total_pembayaran,
                status: validatedData.status,
                tanggal_transaksi: new Date(validatedData.tanggal_transaksi || new Date()),
                bukti_pembayaran: validatedData.bukti_pembayaran
            },
            include: {
                user: true
            },
        });
        return NextResponse.json(
            { message: 'Transaksi updated successfully', data: updatedTransaksi },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating transaksi:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { message: 'Failed to update transaksi' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const deletedTransaksi = await prisma.transaksi.delete({
            where: { id: Number((await params).id) },
            include: {
                user: true
            },
        });

        return NextResponse.json(
            { message: 'Transaksi deleted successfully', data: deletedTransaksi },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting transaksi:', error);
        return NextResponse.json(
            { message: 'Failed to delete transaksi' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const transaksi = await prisma.transaksi.findUnique({
            where: { id: Number((await params).id) },
            include: {
                user: true
            },
        });

        if (!transaksi) {
            return NextResponse.json(
                { message: 'Transaksi not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Transaksi fetched successfully', data: transaksi },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching transaksi:', error);
        return NextResponse.json(
            { message: 'Failed to fetch transaksi' },
            { status: 500 }
        );
    }
}