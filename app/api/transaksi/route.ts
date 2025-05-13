//// filepath: d:\sigril\project\sigril\app\api\transaksi\route.ts
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth'; // Adjust as needed

// Extended schema to include sewa_req info and items
// Adjust field names/types as needed for your data structure
const transactionWithSewaSchema = z.object({
  id_user: z.number().min(1, 'ID User is required'),
  id_sewa_req: z.number().optional(),
  total_pembayaran: z.number().min(0, 'Total Pembayaran is required'),
  status: z.enum(['pending', 'success', 'failed']),
  tanggal_transaksi: z.string().optional(),
  bukti_pembayaran: z.string(),
  payment_method: z.string().optional(),

  // Fields below are used to create / update sewa_req:
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  items: z
    .array(
      z.object({
        id_barang: z.number(),
        jumlah: z.number(),
        price: z.number().optional(),
        subtotal: z.number().optional(),
        name: z.string().optional(),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the current user or throw
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email ?? '' },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all rental requests for this user
    const rentalRequests = await prisma.sewa_req.findMany({
      where: { id_user: user.id },
      include: {
        sewa_items: { include: { barang: true } },
      },
      orderBy: { start_date: 'desc' },
    });

    // Format the response
    const formattedTransactions = rentalRequests.map((request) => {
      const items = request.sewa_items.map((item) => ({
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
        items,
        totalAmount:
          request.total_amount || items.reduce((sum, i) => sum + i.subtotal, 0),
        createdAt: request.start_date.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = transactionWithSewaSchema.parse(body);

    // 1) Create Transaksi
    const newTransaksi = await prisma.transaksi.create({
      data: {
        id_user: validatedData.id_user,
        id_sewa_req: validatedData.id_sewa_req, // Might be null if new
        total_pembayaran: validatedData.total_pembayaran,
        status: validatedData.status,
        tanggal_transaksi: validatedData.tanggal_transaksi
          ? new Date(validatedData.tanggal_transaksi)
          : new Date(),
        bukti_pembayaran: validatedData.bukti_pembayaran,
        payment_method: validatedData.payment_method ?? null,
      },
      include: {
        user: true,
      },
    });

    let createdSewaReq = null;

    // 2) If no existing id_sewa_req was passed, create a new one
    //    If an id_sewa_req was passed, you could optionally update it
    if (!validatedData.id_sewa_req) {
      const newSewaReq = await prisma.sewa_req.create({
        data: {
          id_user: validatedData.id_user,
          id_transaksi: newTransaksi.id,
          start_date: validatedData.start_date
            ? new Date(validatedData.start_date)
            : new Date(),
          end_date: validatedData.end_date
            ? new Date(validatedData.end_date)
            : new Date(),
          status: 'pending', // or validatedData.status, up to you
          payment_status: validatedData.status === 'success' ? 'paid' : 'unpaid',
          total_amount: validatedData.total_pembayaran,
          sewa_items: {
            create:
              validatedData.items?.map((item) => ({
                id_barang: item.id_barang,
                jumlah: item.jumlah,
                harga_total: item.subtotal ?? item.price ?? 0,
              })) || [],
          },
        },
        include: {
          sewa_items: true,
        },
      });
      createdSewaReq = newSewaReq;
    } else {
      // Optional: if you want to update an existing sewa_req or sewa_items
      // You could do that here. For example:
      //         const updatedSewaReq = await prisma.sewa_req.update({...})
    }

    return NextResponse.json(
      {
        message: 'Transaksi created successfully',
        data: newTransaksi,
        sewa_req: createdSewaReq,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaksi:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 422 });
    }
    return NextResponse.json(
      { message: 'Failed to create transaksi' },
      { status: 500 }
    );
  }
}