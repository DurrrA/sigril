"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Loader2, Calendar, Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { TransactionResponse, Transaction, User } from "@/interfaces/transaksi.interface";

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
        
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        
        // Use the TransactionResponse interface
        const data = await response.json() as TransactionResponse;
        console.log("Raw API response:", data);
        
        // Get the transaction data
        const transaction: Transaction = data.data;
        
        // we need to create a default one based on total payment
        const defaultItem: OrderItem = {
          id: 1,
          name: 'Rental Service',
          quantity: 1,
          price: transaction.total_pembayaran,
          subtotal: transaction.total_pembayaran
        };
        
        // Map user data from Transaction.user to our OrderDetails.user format
        const userData: User = transaction.user;
        const formattedUserData = {
          fullname: userData.full_name,
          phone: userData.no_telp || "-",
          email: userData.email || "-",
          address: userData.alamat || "-"
        };
        
        // Create OrderDetails object from Transaction
        const processedData: OrderDetails = {
          id: transaction.id,
          createdAt: transaction.tanggal_transaksi,
          // Use current date + 7 days as default rental period if not available
          start_date: transaction.start_date || new Date().toISOString(),
          end_date: transaction.end_date || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          items: transaction.items || [defaultItem], // Use default item if no items array
          status: transaction.status,
          totalAmount: transaction.total_pembayaran,
          paymentMethod: transaction.payment_method || "Bank Transfer",
          paymentProof: transaction.bukti_pembayaran || null,
          transactionCode: transaction.kode_transaksi || `TRX-${Date.now().toString().slice(-8)}-${transaction.id}`,
          user: formattedUserData
        };
        
        setOrderDetails(processedData);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
            <p className="mt-4 text-gray-600">Loading your receipt...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!orderDetails) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="mb-4 text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn&apos;t find details for this order.</p>
          <Link href="/myTransaction">
            <Button>View Your Transactions</Button>
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
  const formatDate = (dateString: string | undefined | null, formatPattern: string) => {
    try {
      if (!dateString) return "-";
      return format(new Date(dateString), formatPattern);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "-";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      {/* Non-printing navigation */}
      <div className="print:hidden mb-8">
        <Link href="/myTransaction" className="flex items-center text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          View All Orders
        </Link>
      </div>
      
      {/* Success message */}
      <div className="text-center mb-12 print:mb-6 print:text-black">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 print:bg-white rounded-full p-3">
            <CheckCircle size={48} className="text-green-600 print:text-gray-800" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Your booking has been confirmed and is waiting for approval.</p>
      </div>
      
      {/* Receipt card */}
      <div className="bg-white rounded-lg border shadow-sm p-6 lg:p-8 print:shadow-none print:border-none" id="receipt">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Receipt</h2>
            <p className="text-sm text-gray-600">Order #{orderDetails.id}</p>
            <p className="text-sm text-gray-600">
              {orderDetails.transactionCode || `TRX-${new Date().getTime().toString().slice(-8)}-${orderDetails.id}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Date</p>
            <p className="text-sm text-gray-600">
              {formatDate(orderDetails.createdAt, "dd MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>
        
        {/* Customer information */}
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-800">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{orderDetails.user?.fullname || "Guest"}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact</p>
              <p className="font-medium">{orderDetails.user?.phone || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{orderDetails.user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-medium">{orderDetails.user?.address || "-"}</p>
            </div>
          </div>
        </div>
        
        {/* Rental details */}
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-gray-800">Rental Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-600">Rental Period</p>
                <p className="font-medium">
                  {formatDate(orderDetails.start_date, "dd MMM yyyy")} - {formatDate(orderDetails.end_date, "dd MMM yyyy")}
                </p>
                <p className="text-gray-500 text-xs">{rentalDays} days</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium uppercase text-amber-600 print:text-gray-800">
                  {orderDetails.status}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShoppingBag className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-medium">
                  {orderDetails.paymentMethod || "Bank Transfer"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Item list */}
        <div className="mb-6">
  <h3 className="font-medium mb-3 text-gray-800">Items</h3>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="text-left">
        <tr className="border-b">
          <th className="pb-2">Item</th>
          <th className="pb-2 text-right">Quantity</th>
          <th className="pb-2 text-right">Price</th>
          <th className="pb-2 text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {(orderDetails.items || []).length > 0 ? (
          orderDetails.items.map((item, index) => (
            <tr key={item.id || index} className="border-b last:border-b-0">
              <td className="py-3">{item.name || 'Unknown Item'}</td>
              <td className="py-3 text-right">{item.quantity || 1}</td>
              <td className="py-3 text-right">
                Rp {(item.price || 0).toLocaleString("id-ID")}
              </td>
              <td className="py-3 text-right">
                Rp {(item.subtotal || (item.price * item.quantity) || 0).toLocaleString("id-ID")}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="py-4 text-center text-gray-500">
              No items found in this transaction
            </td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="pt-4 text-right font-medium">
            Total
          </td>
          <td className="pt-4 text-right font-bold">
            Rp {(orderDetails.totalAmount || 0).toLocaleString("id-ID")}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
        
        <div className="text-center text-sm text-gray-600 border-t pt-4 mt-8">
          <p>Thank you for your order!</p>
          <p>If you have any questions, please contact our customer service at support@kenamplan.com</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center mt-8 print:hidden">
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handlePrintReceipt} 
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Print Receipt
          </Button>
          
          <Link href="/myTransaction">
            <Button className="bg-[#3528AB] hover:bg-[#2e2397]">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}