"use client";

import React, { useState, useEffect } from "react";
import KeranjangItem from "../../components/ui/KeranjangItem";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { KeranjangItemView, Keranjang } from "@/interfaces/keranjang.interfaces";
import {useRouter} from "next/navigation";

const KeranjangPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<KeranjangItemView[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/keranjang", {
        credentials: "include", // Include cookies for authentication
      });

      if (response.redirected) {
        window.location.href = response.url; // Redirect if unauthorized
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const data = await response.json();
      const cartItems: KeranjangItemView[] = data.data.map((item: Keranjang) => ({
        id: item.id.toString(),
        image: item.barang?.foto ? normalizeImagePath(item.barang.foto) : "/image/file.svg",
        name: item.barang?.nama || "Unnamed Product",
        price: item.barang?.harga || 0,
        initialQuantity: item.jumlah,
        barangId: item.id_barang,
        stock: item.barang?.stok || 0,
        // Added rental information
        startDate: item.start_date || new Date(),
        endDate: item.end_date || new Date(),
        rentalDays: item.rental_days || 1,
        subtotal: item.subtotal || 0
      }));

      setItems(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Gagal mengambil data keranjang");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to normalize image paths
  const normalizeImagePath = (path: string): string => {
    if (!path) return "/image/file.svg";
    return path.startsWith('/') ? path : `/${path}`;
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    try {
      // First check if the new quantity exceeds stock
      const item = items.find(item => item.id === id);
      if (item && item.stock !== undefined && quantity > item.stock) {
        toast.error(`Stok hanya tersedia ${item.stock}`);
        return;
      }
      
      // Update UI immediately for responsiveness
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, initialQuantity: quantity } : item
        )
      );
      
      // Call API to update quantity
      const response = await fetch(`/api/keranjang/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jumlah: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update quantity");
      }
      
      toast.success("Jumlah barang berhasil diperbarui");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Gagal memperbarui jumlah barang");
      // Revert the optimistic UI update on error
      fetchCartItems();
    }
  };

  const handleSelectChange = (id: string, selected: boolean) => {
    setSelectedItems((prevSelected) =>
      selected
        ? [...prevSelected, id]
        : prevSelected.filter((itemId) => itemId !== id)
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Delete each selected item
      const deletePromises = selectedItems.map((id) =>
        fetch(`/api/keranjang/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
      );

      await Promise.all(deletePromises);
      
      // Update UI
      setItems((prevItems) =>
        prevItems.filter((item) => !selectedItems.includes(item.id))
      );
      setSelectedItems([]);
      
      toast.success("Berhasil menghapus barang dari keranjang");
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Gagal menghapus barang");
      // Refresh to ensure UI is consistent with server state
      fetchCartItems();
    }
  };

  const totalPayment = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.subtotal, 0);

    const handleCheckout = async () => {
      if (selectedItems.length === 0) {
        toast.error("Silahkan pilih barang terlebih dahulu");
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        // Store selected item data in session storage for booking/payment pages
        const selectedCartItems = items.filter(item => selectedItems.includes(item.id));
        
        // Save to session storage so booking/payment pages can access the data
        sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
        sessionStorage.setItem('cartTotal', totalPayment.toString());
        
        // Instead of creating a rental request now, redirect to booking details
        router.push('/booking/detail');
        
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error("Error preparing checkout. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {items.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">Anda belum menambahkan barang ke keranjang</p>
          <a 
            href="/produk" 
            className="bg-[#3528AB] hover:bg-[#2e2397] text-white px-6 py-3 rounded-lg"
          >
            Lihat Produk
          </a>
        </div>
      ) : (
        <>
          {/* Pilih Semua dan Hapus */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg"
              >
                {selectedItems.length === items.length ? "Batalkan Pilih Semua" : "Pilih Semua"}
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                disabled={selectedItems.length === 0}
              >
                Hapus
              </button>
            </div>
            <span className="text-lg font-bold text-gray-800">
              Total: Rp {totalPayment.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Daftar Item */}
          {items.map((item) => (
            <KeranjangItem
              key={item.id}
              id={item.id}
              image={item.image}
              name={item.name}
              price={`Rp ${item.price.toLocaleString("id-ID")} / hari`}
              initialQuantity={item.initialQuantity}
              onQuantityChange={handleQuantityChange}
              onSelectChange={(id, selected) => handleSelectChange(id, selected)}
              selected={selectedItems.includes(item.id)}
              maxQuantity={item.stock}
              startDate={item.startDate}
              endDate={item.endDate}
              rentalDays={item.rentalDays}
            />
          ))}

          {/* Total Pembayaran */}
          <div className="mt-6 flex justify-end">
          <button 
            onClick={handleCheckout} // Keep your existing logic for API calls
            disabled={selectedItems.length === 0 || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                Memproses...
              </>
            ) : (
              `Lanjutkan ke Pembayaran (Rp ${totalPayment.toLocaleString("id-ID")})`
            )}
          </button>
          </div>
        </>
      )}
    </div>
  );
};

export default KeranjangPage;