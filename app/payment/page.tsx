"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Calendar, Loader2, Upload, CheckCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define your interface for rental items
interface RentalItem {
  initialQuantity: number;
  id: string;
  barangId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  startDate: string | Date;
  endDate: string | Date;
  rentalDays: number;
  subtotal: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State variables
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "transfer" | "cod">("transfer");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  
  // Payment proof related state
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  
  // Calculate total
  const totalPrice = rentalItems.reduce((total, item) => total + item.subtotal, 0);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Try to load items from sessionStorage first
        const selectedCartItemsJSON = sessionStorage.getItem('selectedCartItems');
        
        if (selectedCartItemsJSON) {
          const selectedItems = JSON.parse(selectedCartItemsJSON);
          setRentalItems(selectedItems);
          setIsLoading(false);
          return;
        }
        
        // If not in sessionStorage, fetch from API
        const selectedItemsResponse = await fetch('/api/keranjang/selected', {
          credentials: 'include'
        });
        
        if (!selectedItemsResponse.ok) {
          toast.error("Failed to load selected items");
          router.push('/keranjang');
          return;
        }
        
        const selectedData = await selectedItemsResponse.json();
        setRentalItems(selectedData.data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load necessary information");
        router.push('/keranjang');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [router]);

  // Handle payment method selection
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as "qris" | "transfer" | "cod");
    setShowQRCode(value === "qris");
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please upload a valid image file (JPEG, JPG, or PNG)");
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      toast.error("File is too large. Please upload an image smaller than 5MB");
      return;
    }
    
    // Set file and create preview
    setPaymentProof(selectedFile);
    const previewUrl = URL.createObjectURL(selectedFile);
    setPaymentProofPreview(previewUrl);
  };
  
  // Handle click on "Upload Payment Proof" button
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Remove uploaded file
  const handleRemoveFile = () => {
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    setPaymentProof(null);
    setPaymentProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment proof for non-COD methods
    if (paymentMethod !== "cod" && !paymentProof) {
      toast.error("Please upload your payment proof before proceeding");
      return;
    }
    
    await handlePaymentCompletion();
  };

  const handlePaymentCompletion = async () => {
    setIsProcessing(true);
    
    try {
      // Get user data
      const userResponse = await fetch('/api/me', { 
        credentials: 'include' 
      });
      
      if (!userResponse.ok) {
        throw new Error("User authentication failed");
      }
      
      const userData = await userResponse.json();
      const userId = userData.data.user.id;
      
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      // Get the earliest start date and latest end date for all items
      const earliestStart = new Date(Math.min(...rentalItems.map(item => 
        new Date(item.startDate).getTime())));
      const latestEnd = new Date(Math.max(...rentalItems.map(item => 
        new Date(item.endDate).getTime())));
      
      let paymentProofUrl = null;
      
      // Upload payment proof if available
      if (paymentProof && paymentMethod !== "cod") {
        setUploadingProof(true);
        
        const formData = new FormData();
        formData.append('paymentProof', paymentProof);
        
        const uploadResponse = await fetch('/api/upload/payment', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload payment proof");
        }
        
        const uploadData = await uploadResponse.json();
        paymentProofUrl = uploadData.fileUrl;
        setUploadingProof(false);
      }
      
      // Calculate total amount from the rental items
      const totalAmount = rentalItems.reduce((sum, item) => {
        const rentalDays = Math.ceil(
          (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        return sum + (item.price * item.initialQuantity * rentalDays);
      }, 0);
      
      // Create the transaction with the required fields
      const response = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id_user: userId,
          total_pembayaran: totalAmount,    // Add the missing required field
          status: paymentMethod === "cod" ? "pending" : "pending",  // Add the missing required field
          tanggal_transaksi: new Date().toISOString(),
          bukti_pembayaran: paymentProofUrl || "",
          
          // Additional data for rental items
          start_date: earliestStart.toISOString(),
          end_date: latestEnd.toISOString(),
          payment_method: paymentMethod,
          items: rentalItems.map(item => ({
            id_barang: item.barangId,
            jumlah: item.initialQuantity,
            price: item.price,
            subtotal: item.subtotal,
            name: item.name,
          }))
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transaction");
      }
      
      // Parse the response ONCE
      const responseData = await response.json();
      console.log("Transaction response:", responseData);
      
      // Extract the ID
      const transactionId = responseData.id || 
                     (responseData.data && responseData.data.id) || 
                     undefined;
      
      if (!transactionId) {
        console.error("No transaction ID in response:", responseData);
        throw new Error("Transaction created but no ID was returned");
      }
      
      // Remove items from cart
      await Promise.all(rentalItems.map(item => 
        fetch(`/api/keranjang/${item.id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      ));
      
      // Clean up session storage
      sessionStorage.removeItem('selectedCartItems');
      sessionStorage.removeItem('cartTotal');
      
      // Use the ID we already extracted
      router.push(`/payment/success?orderId=${transactionId}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment processing failed");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <Link href="/booking/detail" className="flex items-center text-sm mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Details
      </Link>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center w-full max-w-md">
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-[#3528AB] text-white flex items-center justify-center w-8 h-8 z-10">1</div>
            <div className="text-xs mt-2 text-[#3528AB]">Booking Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-[#3528AB]"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-[#3528AB] text-white flex items-center justify-center w-8 h-8 z-10">2</div>
            <div className="text-xs mt-2 text-[#3528AB]">Your Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-[#3528AB]"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-[#3528AB] text-white flex items-center justify-center w-8 h-8 z-10">3</div>
            <div className="text-xs mt-2 text-[#3528AB] font-medium">Payment</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-medium mb-6">Pilih Metode Pembayaran</h2>

          {showQRCode ? (
            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">QRIS Payment</h3>
              <div className="flex flex-col items-center">
                <div className="border border-gray-200 p-4 rounded-lg mb-4">
                  <Image src="/images/qris-code.png" alt="QRIS Code" width={300} height={300} className="mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Scan QRIS code above using your mobile banking or e-wallet app to complete payment
                </p>
                
                {/* Upload Payment Proof Section */}
                <div className="w-full border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Upload Payment Proof</h4>
                  
                  {!paymentProofPreview ? (
                    <div>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                      >
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload payment proof</p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, JPG or PNG (max 5MB)</p>
                      </button>
                    </div>
                  ) : (
                    <div className="relative mt-4">
                      <div className="relative h-56 w-full rounded-lg overflow-hidden">
                        <Image 
                          src={paymentProofPreview} 
                          alt="Payment proof" 
                          fill
                          className="object-contain" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      >
                        <X size={16} className="text-gray-700" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 w-full mt-4">
                  <Button variant="outline" onClick={() => setShowQRCode(false)} className="flex-1">
                    Change Payment Method
                  </Button>
                  <Button 
                    onClick={handlePaymentCompletion} 
                    className="flex-1 bg-[#3528AB] hover:bg-[#2e2397]" 
                    disabled={isProcessing || !paymentProofPreview}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                        Processing...
                      </>
                    ) : "Complete Payment"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-4">
                <div className="border rounded-lg p-4 transition-all hover:border-[#3528AB]">
                  <div className="flex items-start">
                    <RadioGroupItem value="transfer" id="transfer" className="mt-1" />
                    <div className="ml-3 w-full">
                      <Label htmlFor="transfer" className="font-medium flex items-center">
                        <span>Bank Transfer</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Transfer to our bank account and upload payment proof
                      </p>
                      <div className="mt-3 bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium">Bank BCA</p>
                        <p className="text-sm">Account Number: 1234567890</p>
                        <p className="text-sm">Account Name: PT Kenam Plan Indonesia</p>
                      </div>
                      
                      {/* Show upload area when transfer is selected */}
                      {paymentMethod === "transfer" && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Upload Payment Proof</h4>
                          
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg"
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            className="hidden" 
                          />
                          
                          {!paymentProofPreview ? (
                            <button
                              type="button"
                              onClick={handleUploadClick}
                              className="w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                            >
                              <Upload size={24} className="text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Click to upload payment proof</p>
                              <p className="text-xs text-gray-400 mt-1">JPEG, JPG or PNG (max 5MB)</p>
                            </button>
                          ) : (
                            <div className="relative mt-4">
                              <div className="relative h-56 w-full rounded-lg overflow-hidden">
                                <Image 
                                  src={paymentProofPreview} 
                                  alt="Payment proof" 
                                  fill
                                  className="object-contain" 
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                              >
                                <X size={16} className="text-gray-700" />
                              </button>
                              <div className="flex items-center mt-2 text-green-600">
                                <CheckCircle size={16} className="mr-1" />
                                <span className="text-sm">Payment proof uploaded</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 transition-all hover:border-[#3528AB]">
                  <div className="flex items-start">
                    <RadioGroupItem value="qris" id="qris" className="mt-1" />
                    <div className="ml-3 w-full">
                      <Label htmlFor="qris" className="font-medium flex items-center">
                        <span>QRIS</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Pay using QRIS and upload payment proof
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 transition-all hover:border-[#3528AB]">
                  <div className="flex items-start">
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <div className="ml-3 w-full">
                      <Label htmlFor="cod" className="font-medium flex items-center">
                        <span>Cash on Delivery (COD)</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">Pay with cash when your order is delivered</p>
                      <p className="text-xs text-amber-600 mt-1">Note: COD orders are subject to additional verification</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              <Button 
                type="submit" 
                className="w-full mt-6 bg-[#3528AB] hover:bg-[#2e2397]"
                disabled={isProcessing || (paymentMethod !== "cod" && !paymentProof)}
              >
                {isProcessing || uploadingProof ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                    {uploadingProof ? "Uploading proof..." : "Processing..."}
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="border rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-medium mb-4">Ringkasan Pesanan</h3>

            {/* Item List */}
            <div className="space-y-4 mb-6">
              {rentalItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                    <Image 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.name} 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {format(new Date(item.startDate), "dd/MM/yyyy")} - {format(new Date(item.endDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">
                        {item.quantity} × {item.rentalDays} hari
                      </span>
                      <span className="font-medium">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}