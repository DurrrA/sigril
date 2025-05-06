import prisma from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth'; // Adjust the import path as necessary

const transaksiSchema = z.object({
    id_user: z.number().min(1, 'ID User is required'),
    total_pembayaran: z.number().min(0, 'Total Pembayaran is required'),
    status: z.enum(['pending', 'success', 'failed']),
    tanggal_transaksi: z.string().optional(),
    bukti_pembayaran: z.string()
});

export async function GET() {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Find the current user
      const user = await prisma.user.findUnique({
        where: { email: session.user?.email ?? "" },
        select: { id: true }
      });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Get all rental requests for this user
      const rentalRequests = await prisma.sewa_req.findMany({
        where: {
          id_user: user.id,
        },
        include: {
          sewa_items: {
            include: {
              barang: true,
            },
          },
        },
        orderBy: {
          start_date: 'desc', // Most recent first
        },
      });
  
      // Format the response
      const formattedTransactions = rentalRequests.map(request => {
        const items = request.sewa_items.map(item => ({
          id: item.id,
          name: item.barang.nama,
          quantity: item.jumlah,
          price: item.barang.harga,
          subtotal: item.harga_total,
        }));
  
        return {
          id: request.id,
          start_date: request.start_date.toISOString(),
          end_date: request.end_date.toISOString(),
          status: request.status,
          payment_status: request.payment_status,
          items: items,
          totalAmount: request.total_amount || 
                       items.reduce((sum, item) => sum + item.subtotal, 0),
          createdAt: new Date(request.start_date).toISOString(), // Use start date since there's no created_at
        };
      });
  
      return NextResponse.json({ 
        success: true, 
        data: formattedTransactions 
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to retrieve transactions" },
        { status: 500 }
      );
    }
  }

  export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = transaksiSchema.parse(body);

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
        
        // Return the proper structure including the ID
        return NextResponse.json(
            { 
                message: 'Transaksi created successfully', 
                data: newTransaksi,
                id: newTransaksi.id // Make sure ID is accessible at the top level
            },
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