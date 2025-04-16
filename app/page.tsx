import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Image from "next/image";
import React from "react";
import SwiperComponent from "./components/SwiperComponent";

export default function Home() {
  const announcements = [
    { id: 1, image: "/dummy1.png", title: "Full Booked", date: "31 Desember 2024" },
    { id: 2, image: "/dummy2.png", title: "Promo Diskon", date: "Hingga 30 Juni 2024" },
    { id: 3, image: "/dummy3.png", title: "Event Baru", date: "15 Agustus 2024" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="relative w-full h-screen">
          <Image
            src="/head.png"
            alt="Head Image"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-center mt-10">
            🌿 KENAM.PLAN – SEWA ALAT GRILL, PIKNIK & CAMPING 🌿
          </h1>
          <p className="text-center text-lg mt-4 mx-10">
            Ingin mengadakan piknik estetik, BBQ seru, atau camping nyaman tanpa repot? KENAM.PLAN siap mewujudkan pengalaman outdoor terbaik untukmu dengan menyediakan sewa alat grill, perlengkapan piknik, dan camping berkualitas, serta layanan set foto produk aesthetic dan Picnic Planner untuk acara spesial seperti bridal shower, gender reveal, hingga birthday picnic. Tak perlu ribet, cukup sewa dan nikmati momen berharga bersama orang terdekat—KENAM.PLAN siap membuat acara outdoor-mu lebih berkesan!
          </p>
          <p className="text-center text-lg mt-4 mx-10 mb-10">
            💛 Hubungi kami sekarang dan wujudkan piknik impianmu! 🚀
          </p>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-center mt-20">PENGUMUMAN</h2>
          <div className="mt-10">
            <SwiperComponent announcements={announcements} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
