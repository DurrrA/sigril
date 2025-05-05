"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import NewsCarousel from "../components/ui/NewsCarousel";
import ProductCarousel from "../components/ui/ProductCarousel";
import ReviewCarousel from "../components/ui/ReviewCarousel";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  link: string;
}

interface Category {
  id: number;
  nama: string;
}

interface AppProduct {
  id: number;
  kategori_id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  foto: string;
}

interface Review {
  id: number;
  user: { id: number; nama: string; foto: string };
  rating: number;
  komentar?: string;
}


function shuffleArray<T>(array: T[]): T[] {
  return Array.isArray(array)
    ? array.map((value) => ({ value, sort: Math.random() }))
           .sort((a, b) => a.sort - b.sort)
           .map(({ value }) => value)
    : [];
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        
        const kategoriRes = await fetch('/api/kategori');
        const kategoriJson = await kategoriRes.json();
        setCategories(Array.isArray(kategoriJson.data) ? kategoriJson.data : []);

        
        const produkRes = await fetch('/api/barang');
        const produkJson = await produkRes.json();
        setProducts(Array.isArray(produkJson.data) ? produkJson.data : []);

        
        const reviewRes = await fetch('/api/review');
        const reviewJson = await reviewRes.json();
        const reviewData: Review[] = Array.isArray(reviewJson.data)
          ? reviewJson.data.map((r: { id: number; user: { id: number; username?: string; full_name?: string; email: string; avatar?: string }; rating: number; komentar?: string }) => ({
              id: r.id,
              user: {
                id: r.user.id,
                nama: r.user.username || r.user.full_name || r.user.email,
                foto: r.user.avatar || ''
              },
              rating: r.rating,
              komentar: r.komentar
            }))
          : [];
        setReviews(shuffleArray(reviewData));

       
        const artikelRes = await fetch('/api/artikel');
        const artikelJson = await artikelRes.json();
        const artikelData: { id: number; judul: string; foto: string }[] = Array.isArray(artikelJson.data) ? artikelJson.data : [];
        setNews(
          shuffleArray(
            artikelData.map((a) => ({
              id: a.id,
              title: a.judul,
              image: a.foto,
              link: `/artikel/${a.id}`
            }))
          )
        );
      } catch (error) {
        console.error('Gagal fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Memuat...</div>;
  }

  
  const groupedProducts: Record<number, AppProduct[]> = {};
  categories.forEach((cat) => {
    groupedProducts[cat.id] = products.filter((p) => p.kategori_id === cat.id);
  });

  
  const normalizeImage = (path: string) =>
    path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow">
        
        <div className="relative w-full h-[calc(100vw*9/16)] -mt-10">
          <Image
            src={normalizeImage('head.png')}
            alt="Head Image"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        
        <div>
          <h1 className="text-4xl font-bold text-center mt-20 mx-20">
            🌿 KENAM.PLAN – SEWA ALAT GRILL, PIKNIK & CAMPING 🌿
          </h1>
          <p className="text-center text-lg mt-4 mx-20">
            Ingin mengadakan piknik estetik, BBQ seru, atau camping nyaman tanpa repot? KENAM.PLAN siap mewujudkan pengalaman outdoor terbaik untukmu dengan menyediakan sewa alat grill, perlengkapan piknik, dan camping berkualitas...
          </p>
          <p className="text-center text-lg mt-4 mx-10 mb-20">
            💛 Hubungi kami sekarang dan wujudkan piknik impianmu! 🚀
          </p>
        </div>

        
        <div>
          <h2 className="text-4xl font-bold text-center mt-30">PENGUMUMAN</h2>
          <p className="text-center text-base text-gray-600 mt-4 mb-6 mx-10">
            Temukan berbagai informasi, tips, dan update menarik seputar kegiatan outdoor dari tim kami.
          </p>
          <div className="mt-4 mb-10 px-6 mx-20">
            <NewsCarousel
              news={news.map((n) => ({
                title: n.title,
                image: normalizeImage(n.image),
                link: n.link
              }))}
            />
          </div>
        </div>

        
        {categories.map((cat) => (
          <div key={cat.id} className="mt-10 px-6 mx-20">
            <ProductCarousel
              category={cat.nama}
              products={
                (groupedProducts[cat.id] || []).map((p) => ({
                  id: p.id.toString(),
                  image: normalizeImage(p.foto),
                  name: p.nama,
                  price: p.harga.toString(),
                  description: p.deskripsi
                }))
              }
            />
          </div>
        ))}

        {/* Pembatas */}
        <div className="mt-20 mb-20">
          <div className="border-t border-gray-200 w-3/4 mx-auto" />
        </div>

{/* Review Pelanggan */}
<div className="bg-gray-50 py-12 px-4 rounded-xl shadow-inner">
  <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10">Review Pelanggan</h2>
  <div className="max-w-6xl mx-auto">
    <ReviewCarousel
      reviews={reviews.slice(0, 4).map((r) => ({
        profileImage: normalizeImage(r.user.foto),
        name: r.user.nama,
        review: r.komentar || ''
      }))}
    />
  </div>
</div>

      </main>

      {/* Tombol Sebaran Pelanggan */}
      <div className="py-10">
        <button className="bg-[#3528AB] text-white px-6 py-2 rounded-full hover:bg-white hover:text-[#3528AB] transition duration-300 block mx-auto">
          Sebaran Pelanggan
        </button>
      </div>
    </div>
  );
}