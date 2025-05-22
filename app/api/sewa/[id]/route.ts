import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = Number(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Fetch the rental request and include related user data
    const rentalRequest = await prisma.sewa_req.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true, // Include the user relation
      }
    });

    if (!rentalRequest) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch the sewa items separately
    const sewaItems = await prisma.sewa_items.findMany({
      where: {
        id_sewa_req: orderId,
      },
      include: {
        barang: true,
      }
    });

    // Format the response for the client
    const formattedItems = sewaItems.map((item) => {
      const rentalDays = Math.ceil(
        (new Date(rentalRequest.end_date).getTime() - 
         new Date(rentalRequest.start_date).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      // Use the correct field names from your schema
      const price = item.barang.harga || 0;
      const subtotal = item.harga_total || (price * item.jumlah * rentalDays);

      return {
        id: item.id,
        name: item.barang.nama,
        quantity: item.jumlah,
        price: price,
        subtotal: subtotal,
      };
    });

    const totalAmount = rentalRequest.total_amount || 
                        formattedItems.reduce((sum: number, item) => sum + item.subtotal, 0);

    // Get the actual user object - handle if user relation doesn't exist
    const userData = await prisma.user.findUnique({
      where: {
        id: rentalRequest.id_user
      }
    });

    // Create response object using only fields that exist in your schema
    const response = {
      id: rentalRequest.id,
      start_date: rentalRequest.start_date,
      end_date: rentalRequest.end_date,
      status: rentalRequest.status,
      user: {
        fullname: userData?.full_name || "",
        email: userData?.email || "",
        phone: userData?.no_telp || "",
        address: userData?.alamat || "",
      },
      items: formattedItems,
      totalAmount: totalAmount,
      paymentStatus: rentalRequest.payment_status,
      createdAt: new Date(), // Use current date if no created_at field exists
    };

    return NextResponse.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, updateTransaction } = body;
    const id = parseInt(params.id);

    if (!["pending", "confirmed", "cancelled", "active", "completed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // First check if the transaction exists and get its associated sewa_req
    const transaction = await prisma.transaksi.findUnique({
      where: { id },
      include: { sewa_req: true }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (!transaction.sewa_req) {
      return NextResponse.json(
        { success: false, error: "No rental request associated with this transaction" },
        { status: 404 }
      );
    }

    // Use a transaction to ensure both updates succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the sewa_req record using the ID from the found transaction
      const updated = await tx.sewa_req.update({
        where: { id: transaction.sewa_req!.id },
        data: { 
          status,
          payment_status: status === "confirmed" ? "paid" : transaction.sewa_req!.payment_status
        },
        include: {
          user: true,
          sewa_items: {
            include: { barang: true }
          }
        }
      });

      // If requested, also update the transaction status
      if (updateTransaction) {
        await tx.transaksi.update({
          where: { id },
          data: { 
            status: status === "confirmed" ? "PAID" : 
                   status === "cancelled" ? "CANCELLED" : 
                   "UNPAID" 
          }
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: result,
      status: result.status
    });
  } catch (error) {
    console.error("Update gagal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}