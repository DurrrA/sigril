import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the schema for rental request validation
const rentalRequestSchema = z.object({
  id_user: z.number(),
  start_date: z.string(), // ISO date string
  end_date: z.string(),   // ISO date string
  items: z.array(
    z.object({
      id_barang: z.number(),
      jumlah: z.number().min(1, "Jumlah must be at least 1"),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = rentalRequestSchema.parse(body);

    // Create the rental request
    const rentalRequest = await prisma.sewa_req.create({
      data: {
        id_user: validatedData.id_user,
        start_date: new Date(validatedData.start_date),
        end_date: new Date(validatedData.end_date),
        status: "pending",
        sewa_items: {
          create: validatedData.items.map((item) => ({
            id_barang: item.id_barang,
            jumlah: item.jumlah,
            harga_total: 0, // You can calculate the total price here
          })),
        },
      },
      include: {
        sewa_items: true,
      },
    });

    return NextResponse.json(rentalRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating rental request:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create rental request" },
      { status: 500 }
    );
  }
}