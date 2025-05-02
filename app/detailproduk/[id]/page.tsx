"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Barang } from "@/interfaces/barang.interfaces";
import Image from "next/image";
import ProfileCompletionCheck from '@/components/ui/ProfileCompletionCheck';

const DetailProduk = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [, setKeranjang] = useState<string[]>([]);

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

  const handleIncrease = () => {
    if (product && quantity < product.stok) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      setKeranjang((prevKeranjang) => {
        if (!prevKeranjang.includes(product.id)) {
          return [...prevKeranjang, product.id];
        }
        return prevKeranjang;
      });
      alert(`Produk "${product.nama}" berhasil ditambahkan ke keranjang!`);
    }
  };

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
    <div className="min-h-screen bg-white p-6 md:p-10 mx-10">
      <button
        onClick={() => router.back()}
        className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg mb-6"
      >
        ← Back
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden relative h-[400px]">
          <Image 
            src={product.foto.startsWith('/') ? product.foto : `/${product.foto}`} 
            alt={product.nama} 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover" 
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.nama}</h1>
          <p className="text-gray-600 mb-2">Kategori: {product.kategori.nama}</p>

          <p className="text-orange-500 font-bold text-xl mb-4">
            Rp {product.harga.toLocaleString('id-ID')}
          </p>

          <p className="text-gray-700 mb-2">
            Penalti per jam: Rp {product.harga_pinalti_per_jam.toLocaleString('id-ID')}
          </p>

          <p className="text-gray-700 mb-2">Stok: {product.stok}</p>

          <p className="text-gray-700 mb-6">{product.deskripsi}</p>
          <div className="flex items-center gap-4 mb-6 justify-center mt-10">
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
              disabled={quantity >= product.stok}
            >
              +
            </button>
          </div>

              <ProfileCompletionCheck
              onComplete={handleAddToCart}
              onCancel={() => console.log("User cancelled adding to cart")}
            >
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg w-full"
              disabled={product?.stok <= 0}
            >
              {product?.stok > 0 ? "Masukkan Keranjang" : "Stok Habis"}
            </button>
          </ProfileCompletionCheck>
        </div>
      </div>
    </div>
  );
};

export default DetailProduk;