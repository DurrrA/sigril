//// filepath: d:\sigril\project\sigril\app\myTransaction\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, Filter, Search, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";


interface Transaction {
  id: number;
  start_date: string;
  end_date: string;
  status: string; 
  payment_status: string;
  totalAmount: number;
  items: TransactionItem[];
  createdAt: string;
}

interface TransactionItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function MyTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setIsSearchFocused] = useState(false);

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/transaksi", { credentials: "include" });

        if (response.redirected) {
          // If redirected due to auth, go to login
          router.push("/login?callbackUrl=/myTransaction");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        setTransactions(data.data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [router]);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter !== "all" && transaction.status.toLowerCase() !== filter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.id.toString().includes(query) ||
        transaction.items?.some((item) => item.name?.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Determine status badge
  const getStatusInfo = (status: string, paymentStatus: string) => {
    if (status === "cancelled") {
      return { color: "bg-red-100 text-red-800", text: "Dibatalkan", icon: <X className="w-4 h-4 mr-1" /> };
    }
    if (paymentStatus === "pending" || paymentStatus === "unpaid") {
      return { color: "bg-yellow-100 text-yellow-800", text: "Menunggu Pembayaran", icon: <Clock className="w-4 h-4 mr-1" /> };
    }
    if (status === "completed") {
      return { color: "bg-green-100 text-green-800", text: "Selesai", icon: <CheckCircle className="w-4 h-4 mr-1" /> };
    }
    return { color: "bg-blue-100 text-blue-800", text: "Sedang Berlangsung", icon: <Clock className="w-4 h-4 mr-1" /> };
  };

  // Safely format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: id });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3528AB]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transaksi Saya</h1>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3528AB]"
            placeholder="Cari berdasarkan ID atau nama barang"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <select
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#3528AB]"
              value={filter}
              onChange={(e) => setFilter(e.target.value.toLowerCase())}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada transaksi</h3>
          <p className="text-gray-600 mb-6">Anda belum memiliki transaksi atau tidak ada transaksi yang sesuai dengan filter</p>
          <Link
            href="/produk"
            className="inline-flex items-center px-4 py-2 bg-[#3528AB] text-white rounded-lg hover:bg-[#2a1f8a]"
          >
            Mulai Menyewa
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const { color, text, icon } = getStatusInfo(transaction.status, transaction.payment_status);
            const startDate = formatDate(transaction.start_date);
            const endDate = formatDate(transaction.end_date);

            return (
              <Link
                key={transaction.id}
                href={`/myTransaction/${transaction.id}`}
                className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-800">Order #{transaction.id}</h3>
                      <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                      {icon}
                      {text}
                    </span>
                  </div>

                  <div className="border-t border-b border-gray-100 py-3 my-2">
                    <p className="text-sm text-gray-600 mb-1">
                      {transaction.items ? `${transaction.items.length} item${transaction.items.length > 1 ? "s" : ""}` : "No items"}
                    </p>
                    <div className="line-clamp-1 text-sm">
                      {transaction.items?.map((item, i) => (
                        <span key={item.id}>
                          {item.name}
                          {i < transaction.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-600">
                      {startDate} - {endDate}
                    </div>
                    <div className="font-medium">Rp {transaction.totalAmount?.toLocaleString("id-ID") || 0}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}