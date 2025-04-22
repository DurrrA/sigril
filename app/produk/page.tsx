import React from "react";
import ProductCarousel from "../components/ProductCarousel";

const ProdukPage = () => {
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

  // Daftar kategori yang tersedia
  const categories = ["Alat Grill", "Perlengkapan Piknik", "Camping", "Lain-lain"];

  // Kelompokkan produk berdasarkan kategori
  const groupedProducts = categories.map((category) => ({
    category,
    products: allProducts.filter((product) => product.category === category),
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center mb-10">Produk Kami</h1>

      {/* Render Carousel untuk Setiap Kategori */}
      {groupedProducts.map(({ category, products }) => (
        <div key={category} className="mt-10 px-6 mx-20">
          {products.length > 0 ? (
            <ProductCarousel category={category} products={products} />
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
              <p className="text-gray-500">Tidak ada barang untuk kategori ini.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProdukPage;