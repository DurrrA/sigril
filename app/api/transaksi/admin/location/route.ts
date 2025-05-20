import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Check if user is admin
    // Fetch all transactions where user has location data
    const transactions = await prisma.transaksi.findMany({
      where: {
        user: {
          location_lat: { not: null },
          location_long: { not: null }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            no_telp: true,
            alamat: true,
            location_lat: true,
            location_long: true
          }
        },
        sewa_req: {
          include: {
            sewa_items: {
              include: { barang: true }
            }
          }
        }
      },
      orderBy: { id: "desc" }
    });

    const formattedData = transactions.map(tx => {
      const items = tx.sewa_req?.sewa_items.map(item => ({
        id: item.id,
        name: item.barang?.nama || `Item #${item.id_barang}`,
        quantity: item.jumlah,
        price: item.barang?.harga || 0,
        subtotal: item.harga_total || (item.jumlah * (item.barang?.harga || 0))
      })) || [];

      return {
        id: tx.id,
        user: {
          id: tx.user.id,
          username: tx.user.username || "User",
          email: tx.user.email,
          phone: tx.user.no_telp || "No phone provided",
          address: tx.user.alamat || "No address provided",
          location_lat: tx.user.location_lat,
          location_long: tx.user.location_long
        },
        tanggal_transaksi: tx.tanggal_transaksi?.toISOString() || new Date().toISOString(),
        start_date: tx.sewa_req?.start_date?.toISOString() || null,
        end_date: tx.sewa_req?.end_date?.toISOString() || null,
        status: tx.status,
        totalAmount: tx.total_pembayaran,
        items: items
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error("Failed to fetch transaction locations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}