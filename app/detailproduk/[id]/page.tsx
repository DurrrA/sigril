"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Barang } from "@/interfaces/barang.interfaces";
import Image from "next/image";
import ProfileCompletionCheck from '@/components/ui/ProfileCompletionCheck';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'sonner';
import { Loader2, Calendar, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

import ToastNotifikasi from '@/components/ui/ToastNotifikasi';

const DetailProduk = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Date-related state
  const [rentalStartDate, setRentalStartDate] = useState<Date>(new Date());
  const [rentalEndDate, setRentalEndDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  
  // Availability state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState<{
    available: boolean;
    availableQuantity: number;
  } | null>(null);

  // Calculate rental duration
  const rentalDays = Math.ceil(
    (rentalEndDate.getTime() - rentalStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate total rental price
  const totalPrice = product ? product.harga * quantity * rentalDays : 0;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/barang/${id}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch product");
        }

        const data = await res.json();
        setProduct(data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  // Check availability when dates change
  useEffect(() => {
    if (product && rentalStartDate && rentalEndDate) {
      checkAvailability();
    }
  }, [product, rentalStartDate, rentalEndDate]);

  const checkAvailability = async () => {
    if (!product) return;
    
    try {
      setIsCheckingAvailability(true);
      const response = await fetch(
        `/api/sewa/availability?itemId=${product.id}&startDate=${rentalStartDate.toISOString()}&endDate=${rentalEndDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to check availability");
      }
      
      const data = await response.json();
      setAvailabilityInfo(data);
      
      // Reset quantity if it's more than available
      if (data.availableQuantity < quantity) {
        setQuantity(Math.max(1, Math.min(quantity, data.availableQuantity)));
      }
      
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Failed to check availability");
      setAvailabilityInfo({ available: false, availableQuantity: 0 });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleIncrease = () => {
    const maxAvailable = availabilityInfo?.availableQuantity || 0;
    if (quantity < maxAvailable) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.error(`Maksimum stok tersedia: ${maxAvailable}`);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const getCurrentUserId = async () => {
    try {
      const response = await fetch('/api/me');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user information');
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);

      const userId = responseData.data.user.id;

      if (!userId) {
        throw new Error('User ID not found in response');
      }

      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw new Error('Failed to get user information');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsAddingToCart(true);
      
      // Get the current user's ID
      await getCurrentUserId();
      
      // Calculate subtotal based on rental days
      const subtotal = product.harga * quantity * rentalDays;
      
      // Send request to your API endpoint with credentials
      const response = await fetch('/api/keranjang', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_barang: parseInt(id),
          jumlah: quantity,
          startDate: rentalStartDate.toISOString(),
          endDate: rentalEndDate.toISOString(),
          rentalDays: rentalDays,
          subtotal: subtotal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
      
      toast.success(`${quantity} unit "${product.nama}" berhasil ditambahkan ke keranjang!`);
      
      // Reset quantity after adding to cart
      setQuantity(1);
      
      // Ask if user wants to go to cart
      const goToCart = window.confirm("Item added to cart! Do you want to view your cart now?");
      if (goToCart) {
        router.push('/keranjang');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error instanceof Error && error.message.includes("Failed to get user information")) {
        toast.error("Silakan login terlebih dahulu untuk menambahkan ke keranjang");
        router.push('/login?redirect=/detailproduk/' + id);
      } else {
        toast.error("Gagal menambahkan produk ke keranjang. Silakan coba lagi.");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Format and validate dates
  const minEndDate = new Date(rentalStartDate);
  minEndDate.setDate(minEndDate.getDate() + 1);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3528AB]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produk tidak ditemukan</h1>
          <button
            onClick={() => router.back()}
            className="bg-[#3528AB] text-white px-4 py-2 rounded-lg"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 mx-auto max-w-7xl">
      <button
        onClick={() => router.back()}
        className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg mb-6"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden relative h-[400px]">
          <Image 
            src={product.foto.startsWith('/') ? product.foto : `/${product.foto}`} 
            alt={product.nama} 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover" 
            priority
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.nama}</h1>
          <p className="text-gray-600 mb-2">Kategori: {product.kategori.nama}</p>

          <p className="text-orange-500 font-bold text-xl mb-2">
            Rp {product.harga.toLocaleString('id-ID')} / hari
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
            <p className="text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Penalti per jam: Rp {product.harga_pinalti_per_jam.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Rental Date Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-gray-700" />
              Pilih Tanggal Sewa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <DatePicker
                  selected={rentalStartDate}
                  onChange={(date: Date | null) => date && setRentalStartDate(date)}
                  selectsStart
                  startDate={rentalStartDate}
                  endDate={rentalEndDate}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                <DatePicker
                  selected={rentalEndDate}
                  onChange={(date: Date | null) => date && setRentalEndDate(date)}
                  selectsEnd
                  startDate={rentalStartDate}
                  endDate={rentalEndDate}
                  minDate={minEndDate}
                  dateFormat="dd/MM/yyyy"
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <p className="font-medium">Durasi Sewa: <span className="font-bold">{rentalDays} hari</span></p>
              
              {/* Availability Status */}
              {isCheckingAvailability ? (
                <div className="flex items-center mt-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memeriksa ketersediaan...
                </div>
              ) : availabilityInfo ? (
                <div className={`mt-2 flex items-center ${availabilityInfo.available ? 'text-green-600' : 'text-red-600'}`}>
                  {availabilityInfo.available 
                    ? <><CheckCircle2 className="h-5 w-5 mr-2" /> Tersedia: {availabilityInfo.availableQuantity} unit</>
                    : <><XCircle className="h-5 w-5 mr-2" /> Tidak tersedia untuk tanggal tersebut</>}
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-4"><span className="font-medium">Stok Total:</span> {product.stok} unit</p>
            <div className="text-gray-700">
              <h3 className="font-medium mb-2">Deskripsi:</h3>
              <p>{product.deskripsi}</p>
            </div>
          </div>
          
          {/* Quantity Selection and Add to Cart */}
          {availabilityInfo && availabilityInfo.available ? (
            <>
              <div className="flex items-center gap-4 mb-4 justify-center">
                <button
                  onClick={handleDecrease}
                  className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg font-bold">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg"
                  disabled={quantity >= availabilityInfo.availableQuantity}
                >
                  +
                </button>
              </div>
              
              <p className="text-center font-bold text-lg mb-6">
                Total: Rp {totalPrice.toLocaleString('id-ID')}
              </p>

              <ProfileCompletionCheck
                onComplete={handleAddToCart}
                onCancel={() => console.log("User cancelled adding to cart")}
              >
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center"
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Masukkan Keranjang
                    </>
                  )}
                </button>
              </ProfileCompletionCheck>
            </>
          ) : (
            <button
              className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg w-full cursor-not-allowed flex items-center justify-center"
              disabled
            >
              {!availabilityInfo ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Memuat ketersediaan...
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  Tidak tersedia untuk tanggal yang dipilih
                </>
              )}
            </button>
          )}
        </div>
      </div>

        <ToastNotifikasi message={toastMessage} show={showToast} onClose={() => { setShowToast(false); setToastMessage(""); }} />
        <ToastNotifikasi message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};

export default DetailProduk;