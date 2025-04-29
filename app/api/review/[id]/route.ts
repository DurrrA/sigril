import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

const reviewSchema = z.object({
  id_barang: z.number().min(1, 'ID Barang is required'),
    id_user: z.number().min(1, 'ID User is required'),
    rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
    komentar: z.string().optional(),
});

export async function PUT(request: NextRequest, { params } : { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const validatedData = reviewSchema.parse(body); // Validate the incoming data

        const updatedReview = await prisma.review.update({
            where: { id: Number((await params).id) },
            data: {
                id_barang: validatedData.id_barang,
                id_user: validatedData.id_user,
                rating: validatedData.rating,
                komentar: validatedData.komentar ?? "",
            },
            include: {
                barang: true,
                user: true,
            },
        });

        return NextResponse.json(
            { message: 'Review updated successfully', data: updatedReview },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating review:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: 'Failed to update review' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params } : { params: Promise<{ id: string }> }) {
    try {
        const deletedReview = await prisma.review.delete({
            where: { id: Number((await params).id) },
            include: {
                barang: true,
                user: true,
            },
        });

        return NextResponse.json(
            { message: 'Review deleted successfully', data: deletedReview },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { message: 'Failed to delete review' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, { params } : { params: Promise<{ id: string }> }) {
    try {
        const review = await prisma.review.findUnique({
            where: { id: Number((await params).id) },
            include: {
                barang: true,
                user: true,
            },
        });

        if (!review) {
            return NextResponse.json(
                { message: 'Review not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Review fetched successfully', data: review },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json(
            { message: 'Failed to fetch review' },
            { status: 500 }
        );
    }
}