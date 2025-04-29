import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextRequest } from "next/server";

const reviewSchema = z.object({
    id_barang: z.number().min(1, "ID Barang is required"),
    id_user: z.number().min(1, "ID User is required"),
    rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
    komentar: z.string().optional(),
});


export async function GET() {
    try {
        const review = await prisma.review.findMany({
        include: {
            barang: true,
            user: true,
        },
        });
    
        return NextResponse.json(
        { message: "Review fetched successfully", data: review },
        { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching review:", error);
        return NextResponse.json(
        { message: "Failed to fetch review" },
        { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = reviewSchema.parse(body); // Validate the incoming data

        const newReview = await prisma.review.create({
            data: {
                id_barang: validatedData.id_barang,
                id_user: validatedData.id_user,
                rating: validatedData.rating,
                komentar: validatedData.komentar ?? "",
                createdAt: new Date(),
            },
            include: {
                barang: true,
                user: true,
            },
        });

        return NextResponse.json(
            { message: "Review created successfully", data: newReview },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating review:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { message: "Failed to create review" },
            { status: 500 }
        );
    }
}