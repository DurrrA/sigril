import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the schema for availability validation
const availabilitySchema = z.object({
  id_barang: z.number(),
  start_date: z.string(), 
  end_date: z.string(),   
});

export async function POST(req: NextRequest) {
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
          status: { not: "cancelled" }, 
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');
  const startDate = searchParams.get('startDate'); 
  const endDate = searchParams.get('endDate');
  
  if (!itemId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }
  
  try {
    // Get total stock of the item
    const item = await prisma.barang.findUnique({
      where: { id: Number(itemId) }
    });
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const totalStock = item.stok;
    
    // Find overlapping rentals
    const rentedItems = await prisma.sewa_items.findMany({
      where: {
        id_barang: Number(itemId),
        sewa_req: {
          status: { in: ['pending', 'confirmed', 'active'] },
          OR: [
            // Various date overlap conditions
            {
              start_date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
            {
              end_date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
            {
              AND: [
                { start_date: { lte: new Date(startDate) } },
                { end_date: { gte: new Date(endDate) } },
              ],
            },
          ],
        },
      },
    });
    
    // Calculate available quantity
    const rentedQuantity = rentedItems.reduce((total, item) => total + item.jumlah, 0);
    const availableQuantity = totalStock - rentedQuantity;
    
    return NextResponse.json({
      available: availableQuantity > 0,
      availableQuantity,
      totalStock
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}