import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define interfaces for the response data
interface FormattedItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

// Schema for update requests
const updateSchema = z.object({
    status: z.string().optional(),
    bukti_pembayaran: z.string().optional(),
    payment_method: z.string().optional()
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Optional: Add authentication check
        
        /* Uncomment to enforce authentication
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        */
        
        const id = Number(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
        }
        
        // Fetch transaction with user and directly related sewa_req
        const transaction = await prisma.transaksi.findUnique({
            where: { id: Number(params.id) },
            include: { 
                user: true,
                sewa_req: {
                    include: {
                        sewa_items: {
                            include: {
                                barang: true
                            }
                        }
                    }
                }
            }
        });
        const sewaReq = await prisma.sewa_req.findUnique({
            where: { id: transaction?.id },
            include: {
                sewa_items: {
                    include: {
                        barang: true
                    }
                }
            }
        });
        console.log(sewaReq);
        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }
        console.log(transaction);
        // Log for debugging
        console.log(`Found transaction #${transaction.id} with ${transaction.sewa_req ? 1 : 0} sewa_req`);
        
        // Format response data
        let formattedItems: FormattedItem[] = [];
        if ((sewaReq?.sewa_items?.length ?? 0) > 0) {
            formattedItems = sewaReq!.sewa_items!.map(item => ({
                id: item.id,
                name: item.barang?.nama || `Item #${item.id_barang}`,
                quantity: item.jumlah,
                price: item.barang?.harga || 0,
                subtotal: item.harga_total || (item.jumlah * (item.barang?.harga || 0))
            }));
        }
        const response = {
            id: transaction.id,
            tanggal_transaksi: transaction.tanggal_transaksi,
            start_date: sewaReq?.start_date,
            end_date: sewaReq?.end_date,
            status: transaction.status,
            payment_status: transaction.sewa_req?.payment_status || transaction.status,
            total_pembayaran: transaction.total_pembayaran,
            payment_method: transaction.payment_method || "Bank Transfer",
            bukti_pembayaran: transaction.bukti_pembayaran || "",
            items: formattedItems,
            user: {
                full_name: transaction.user.full_name || transaction.user.username,
                email: transaction.user.email,
                no_telp: transaction.user.no_telp,
                alamat: transaction.user.alamat || "Alamat tidak tersedia"
            }
        };
        
        // Return the response
        return NextResponse.json({ data: response }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return NextResponse.json({ 
            error: "Failed to fetch transaction",
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
        }
        
        // Check if transaction exists
        const existingTransaction = await prisma.transaksi.findUnique({
            where: { id }
        });
        
        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }
        
        // Parse and validate request body
        const body = await request.json();
        const validatedData = updateSchema.parse(body);
        
        // Update transaction
        const updatedTransaction = await prisma.transaksi.update({
            where: { id },
            data: {
                status: validatedData.status,
                bukti_pembayaran: validatedData.bukti_pembayaran,
                payment_method: validatedData.payment_method
            },
            include: {
                user: true,
                sewa_req: true
            }
        });
        
        return NextResponse.json({
            data: updatedTransaction,
            message: 'Transaction updated successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating transaction:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation error',
                details: error.errors
            }, { status: 400 });
        }
        
        return NextResponse.json({ 
            error: 'Failed to update transaction'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
        }
        
        // Check if transaction exists
        const existingTransaction = await prisma.transaksi.findUnique({
            where: { id }
        });
        
        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }
        
        // Delete transaction
        const deletedTransaction = await prisma.transaksi.delete({
            where: { id },
            include: {
                user: true
            }
        });
        
        return NextResponse.json({
            data: deletedTransaction,
            message: 'Transaction deleted successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({
            error: 'Failed to delete transaction',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}