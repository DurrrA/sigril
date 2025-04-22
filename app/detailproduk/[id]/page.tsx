"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useParams

const DetailProduk = () => {
  const router = useRouter(); // Inisialisasi router
  const params = useParams(); // Gunakan useParams untuk mendapatkan parameter dinamis
  const { id } = params; // Ambil ID dari parameter

  const allProducts = [
    {
      id: "1",
      image: "/dummy1.png",
      name: "Alat Grill Portable",
      price: "Rp 150.000",
      description: "Alat grill portable untuk BBQ bersama keluarga.",
      category: "Alat Grill",
    },
    {
      id: "2",
      image: "/dummy2.png",
      name: "Set Piknik Estetik",
      price: "Rp 200.000",
      description: "Set perlengkapan piknik estetik untuk acara outdoor.",
      category: "Perlengkapan Piknik",
    },
    {
      id: "3",
      image: "/dummy3.png",
      name: "Tenda Camping Nyaman",
      price: "Rp 300.000",
      description: "Tenda camping untuk pengalaman outdoor yang nyaman.",
      category: "Camping",
    },
    {
      id: "4",
      image: "/dummy1.png",
      name: "Lampu LED Tenaga Surya",
      price: "Rp 100.000",
      description: "Lampu LED tenaga surya untuk penerangan saat berkemah.",
      category: "Camping",
    },
    {
      id: "5",
      image: "/dummy2.png",
      name: "Grill Pan Mini",
      price: "Rp 175.000",
      description: "Grill pan mini untuk kegiatan memasak outdoor.",
      category: "Alat Grill",
    },
    {
      id: "6",
      image: "/dummy3.png",
      name: "Tikar Piknik Estetik",
      price: "Rp 85.000",
      description: "Tikar piknik lipat dengan motif estetik.",
      category: "Perlengkapan Piknik",
    },
  ];

  // Cari produk berdasarkan ID
  const product = allProducts.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Produk tidak ditemukan</h1>
      </div>
    );
  }

  const [quantity, setQuantity] = useState(1); // State untuk jumlah produk
  const [keranjang, setKeranjang] = useState<string[]>([]); // State untuk menyimpan ID produk di keranjang

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    setKeranjang((prevKeranjang) => {
      if (!prevKeranjang.includes(product.id)) {
        return [...prevKeranjang, product.id];
      }
      return prevKeranjang;
    });
    alert(`Produk "${product.name}" berhasil ditambahkan ke keranjang!`);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 mx-10">
      {/* Tombol Back */}
      <button
        onClick={() => router.back()}
        className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg mb-6"
      >
        ← Back
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gambar Produk */}
        <div className="rounded-xl overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full object-cover" />
        </div>

        {/* Informasi Produk */}
        <div>
          {/* Nama Produk */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          {/* Harga Produk */}
          <p className="text-orange-500 font-bold text-xl mb-4">{product.price}</p>

          {/* Deskripsi Produk */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Tombol Tambah/Kurangi Jumlah */}
          <div className="flex items-center gap-4 mb-6 justify-center mt-10">
            <button
              onClick={handleDecrease}
              className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg"
            >
              -
            </button>
            <span className="text-lg font-bold">{quantity}</span>
            <button
              onClick={handleIncrease}
              className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-4 py-2 rounded-lg"
            >
              +
            </button>
          </div>

          {/* Tombol Masukkan Keranjang */}
          <button
            onClick={handleAddToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg w-full"
          >
            Masukkan Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailProduk;