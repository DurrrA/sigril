import { loginIsRequiredServer, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const kategoriSchema = z.object({
    nama: z.string().min(1, "Name is required")
});

export async function GET() {
    await loginIsRequiredServer();
    await isAdmin();
    try {
        const response = {
            message: "Kategori fetched successfully",
            data: await prisma.kategori.findMany()

        }

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching kategori:", error);
        return NextResponse.json(
            { message: "Failed to fetch kategori" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    await loginIsRequiredServer();
    await isAdmin();
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
