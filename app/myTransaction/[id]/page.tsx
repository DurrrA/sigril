"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter  } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowLeft,
  Calendar,
  X,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface TransactionDetail {
  id: number
  start_date: string
  end_date: string
  status: string
  paymentStatus: string
  totalAmount: number
  items: TransactionItem[]
  createdAt: string
  user: {
    fullname: string
    email: string
    phone: string
    address: string
  }
}

interface TransactionItem {
  id: number
  name: string
  quantity: number
  price: number
  subtotal: number
}

export default function TransactionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get the transaction ID from the query parameters
  const transactionId = params?.id

  // Safe date formatting helper
  const formatDate = (dateString: string | undefined | null, formatPattern: string = "dd MMM yyyy") => {
    try {
      if (!dateString) return "-";
      return format(new Date(dateString), formatPattern, { locale: id });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "-";
    }
  };

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      if (!transactionId) {
        toast.error("No transaction ID provided")
        router.push('/myTransaction')
        return
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/transaksi/${transactionId}`, {
          credentials: 'include',
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login?redirect=/myTransaction/detail?id=' + transactionId);
            return;
          }
          throw new Error('Failed to load transaction details');
        }
  
        const data = await response.json();
        console.log('API Response:', data); // Log the full response
        
        // Get the transaction data
        const responseData = data.data || {};
        
        // Process user data with fallbacks
        const userData = responseData.user || {};
        const formattedUserData = {
          fullname: userData.full_name || userData.nama || userData.fullname || "Guest",
          phone: userData.no_telp || userData.phone || "-",
          email: userData.email || "-",
          address: userData.alamat || userData.address || "-"
        };
        
        // Ensure we have valid dates
        const now = new Date().toISOString();
        
        // Format the transaction with all necessary fields and fallbacks
        const formattedTransaction = {
          id: responseData.id || 0,
          createdAt: responseData.tanggal_transaksi || responseData.created_at || responseData.createdAt || now,
          start_date: responseData.start_date || responseData.tanggal_mulai || now,
          end_date: responseData.end_date || responseData.tanggal_selesai || now,
          status: responseData.status || "pending",
          paymentStatus: responseData.payment_status || responseData.status || "pending",
          totalAmount: responseData.total_pembayaran || responseData.totalAmount || 0,
          items: Array.isArray(responseData.items) ? responseData.items : [],
          user: formattedUserData
        };
        
        setTransaction(formattedTransaction);
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        toast.error("Failed to load transaction details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactionDetail();
  }, [transactionId, router]);

  // Get status badge color and text
  const getStatusInfo = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') {
      return {
        color: 'bg-red-100 text-red-800',
        text: 'Dibatalkan',
        icon: <X className="w-5 h-5 mr-2" />
      }
    }
    
    if (paymentStatus === 'pending' || paymentStatus === 'unpaid') {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Menunggu Pembayaran',
        icon: <Clock className="w-5 h-5 mr-2" />
      }
    }
    
    if (status === 'completed') {
      return {
        color: 'bg-green-100 text-green-800',
        text: 'Selesai',
        icon: <CheckCircle className="w-5 h-5 mr-2" />
      }
    }
    
    return {
      color: 'bg-blue-100 text-blue-800',
      text: 'Sedang Berlangsung',
      icon: <Clock className="w-5 h-5 mr-2" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Link href="/myTransaction" className="flex items-center text-sm mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Transactions
        </Link>
        
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Transaction Not Found</h3>
          <p className="text-gray-600 mb-6">The transaction you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Link 
            href="/myTransaction"
            className="inline-flex items-center px-4 py-2 bg-[#3528AB] text-white rounded-lg hover:bg-[#2a1f8a]"
          >
            Back to My Transactions
          </Link>
        </div>
      </div>
    );
  }
  
  const { color, text, icon } = getStatusInfo(transaction.status, transaction.paymentStatus);
  
  // Safe calculation of rental days
  let rentalDays = 0;
  try {
    rentalDays = Math.ceil(
      (new Date(transaction.end_date).getTime() - new Date(transaction.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    // Ensure it's a positive number
    rentalDays = rentalDays > 0 ? rentalDays : 1;
  } catch (e) {
    console.error("Error calculating rental days:", e);
    rentalDays = 1;
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Link href="/myTransaction" className="flex items-center text-sm mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Transactions
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Order #{transaction.id}
              </h1>
              <p className="text-sm text-gray-600">
                {formatDate(transaction.createdAt, "d MMMM yyyy, HH:mm")}
              </p>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${color}`}>
              {icon}
              {text}
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-medium text-gray-800 mb-4">Detail Penyewaan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Periode Sewa</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {formatDate(transaction.start_date)} - {formatDate(transaction.end_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{rentalDays} hari</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Alamat Pengiriman</p>
              <p className="font-medium">{transaction.user.fullname}</p>
              <p>{transaction.user.phone}</p>
              <p className="mt-1">{transaction.user.address}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-medium text-gray-800 mb-4">Item yang Disewa ({transaction.items.length})</h2>
          
          <div className="space-y-6">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="font-medium">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6">
          <h2 className="font-medium text-gray-800 mb-4">Ringkasan Pembayaran</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span>Rp {transaction.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 mt-4">
            <span>Total</span>
            <span className="text-[#3528AB]">
              Rp {transaction.totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          className="bg-white border border-[#3528AB] text-[#3528AB] hover:bg-[#3528AB] hover:text-white transition-colors px-8 py-2 rounded-lg flex items-center justify-center"
          onClick={() => window.print()}
        >
          <Download className="h-5 w-5 mr-2" />
          Cetak Invoice
        </button>
        
        <Link
          href="/help"
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors px-8 py-2 rounded-lg text-center"
        >
          Bantuan
        </Link>
      </div>
    </div>
  );
}