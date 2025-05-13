"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Home, Loader2, ChevronLeft , PrinterIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Transaction } from "@/interfaces/transaksi.interface";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetails {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentProof: string | null;
  createdAt: string;
  transactionCode: string;
  user: {
    fullname: string;
    phone: string;
    email: string;
    address: string;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const orderId = searchParams?.get("orderId");

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        toast.error("No order ID provided");
        router.push("/myTransaction");
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/transaksi/${orderId}`, {
          credentials: 'include'
        });
        console.log("Raw response status:", response.status)
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response (${response.status}):`, errorText);
          try {
            const errorJson = JSON.parse(errorText);
            console.error("Parsed error:", errorJson);
            throw new Error(errorJson.error || `Error: ${response.status}`);
          } catch (e) {
            console.error("Failed to parse error response:", e);
            throw new Error(`Error: ${response.status}`);
          }
        }
        
        
        // Get the transaction with rental details
        const result = await response.json();
        console.log("API response full data:", JSON.stringify(result, null, 2));
      
        const transactionData = result.data as Transaction;
        console.log("Transaction items:", transactionData.items);
        
        // Format the data for the receipt
        setOrderDetails({
          id: transactionData.id,
          start_date: transactionData.start_date || new Date().toISOString(),
          end_date: transactionData.end_date || new Date().toISOString(),
          status: transactionData.status,
          items: transactionData.items || [],
          totalAmount: transactionData.total_pembayaran,
          paymentMethod: transactionData.payment_method || 'Transfer',
          paymentProof: transactionData.bukti_pembayaran,
          createdAt: transactionData.tanggal_transaksi,
          transactionCode: `TRX-${transactionData.id}`,
          user: {
            fullname: transactionData.user?.full_name || transactionData.user?.username || '',
            phone: transactionData.user?.no_telp || '',
            email: transactionData.user?.email || '',
            address: transactionData.user?.alamat || '',
          }
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load transaction details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderId, router]);
  
  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-[#3528AB]" />
        </div>
      </div>
    );
  }
  
  if (!orderDetails) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Transaction Not Found</h2>
          <p className="mb-6">We couldn&apos;t find the transaction you&apos;re looking for.</p>
          <Link href="/myTransaction">
            <Button>View My Transactions</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Safe calculation of rental days
  let rentalDays = 0;
  try {
    rentalDays = Math.ceil(
      (new Date(orderDetails.end_date).getTime() - new Date(orderDetails.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    // Ensure it's a positive number
    rentalDays = rentalDays > 0 ? rentalDays : 1;
  } catch (e) {
    console.error("Error calculating rental days:", e);
    rentalDays = 1;
  }

  // Safe date formatting helper
  const formatDate = (dateString: string | undefined | null, formatPattern: string = 'dd MMM yyyy') => {
    try {
      if (!dateString) return '-';
      return format(new Date(dateString), formatPattern, { locale: id });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "-";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Non-printing navigation */}
      <div className="print:hidden mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/myTransaction" className="flex items-center text-sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Transactions
          </Link>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintReceipt} className="flex items-center">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            
            <Link href="/">
              <Button className="flex items-center bg-[#3528AB] hover:bg-[#2a1f8a]">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Success message */}
      <div className="text-center mb-12 print:mb-6 print:text-black">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600">
          Your order #{orderDetails.id} has been confirmed.
        </p>
      </div>
      
      {/* Receipt card */}
      <div className="bg-white rounded-lg border shadow-sm p-6 lg:p-8 print:shadow-none print:border-none" id="receipt">
        <div className="flex justify-between items-start mb-8 print:mb-6">
          <div>
            <h2 className="text-xl font-bold">RECEIPT</h2>
            <p className="text-sm text-gray-500">Order #{orderDetails.id}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Date:</div>
            <div className="text-sm text-gray-600">{formatDate(orderDetails.createdAt)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Customer Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {orderDetails.user.fullname}</p>
              <p><span className="font-medium">Email:</span> {orderDetails.user.email}</p>
              <p><span className="font-medium">Phone:</span> {orderDetails.user.phone || '-'}</p>
              <p><span className="font-medium">Address:</span> {orderDetails.user.address || '-'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Rental Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Rental Period:</span> {formatDate(orderDetails.start_date)} - {formatDate(orderDetails.end_date)}</p>
              <p><span className="font-medium">Duration:</span> {rentalDays} days</p>
              <p><span className="font-medium">Payment Method:</span> {orderDetails.paymentMethod}</p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={
                    orderDetails.status === "completed" || orderDetails.status === "paid"
                      ? "text-green-600 font-medium"
                      : orderDetails.status === "pending" || orderDetails.status === "unpaid"
                      ? "text-yellow-600 font-medium"
                      : "text-gray-600 font-medium"
                  }
                >
                  {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Order Items - FIXED: now using orderDetails.items instead of orderDetails.data.items */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-800 mb-4">Order Items</h3>
          <div className="border-t border-b border-gray-200">
            <div className="grid grid-cols-12 py-2 text-sm font-medium text-gray-700">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>
            
            {orderDetails.items && orderDetails.items.length > 0 ? (
              // Map through items directly from orderDetails.items
              orderDetails.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 py-3 text-sm border-t border-gray-100">
                  <div className="col-span-6">{item.name}</div>
                  <div className="col-span-2 text-right">Rp {item.price.toLocaleString('id-ID')}</div>
                  <div className="col-span-1 text-center">{item.quantity}</div>
                  <div className="col-span-3 text-right font-medium">Rp {item.subtotal.toLocaleString('id-ID')}</div>
                </div>
              ))
            ) : (
              // Display a message when there are no items
              <div className="grid grid-cols-12 py-3 text-sm border-t border-gray-100">
                <div className="col-span-12 text-center text-gray-500">No items found</div>
              </div>
            )}
            
            <div className="grid grid-cols-12 py-3 border-t border-gray-100 font-medium">
              <div className="col-span-9 text-right">Total</div>
              <div className="col-span-3 text-right">Rp {orderDetails.totalAmount.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>
        
        {/* Notes and Policies */}
        <div className="text-sm text-gray-600 space-y-2 print:text-gray-800">
          <p>Please keep this receipt for your records.</p>
          <p>For any questions, please contact our customer service at support@kenamplan.com</p>
          <p className="text-xs print:text-gray-600">Kenam Plan Bogor © {new Date().getFullYear()}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center mt-8 print:hidden">
        <Link href="/myTransaction">
          <Button variant="default" className="bg-[#3528AB] hover:bg-[#2a1f8a]">
            View My Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}