import {  NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET() {
  try {
    const transaksi = await prisma.transaksi.findMany({
      include: {
        user: true,
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

    const data = transaksi.map((tx) => ({
      id: tx.id,
      user: {
        username: tx.user.username,
        email: tx.user.email,
        phone: tx.user.no_telp || "",
        address: tx.user.alamat || "",
      },
      tanggal_transaksi: tx.tanggal_transaksi?.toISOString?.() || "",
      status: tx.status,
      total: tx.total_pembayaran,
      sewa_req: tx.sewa_req
        ? {
            id: tx.sewa_req.id,
            start_date: tx.sewa_req.start_date?.toISOString?.() || "",
            end_date: tx.sewa_req.end_date?.toISOString?.() || "",
            status: tx.sewa_req.status,
            payment_status: tx.sewa_req.payment_status,
            items: tx.sewa_req.sewa_items.map((item) => ({
              id: item.id,
              name: item.barang?.nama || `Item #${item.id_barang}`,
              quantity: item.jumlah,
              price: item.barang?.harga || 0,
              subtotal: item.harga_total || (item.jumlah * (item.barang?.harga || 0)),
            })),
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Failed to fetch transaksi admin:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
  }
}