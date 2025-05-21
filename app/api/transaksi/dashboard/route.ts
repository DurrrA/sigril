import prisma from "@/lib/prisma"; // Adjust the import based on your project structure
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get recent orders (limit to 5)
    const recentOrders = await prisma.transaksi.findMany({
      take: 5,
      orderBy: {
        tanggal_transaksi: 'desc'
      },
      include: {
        user: {
          select: {
            username: true
          }
        },
        sewa_req: true
      }
    });

    // Calculate aggregated statistics
    const totalUsers = await prisma.user.count({
      where: { role_id: 2 } // USER role id
    });

    const totalOrders = await prisma.transaksi.count();

    // Sum up all confirmed transactions
    const revenueResult = await prisma.transaksi.aggregate({
      _sum: { total_pembayaran: true },
      where: { status: "PAID" }
    });
    const totalRevenue = revenueResult._sum.total_pembayaran || 0;

    // Count active rentals (those with 'active' status)
    const activeRentals = await prisma.sewa_req.count({
      where: { status: "active" }
    });

    // Format data for the dashboard
    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      username: order.user?.username ?? "",
      date: order.tanggal_transaksi,
      status: order.status,
      amount: order.total_pembayaran
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        activeRentals,
        recentOrders: formattedOrders
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}