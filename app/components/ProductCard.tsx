import Image from "next/image";
import { useRouter } from "next/navigation"; // Import useRouter
import React from "react";

interface ProductCardProps {
  id: string; // ID produk
  image: string;
  name: string; // Nama produk
  price: string;
  description: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, image, name, price, description }) => {
  const router = useRouter(); // Inisialisasi router

  // Fungsi untuk memotong deskripsi menjadi 10 kata pertama
  const truncateDescription = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
      onClick={() => router.push(`/detailproduk/${id}`)} // Navigasi ke halaman detail produk
    >
      {/* Gambar Produk */}
      <div className="relative w-full aspect-square">
        <Image
          src={image}
          alt={name} // Gunakan nama produk sebagai alt
          fill
          style={{ objectFit: "cover" }}
          className="rounded-t-lg"
        />
      </div>
      {/* Informasi Produk */}
      <div className="p-4">
        {/* Nama Produk */}
        <p className="text-lg font-bold text-gray-800 mb-2 text-center">{name}</p>
        {/* Harga Produk */}
        <p className="text-lg font-bold text-orange-400 mb-2">{price}</p>
        {/* Deskripsi Produk */}
        <p className="text-sm text-gray-600 text-center">
          {truncateDescription(description, 10)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;