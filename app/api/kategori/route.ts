import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const kategoriSchema = z.object({
    nama: z.string().min(1, "Name is required")
});

export async function GET() {
    try {
        const kategori = await prisma.kategori.findMany({
            include: {
                barang: true,
            },
            orderBy: {
                nama: "asc",
            },
        });

        return NextResponse.json(
            { message: "Kategori fetched successfully", data: kategori },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching kategori:", error);
        return NextResponse.json(
            { message: "Failed to fetch kategori" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const authCheck = await requireAdmin();
    if (!authCheck.isAuthenticated) {
        // Create a URL object using the current request URL as base
        return NextResponse.redirect(new URL('/forbidden', req.url));
    }
    if (authCheck.isAuthenticated && !authCheck.isAuthorized) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
    }
    try {
        const body = await req.json();
        const validatedData = kategoriSchema.parse(body); // Validate the incoming data

        const newKategori = await prisma.kategori.create({
            data: {
                nama: validatedData.nama,
            },
        });

        return NextResponse.json(
            { message: "Kategori created successfully", data: newKategori },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating kategori:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { message: "Failed to create kategori" },
            { status: 500 }
        );
    }
}
