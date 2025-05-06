import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface KeranjangItemProps {
  id: string;
  image: string;
  name: string;
  price: string;
  initialQuantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onSelectChange: (id: string, selected: boolean) => void;
  selected: boolean;
  maxQuantity?: number;
  // New rental properties
  startDate: string | Date;
  endDate: string | Date;
  rentalDays: number;
}

const KeranjangItem: React.FC<KeranjangItemProps> = ({
  id,
  image,
  name,
  price,
  initialQuantity,
  onQuantityChange,
  onSelectChange,
  selected,
  maxQuantity,
  startDate,
  endDate,
  rentalDays
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleIncrease = () => {
    // Check stock limit before increasing
    if (maxQuantity !== undefined && quantity >= maxQuantity) {
      toast.error(`Stok hanya tersedia ${maxQuantity}`);
      return;
    }
    
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(id, newQuantity);
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

  // Format dates for display
  const formattedStartDate = typeof startDate === 'string' ? 
    format(new Date(startDate), 'dd/MM/yyyy') : 
    format(startDate, 'dd/MM/yyyy');
  
  const formattedEndDate = typeof endDate === 'string' ? 
    format(new Date(endDate), 'dd/MM/yyyy') : 
    format(endDate, 'dd/MM/yyyy');

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-4">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={handleSelectChange}
        className="w-5 h-5"
      />

      {/* Gambar Produk */}
      <div className="w-16 h-16 flex-shrink-0 relative">
        <Image
          src={image}
          alt={name}
          width={64}
          height={64}
          className="object-cover rounded-md"
        />
      </div>

      {/* Nama, Harga, dan Rental Info */}
      <div className="flex-grow">
        <p className="text-lg font-bold text-gray-800">{name}</p>
        <p className="text-orange-500 font-bold">{price}</p>
        
        {/* Rental dates information */}
        <div className="text-sm text-gray-600 mt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Mulai:</span> {formattedStartDate}
            </div>
            <div>
              <span className="font-medium">Selesai:</span> {formattedEndDate}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Durasi:</span> {rentalDays} hari
            </div>
          </div>
        </div>
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