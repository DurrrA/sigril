import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const transaksiSchema = z.object({
    id_user: z.number().min(1, 'ID User is required'),
    total_pembayaran: z.number().min(0, 'Total Pembayaran is required'),
    status: z.enum(['pending', 'success', 'failed']),
    tanggal_transaksi: z.string().optional(),
    bukti_pembayaran: z.string()
});
interface FormattedItem{
    id: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export async function GET(
    request: Request,
    context: { params: { id: string } }
  ) {
    try {
      const id = Number(context.params.id);
      
      if (isNaN(id)) {
        return NextResponse.json({ message: 'Invalid transaction ID' }, { status: 400 });
      }
      
      // Fetch transaction with user
      const transaksi = await prisma.transaksi.findUnique({
        where: { id },
        include: { user: true }
      });
      
      if (!transaksi) {
        return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
      }
  
      // Find the related sewa_req (rental request) - try multiple matching strategies
      const relatedSewaReq = await prisma.sewa_req.findFirst({
        where: { 
          id_user: transaksi.id_user,
          OR: [
            // Match by total amount
            { total_amount: transaksi.total_pembayaran },
            // If available, also try to match by date (within 1 hour of transaction)
            {
              start_date: {
                gte: new Date(new Date(transaksi.tanggal_transaksi).getTime() - 3600000) // 1 hour before
              }
            }
          ]
        },
        orderBy: { id: 'desc' }, // Get most recent matching request
        include: {
          sewa_items: {
            include: {
              barang: true
            }
          }
        }
      });
      
      // Format response data
      let formattedItems: FormattedItem[] =  [];
      let startDate = null;
      let endDate = null;
      
      // Only format items if we found a matching rental request with items
      if (relatedSewaReq && Array.isArray(relatedSewaReq.sewa_items) && relatedSewaReq.sewa_items.length > 0) {
        formattedItems = relatedSewaReq.sewa_items.map(item => ({
          id: item.id,
          name: item.barang?.nama || `Item #${item.id_barang}`,
          quantity: item.jumlah,
          price: item.barang?.harga || 0,
          subtotal: item.harga_total || (item.jumlah * (item.barang?.harga || 0))
        }));
        
        // Use rental period from the rental request
        startDate = relatedSewaReq.start_date;
        endDate = relatedSewaReq.end_date;
      }
      
      // Construct response
      const response = {
        id: transaksi.id,
        id_user: transaksi.id_user,
        total_pembayaran: transaksi.total_pembayaran,
        tanggal_transaksi: transaksi.tanggal_transaksi,
        bukti_pembayaran: transaksi.bukti_pembayaran,
        status: transaksi.status,
        user: transaksi.user,
        // Only include dates if we found them
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        // Include payment method if available
        payment_method: "Bank Transfer",
        // Only include items if we found them
        ...(formattedItems.length > 0 && { items: formattedItems })
      };
      
      console.log("Sending response:", response);
      return NextResponse.json({ 
        message: 'Transaction fetched successfully', 
        data: response 
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return NextResponse.json({ 
        message: 'Server error', 
        error: String(error) 
      }, { status: 500 });
    }
  }
export async function PUT(
  request: Request,
  context: { params: { id: string } } // Use context pattern
) {
    try {
        const body = await request.json();
        const validatedData = transaksiSchema.parse(body);

        const updatedTransaksi = await prisma.transaksi.update({
            where: { id: Number(context.params.id) },
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
            { message: 'Transaksi updated successfully', data: updatedTransaksi },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating transaksi:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { message: 'Failed to update transaksi' },
            { status: 500 }
        );
    }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } } // Use context pattern
) {
    try {
        const deletedTransaksi = await prisma.transaksi.delete({
            where: { id: Number(context.params.id) },
            include: {
                user: true
            },
        });

        return NextResponse.json(
            { message: 'Transaksi deleted successfully', data: deletedTransaksi },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting transaksi:', error);
        return NextResponse.json(
            { message: 'Failed to delete transaksi' },
            { status: 500 }
        );
    }
}