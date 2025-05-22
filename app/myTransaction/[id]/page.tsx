"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowLeft,
  Calendar,
  X,
  Download,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Items {
  id: number
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface TransactionDetail {
  id: number
  start_date: string
  end_date: string
  status: string
  paymentStatus: string
  totalAmount: number
  Items: Items[]
  createdAt: string
  user: {
    fullname: string
    email: string
    phone: string
    address: string
  }
}

export default function TransactionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  

  // Get the transaction ID from the query parameters
  const transactionId = params?.id

  // Safe date formatting helper
  const formatDate = (dateString: string | undefined | null, formatPattern: string = "dd MMM yyyy") => {
    try {
      if (!dateString) return "-"
      return format(new Date(dateString), formatPattern, { locale: id })
    } catch (e) {
      console.error("Date formatting error:", e)
      return "-"
    }
  }

  const handleSubmitReview = async () => {
  if (rating === 0) {
    toast.error("Silakan pilih rating terlebih dahulu")
    return
  }

  try {
    setIsSubmitting(true)

    const detailedResponse = await fetch(`/api/transaksi/${transaction?.id}`, {
      credentials: 'include',
    });
    
    if (!detailedResponse.ok) {
      throw new Error('Failed to load detailed transaction data');
    }
    
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId: transaction?.id,
        rating,
        comment: reviewText
      }),
    })

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit review');
    }

    toast.success("Ulasan berhasil dikirim!")
    
    // Set the review submitted state instead of closing the modal
    setReviewSubmitted(true);
    
    // Reset review form
    setReviewText("")
    setRating(0)
  } catch (error) {
    console.error("Error submitting review:", error)
    toast.error(`Gagal mengirim ulasan: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    setIsSubmitting(false)
  }
}
const handleCloseModal = () => {
  setIsReviewModalOpen(false);
  // Reset after a short delay to ensure the animation completes before resetting
  setTimeout(() => {
    setReviewSubmitted(false);
  }, 300);
};

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      if (!transactionId) {
        toast.error("No transaction ID provided")
        router.push('/myTransaction')
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/transaksi/${transactionId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login?redirect=/myTransaction/detail?id=' + transactionId)
            return
          }
          throw new Error('Failed to load transaction details')
        }

        const data = await response.json()
        console.log('API Response:', data)

        // Get the transaction data
        const responseData = data.data || {}
        const userData = responseData.user || {}

        const formattedUserData = {
          fullname: userData.full_name || userData.nama || userData.fullname || "Guest",
          phone: userData.no_telp || userData.phone || "-",
          email: userData.email || "-",
          address: userData.alamat || "-"
        }

        // Ensure valid dates
        const now = new Date().toISOString()

        // Prepare the transaction object, naming items as "orderItems"
        const formattedTransaction: TransactionDetail = {
          id: responseData.id || 0,
          createdAt: responseData.tanggal_transaksi || responseData.created_at || responseData.createdAt || now,
          start_date: responseData.start_date || responseData.tanggal_mulai || now,
          end_date: responseData.end_date || responseData.tanggal_selesai || now,
          status: responseData.status || "pending",
          paymentStatus: responseData.payment_status || responseData.status || "pending",
          totalAmount: responseData.total_pembayaran || responseData.totalAmount || 0,
          Items: Array.isArray(responseData.items) ? responseData.items : [],
          user: formattedUserData
        }
        console.log('Formatted Transaction:', formattedTransaction)

        setTransaction(formattedTransaction)
      } catch (error) {
        console.error("Error fetching transaction details:", error)
        toast.error("Failed to load transaction details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionDetail()
  }, [transactionId, router])

  // Check if URL has review=true query param to auto-open review modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('review') === 'true' && transaction?.status?.toLowerCase() === 'completed') {
        setIsReviewModalOpen(true);
      }
    }
  }, [transaction]);

  // Get status badge color and text
  const getStatusInfo = (status: string, paymentStatus: string) => {
    console.log('Detailed Transaction Data:', paymentStatus)
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
        text: 'Menunggu Konfirmasi',
        icon: <Clock className="w-5 h-5 mr-2" />
      }
    }
    if (status === 'COMPLETED') {
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
    )
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
          <p className="text-gray-600 mb-6">
            The transaction you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link 
            href="/myTransaction"
            className="inline-flex items-center px-4 py-2 bg-[#3528AB] text-white rounded-lg hover:bg-[#2a1f8a]"
          >
            Back to My Transactions
          </Link>
        </div>
      </div>
    )
  }

  const { color, text, icon } = getStatusInfo(transaction.status, transaction.paymentStatus)
  const isCompleted = transaction.status.toLowerCase() === 'completed' || transaction.status.toLowerCase() === 'selesai';

  // Safe calculation of rental days
  let rentalDays = 0
  try {
    rentalDays = Math.ceil(
      (new Date(transaction.end_date).getTime() - new Date(transaction.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    rentalDays = rentalDays > 0 ? rentalDays : 1
  } catch (e) {
    console.error("Error calculating rental days:", e)
    rentalDays = 1
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

        {/* Order Items */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-medium text-gray-800 mb-4">
            Order Items ({transaction?.Items?.length ?? 0})
          </h2>
          {(!transaction?.Items || transaction.Items.length === 0) ? (
            <p className="text-sm text-gray-600">No items found in this order.</p>
          ) : (
            <div className="space-y-6">
              {transaction.Items.map((item) => (
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
          )}
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
        {/* Show Review button only for completed transactions */}
        {isCompleted && (
          <Button
            className="bg-[#3528AB] text-white hover:bg-[#2a1f8a] transition-colors px-8 py-2 rounded-lg flex items-center justify-center"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <Star className="h-5 w-5 mr-2" />
            Beri Ulasan
          </Button>
        )}
        
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
      
      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={handleCloseModal}>
  <DialogContent className="sm:max-w-[425px]">
    {!reviewSubmitted ? (
      <>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Beri Ulasan</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h4 className="font-medium mb-2">Order #{transaction.id}</h4>
          <p className="text-sm text-gray-500 mb-4">
            Bagaimana pengalaman anda dengan layanan kami?
          </p>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star 
                  className={`h-8 w-8 ${rating >= star 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'}`} 
                />
              </button>
            ))}
          </div>
          
          {/* Review Comment */}
          <Textarea
            placeholder="Bagikan pengalaman anda dengan produk dan layanan kami..."
            className="min-h-[120px]"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="bg-[#3528AB] hover:bg-[#2a1f8a]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : 'Kirim Ulasan'}
          </Button>
        </DialogFooter>
      </>
    ) : (
      /* Thank You Message - Animated and Eye-catching */
      <div className="py-8 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Terima Kasih!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Ulasan Anda sangat berarti bagi kami untuk terus meningkatkan layanan.
        </p>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleCloseModal}
            className="bg-[#3528AB] hover:bg-[#2a1f8a] px-8"
          >
            Tutup
          </Button>
        </div>
        
        {/* Show the rating they provided */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">Penilaian Anda:</p>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`h-5 w-5 text-yellow-400 ${star <= rating ? 'fill-yellow-400' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  )
}