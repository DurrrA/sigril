import Image from "next/image";
import React, { useState } from "react";

interface KeranjangItemProps {
  id: string;
  image: string;
  name: string;
  price: string;
  initialQuantity: number;
  onQuantityChange?: (id: string, quantity: number) => void;
  onSelectChange?: (id: string, selected: boolean) => void;
  selected?: boolean; // Tambahkan prop ini
}

const KeranjangItem: React.FC<KeranjangItemProps> = ({
  id,
  image,
  name,
  price,
  initialQuantity,
  onQuantityChange,
  onSelectChange,
  selected = false, // Default false
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onQuantityChange) {
        onQuantityChange(id, newQuantity);
      }
    }
  };

  const handleSelectChange = () => {
    if (onSelectChange) {
      onSelectChange(id, !selected);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-4">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected} // Gunakan prop `selected` untuk mengatur status checkbox
        onChange={handleSelectChange}
        className="w-5 h-5"
      />

      {/* Gambar Produk */}
      <div className="w-16 h-16 flex-shrink-0">
        <Image
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Nama dan Harga Produk */}
      <div className="flex-grow">
        <p className="text-lg font-bold text-gray-800">{name}</p>
        <p className="text-orange-500 font-bold">{price}</p>
      </div>

      {/* Jumlah Produk */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-600">Jumlah</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrease}
            className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-3 py-1 rounded-full"
          >
            -
          </button>
          <span className="text-lg font-bold">{quantity}</span>
          <button
            onClick={handleIncrease}
            className="bg-gray-200 hover:bg-[#3528AB] hover:text-white px-3 py-1 rounded-full"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeranjangItem;