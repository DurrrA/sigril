"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  ChevronRight, 
  Filter, 
  Search,
  X,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Interface definitions
interface Transaction {
  id: number
  start_date: string
  end_date: string
  status: string
  payment_status: string
  totalAmount: number
  items: TransactionItem[]
  createdAt: string
}

interface TransactionItem {
  id: number
  name: string
  quantity: number
  price: number
  subtotal: number
}

export default function MyTransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, ongoing, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/transaksi', {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login?redirect=/my-transactions')
            return
          }
          throw new Error('Failed to load transactions')
        }

        const data = await response.json()
        setTransactions(data.data || [])
        console.log('Fetched transactions:', data.data)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        toast.error('Failed to load your transactions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [router])

  // Filter transactions based on selected filter and search query
  const filteredTransactions = transactions.filter(transaction => {
    // First apply status filter
    if (filter !== 'all' && transaction.status.toLowerCase() !== filter) {
      return false
    }
    
    // Then apply search query if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      // Search by transaction ID or item names
      return (
        transaction.id.toString().includes(query) ||
        transaction.items.some(item => item.name.toLowerCase().includes(query))
      )
    }
    
    return true
  })

  // Get status badge color and text
  const getStatusInfo = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') {
      return {
        color: 'bg-red-100 text-red-800',
        text: 'Dibatalkan',
        icon: <X className="w-4 h-4 mr-1" />
      }
    }
    
    if (paymentStatus === 'pending' || paymentStatus === 'unpaid') {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Menunggu Pembayaran',
        icon: <Clock className="w-4 h-4 mr-1" />
      }
    }
    
    if (status === 'completed') {
      return {
        color: 'bg-green-100 text-green-800',
        text: 'Selesai',
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      }
    }
    
    return {
      color: 'bg-blue-100 text-blue-800',
      text: 'Sedang Berlangsung',
      icon: <Clock className="w-4 h-4 mr-1" />
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM yyyy', { locale: id })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transaksi Saya</h1>
      
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className={`relative flex-1 ${isSearchFocused ? 'ring-2 ring-[#3528AB]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
        
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-[#3528AB]"
            >
              <option value="all">Semua Status</option>
              <option value="ongoing">Sedang Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
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
            href="/products"
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
                      <h3 className="font-medium text-gray-800">
                        Order #{transaction.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(transaction.createdAt), 'd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                      {icon}
                      {text}
                    </span>
                  </div>
                  
                  <div className="border-t border-b border-gray-100 py-3 my-2">
                    <p className="text-sm text-gray-600 mb-1">
                      {transaction.items.length} item
                      {transaction.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="line-clamp-1 text-sm">
                      {transaction.items.map((item, i) => (
                        <span key={item.id}>
                          {item.name}
                          {i < transaction.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm mt-2">
                      <span className="text-gray-600">Periode Sewa:</span>{' '}
                      <span className="font-medium">{startDate} - {endDate}</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-medium">Total:</span>
                    <div className="flex items-center">
                      <span className="font-bold text-[#3528AB]">
                        Rp {transaction.totalAmount.toLocaleString('id-ID')}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  )
}