import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type SewaWithRelasi = Prisma.sewa_reqGetPayload<{
  include: {
    user: true;
    sewa_items: {
      include: {
        barang: true;
      };
    };
  };
}>;

export async function GET(req: NextRequest) {
  try {
    const sewaList: SewaWithRelasi[] = await prisma.sewa_req.findMany({
      include: {
        user: true,
        sewa_items: {
          include: {
            barang: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const data = sewaList.map((sewa) => ({
      id: sewa.id,
      start_date: sewa.start_date.toISOString(),
      end_date: sewa.end_date.toISOString(),
      status: sewa.status,
      user: {
        username: sewa.user.username,
        email: sewa.user.email,
        phone: sewa.user.no_telp,
        address: sewa.user.alamat,
      },
      items: sewa.sewa_items.map((item) => ({
        id: item.id,
        name: item.barang.nama,
        quantity: item.jumlah,
        price: item.harga_total,
        subtotal: item.harga_total, // jika sudah dikalkulasi
      })),
      totalAmount: sewa.total_amount ?? sewa.sewa_items.reduce((total, item) => total + item.harga_total, 0),
      paymentStatus: sewa.payment_status,
      createdAt: sewa.end_date.toISOString(), // fallback pakai end_date untuk display waktu
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error saat mengambil data sewa:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data sewa" },
      { status: 500 }
    );
  }
}
