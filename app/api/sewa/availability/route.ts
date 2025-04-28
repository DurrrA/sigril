import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the schema for availability validation
const availabilitySchema = z.object({
  id_barang: z.number(),
  start_date: z.string(), // ISO date string
  end_date: z.string(),   // ISO date string
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = availabilitySchema.parse(body);

    // Check for overlapping rental requests
    const overlappingRequests = await prisma.sewa_items.findMany({
      where: {
        id_barang: validatedData.id_barang,
        sewa_req: {
          start_date: { lte: new Date(validatedData.end_date) },
          end_date: { gte: new Date(validatedData.start_date) },
          status: { not: "cancelled" }, // Exclude cancelled requests
        },
      },
    });

    if (overlappingRequests.length > 0) {
      return NextResponse.json(
        { available: false, message: "Item is not available for the selected dates" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { available: true, message: "Item is available for the selected dates" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking availability:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}