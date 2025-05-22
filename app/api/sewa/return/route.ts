import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

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
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
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
      return NextResponse.json({ 
        success: false, 
        error: 'Rental not found' 
      }, { status: 404 });
    }
    
    if (rental.status !== 'confirmed' && rental.status !== 'active') {
      return NextResponse.json({ 
        success: false,
        error: 'Only confirmed or active rentals can be processed as returned' 
      }, { status: 400 });
    }
    
    // Filter only penalties that should be applied
    const appliedPenalties = validatedData.penalties?.filter(p => p.applyPenalty) || [];
    
    // Use a transaction to ensure all operations are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Update the rental record
      const updatedRental = await tx.sewa_req.update({
        where: { id: rental.id },
        data: {
          status: 'completed',
          dikembalikan_pada: new Date(),
          penalties_applied: appliedPenalties.length > 0,
          has_been_inspected: true
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
      
      return {
        rental: updatedRental,
        penalties: createdPenalties,
        payment: paymentRecord
      };
    });
    
    // Add success: true to the response
    return NextResponse.json({
      success: true,
      message: 'Rental return processed successfully',
      data: result
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing rental return:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: error.errors.map(e => e.message).join(', ') 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process rental return' 
    }, { status: 500 });
  }
}