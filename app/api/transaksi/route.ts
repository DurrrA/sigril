import prisma from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const transaksiSchema = z.object({
    id_user: z.number().min(1, 'ID User is required'),
    total_pembayaran: z.number().min(0, 'Total Pembayaran is required'),
    status: z.enum(['pending', 'success', 'failed']),
    tanggal_transaksi: z.string().optional(),
    bukti_pembayaran: z.string()
});

export async function GET() {
    try {
        const transaksi = await prisma.transaksi.findMany({
            include: {
                user: true
            },
        });

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = transaksiSchema.parse(body); // Validate the incoming data

        const newTransaksi = await prisma.transaksi.create({
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
            { message: 'Transaksi created successfully', data: newTransaksi },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating transaksi:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { message: 'Failed to create transaksi' },
            { status: 500 }
        );
    }
}