import React from "react";
import ContactCard from "./ContactCard"; // Pastikan ini sesuai path
import Image from "next/image";

const MiddleBar = () => {
  return (
    <div className="bg-gradient-to-r from-[#6A5ACD] to-[#3528AB] py-8 px-6 md:px-30 flex flex-col md:flex-row items-center justify-center gap-6 relative overflow-hidden">
      {/* Kartu Kontak */}
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 max-w-sm text-white text-center z-10">
        <h2 className="text-xl font-bold mb-3">Perlu tanya-tanya?</h2>
        <p className="mb-4 text-sm">
          Jangan ragu! Hubungi kami langsung dan kami siap membantu kebutuhan BBQ, piknik, atau camping impianmu! 🔥⛺
        </p>
        <button className="bg-white text-[#3528AB] font-semibold px-4 py-2 rounded-full shadow-md transition duration-300 hover:bg-[#3528AB] hover:text-white hover:scale-105">
            Kontak Kami
        </button>

      </div>

      {/* Gambar */}
      <div className="w-[250px] h-[250px] z-10">
        <Image
          src="/pap.png" // Ganti dengan nama file kamu kalau berbeda
          alt="Perempuan"
          width={350}
          height={350}
          className="rounded-lg drop-shadow-xl"
        />
      </div>
    </div>
  );
};

export default MiddleBar;
