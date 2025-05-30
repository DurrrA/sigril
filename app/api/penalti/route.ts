import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { z } from 'zod';

// Define validation schema for return with penalties
const returnSchema = z.object({
  rentalId: z.number(),
  condition: z.string().min(1, "Condition notes are required"),
  penalties: z.array(
    z.object({
      barangId: z.number(),
      itemName: z.string(),
      quantity: z.number(),
      amount: z.number(),
      reason: z.string(),
      applyPenalty: z.boolean()
    })
  ).optional().default([]),
  paymentInfo: z.object({
    receiptNumber: z.string().optional(),
    paymentMethod: z.string(),
    notes: z.string().optional(),
    payNow: z.boolean().default(false),
    amount: z.number().default(0)
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (!user || user.role.id !== 1) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = returnSchema.parse(body);
    
    // Get the rental record
    const rental = await prisma.sewa_req.findUnique({
      where: { id: validatedData.rentalId },
      include: { sewa_items: true }
    });
    
    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }
    
    if (rental.status !== 'confirmed' && rental.status !== 'active') {
      return NextResponse.json({ 
        error: 'Only confirmed or active rentals can be processed as returned' 
      }, { status: 400 });
    }
    
    // Filter only penalties that should be applied
    const appliedPenalties = validatedData.penalties?.filter(p => p.applyPenalty) || [];
    
    // Process the return in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update rental status
      const updatedRental = await tx.sewa_req.update({
        where: { id: validatedData.rentalId },
        data: { 
          status: 'completed',
          dikembalikan_pada: new Date(),
          has_been_inspected: true,
          penalties_applied: appliedPenalties.length > 0
        }
      });
      
      // Create penalties if any
      const createdPenalties = [];
      if (appliedPenalties.length > 0) {
        for (const penalty of appliedPenalties) {
          const newPenalty = await tx.penalti.create({
            data: {
              id_barang: penalty.barangId,
              id_user: rental.id_user,
              id_sewa: rental.id,
              total_bayar: penalty.amount,
              alasan: penalty.reason,
              status: validatedData.paymentInfo?.payNow ? 'paid' : 'unpaid',
              created_at: new Date()
            }
          });
          createdPenalties.push(newPenalty);
        }
      }
      
      // Create payment record if paying now
      let paymentRecord = null;
      if (validatedData.paymentInfo?.payNow && appliedPenalties.length > 0) {
        paymentRecord = await tx.transaksi.create({
          data: {
            id_user: rental.id_user,
            total_pembayaran: validatedData.paymentInfo.amount,
            status: 'COMPLETED',
            payment_method: validatedData.paymentInfo.paymentMethod,
            bukti_pembayaran: validatedData.paymentInfo.receiptNumber || `PENALTY-${Date.now()}.jpg`,
            tanggal_transaksi: new Date(),
            id_sewa_req: rental.id
          }
        });
      }
      
      // Also update the related transaction if it exists
      if (rental.id_transaksi) {
        await tx.transaksi.update({
          where: { id: rental.id_transaksi },
          data: { status: 'COMPLETED' }
        });
      }
      
      // Update stok for each returned item
      for (const sewaItem of rental.sewa_items) {
        const barang = await tx.barang.findUnique({
          where: { id: sewaItem.id_barang }
        });
        
        if (barang) {
          await tx.barang.update({
            where: { id: sewaItem.id_barang },
            data: {
              stok: {
                increment: sewaItem.jumlah
              }
            }
          });
        }
      }
      
      return {
        rentalId: updatedRental.id,
        status: updatedRental.status,
        penaltyCount: createdPenalties.length,
        paymentProcessed: paymentRecord !== null
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Rental successfully processed as returned',
      data: result
    });
    
  } catch (error) {
    console.error('Error processing return:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to process return',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}