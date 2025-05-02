import NewsCard from "./components/NewsCard";
import Image from "next/image";
import React from "react";
import ProductCarousel from "./components/ProductCarousel";
import ReviewCarousel from "./components/ReviewCarousel";
import MiddleBar from "./components/MiddleBar";
import NewsCarousel from "./components/NewsCarousel";

export default function Home() {
  const news = [
    {
      image: "/dummy1.png",
    },
    {
      image: "/dummy2.png",
    },
    {
      image: "/dummy3.png",
    },
    {
      image: "/dummy1.png",
    },
  ];

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
    {
      id: "7",
      image: "/dummy1.png",
      name: "Alat Grill Portable",
      price: "Rp 150.000",
      description: "Alat grill portable untuk BBQ bersama keluarga.",
      category: "Alat Grill",
    },
    {
      id: "8",
      image: "/dummy1.png",
      name: "Alat Grill Portable",
      price: "Rp 150.000",
      description: "Alat grill portable untuk BBQ bersama keluarga.",
      category: "Alat Grill",
    },
    {
      id: "9",
      image: "/dummy1.png",
      name: "Alat Grill Portable",
      price: "Rp 150.000",
      description: "Alat grill portable untuk BBQ bersama keluarga.",
      category: "Alat Grill",
    },
    {
      id: "10",
      image: "/dummy1.png",
      name: "Alat Grill Portable",
      price: "Rp 150.000",
      description: "Alat grill portable untuk BBQ bersama keluarga.",
      category: "Alat Grill",
    },
    {
      id: "11",
      image: "/dummy1.png",
      name: "Alat Grill Portable",
      price: "Rp 150.000",
      description: "Alat grill portable untuk BBQ bersama keluarga.",
      category: "Alat Grill",
    },
  ];

  // Filter produk berdasarkan kategori
  const grillProducts = allProducts.filter((product) => product.category === "Alat Grill");
  const picnicProducts = allProducts.filter((product) => product.category === "Perlengkapan Piknik");
  const campingProducts = allProducts.filter((product) => product.category === "Camping");
  const otherProducts = allProducts.filter((product) => product.category === "Lain-lain");

  const reviews = [
    {
      name: "John Doe",
      review: "Acara BBQ keluarga jadi lebih seru berkat KENAM.PLAN! Peralatannya lengkap, grill-nya mudah digunakan, dan semuanya bersih serta berkualitas. Nggak perlu repot, tinggal pakai dan langsung menikmati BBQ bareng keluarga. Pasti bakal sewa lagi!",
    },
    {
      name: "Jane Smith",
      review: "Sewa Big Family BBQ Package di KENAM.PLAN benar-benar worth it! Semua perlengkapan sudah disiapkan, dekorasi juga estetik banget. Momen kumpul keluarga jadi lebih spesial tanpa harus ribet persiapan. Sangat direkomendasikan!",
    },
    {
      name: "Michael Johnson",
      review: "Acara BBQ keluarga jadi lebih seru berkat KENAM.PLAN! Peralatannya lengkap, grill-nya mudah digunakan, dan semuanya bersih serta berkualitas. Nggak perlu repot, tinggal pakai dan langsung menikmati BBQ bareng keluarga. Pasti bakal sewa lagi!",
    },
    {
      name: "Emily Davis",
      review: "Sewa Big Family BBQ Package di KENAM.PLAN benar-benar worth it! Semua perlengkapan sudah disiapkan, dekorasi juga estetik banget. Momen kumpul keluarga jadi lebih spesial tanpa harus ribet persiapan. Sangat direkomendasikan!",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow">
        {/* Header Image */}
        <div className="relative w-full h-[calc(100vw*9/16)] -mt-10">
          <Image
            src="/head.png"
            alt="Head Image"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Intro Section */}
        <div>
          <h1 className="text-4xl font-bold text-center mt-20 mx-20">
            🌿 KENAM.PLAN – SEWA ALAT GRILL, PIKNIK & CAMPING 🌿
          </h1>
          <p className="text-center text-lg mt-4 mx-20">
            Ingin mengadakan piknik estetik, BBQ seru, atau camping nyaman tanpa repot? KENAM.PLAN siap mewujudkan pengalaman outdoor terbaik untukmu dengan menyediakan sewa alat grill, perlengkapan piknik, dan camping berkualitas, serta layanan set foto produk aesthetic dan Picnic Planner untuk acara spesial seperti bridal shower, gender reveal, hingga birthday picnic. Tak perlu ribet, cukup sewa dan nikmati momen berharga bersama orang terdekat—KENAM.PLAN siap membuat acara outdoor-mu lebih berkesan!
          </p>
          <p className="text-center text-lg mt-4 mx-10 mb-20">
            💛 Hubungi kami sekarang dan wujudkan piknik impianmu! 🚀
          </p>
        </div>

        {/* News Section */}
        <div>
          <h2 className="text-4xl font-bold text-center mt-30">PENGUMUMAN</h2>
          <div className="mt-10 mb-10 px-6 mx-20">
            <NewsCarousel news={news} />
          </div>
        </div>

        {/* Product Carousels */}
        <div className="mt-30 px-6 mx-20">
          <ProductCarousel category="Alat Grill" products={grillProducts} />
        </div>
        <div className="mt-10 px-6 mx-20">
          <ProductCarousel category="Perlengkapan Piknik" products={picnicProducts} />
        </div>
        <div className="mt-10 px-6 mx-20">
          <ProductCarousel category="Camping" products={campingProducts} />
        </div>

        {/* Middle Bar */}
        <div className="mt-20 mb-20">
          <MiddleBar />
        </div>

        {/* Reviews Section */}
        <div>
          <h1 className="text-4xl font-bold text-center mt-20">Review Pelanggan</h1>
          <div className="mt-10 px-6 mx-20 mb-15">
            <ReviewCarousel reviews={reviews} />
          </div>
          <button className="bg-[#3528AB] text-white px-6 py-2 rounded-full hover:bg-white hover:text-[#3528AB] transition duration-300 align-center mx-auto block mb-20">
            Sebaran Pelanggan
          </button>
        </div>
      </main>
    </div>
  );
}
