"use client";

import React, { useState } from "react";
import KeranjangItem from "../../components/ui/KeranjangItem";

interface KeranjangItemData {
  id: string;
  image: string;
  name: string;
  price: number; // Harga dalam bentuk angka
  initialQuantity: number;
}

const Keranjang = () => {
  const [items, setItems] = useState<KeranjangItemData[]>([
    {
      id: "1",
      image: "",
      name: "Big Family Packages",
      price: 25000,
      initialQuantity: 2,
    },
    {
      id: "2",
      image: "",
      name: "Grill Pan Mini",
      price: 175000,
      initialQuantity: 1,
    },
    {
      id: "3",
      image: "",
      name: "Tenda Camping Nyaman",
      price: 300000,
      initialQuantity: 1,
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleQuantityChange = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, initialQuantity: quantity } : item
      )
    );
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

  const handleDeleteSelected = () => {
    setItems((prevItems) =>
      prevItems.filter((item) => !selectedItems.includes(item.id))
    );
    setSelectedItems([]); 
  };

  const totalPayment = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.price * item.initialQuantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            disabled={selectedItems.length === 0} // Disable jika tidak ada item yang dipilih
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
          price={`Rp ${item.price.toLocaleString("id-ID")}`}
          initialQuantity={item.initialQuantity}
          onQuantityChange={handleQuantityChange}
          onSelectChange={(id, selected) => handleSelectChange(id, selected)}
          selected={selectedItems.includes(item.id)} // Centang otomatis jika dipilih
        />
      ))}

      {/* Total Pembayaran */}
      <div className="mt-6 flex justify-end">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg">
          Bayar (Rp {totalPayment.toLocaleString("id-ID")})
        </button>
      </div>
    </div>
  );
};

export default Keranjang;