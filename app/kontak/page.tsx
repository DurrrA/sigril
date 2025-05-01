"use client";

import React from "react";
import Image from "next/image"; // Pastikan Anda mengimpor Image dari next/image
import {
  PhoneCall,
  MapPin,
  Instagram,
} from "lucide-react";

const KontakKami = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <div className="bg-white rounded-2x2 shadow-lg w-full max-w-6xl p-10">
        <h1 className="text-3xl font-bold text-[#232323] text-center mb-10">
          Kontak Kami
        </h1>

        {/* Grid Kontak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Nomor Telepon */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <PhoneCall className="h-10 w-10 text-blue-600 mb-2" />
            <h2 className="font-semibold text-gray-800">Nomor Telepon</h2>
            <p className="text-gray-600">
              <a href="tel:+6285282017495" className="text-blue-600">
                +62 852 8201 7495
              </a>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            {/* Gambar WhatsApp */}
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              width={40} // Tentukan lebar gambar
              height={40} // Tentukan tinggi gambar
              className="mb-2"
            />
            <h2 className="font-semibold text-gray-800">WhatsApp</h2>
            <p className="text-gray-600">
              <a
                href="https://wa.me/6285282017495"
                className="text-green-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                +62 852 8201 7495
              </a>
            </p>
          </div>

          {/* Instagram */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <Instagram className="h-10 w-10 text-pink-500 mb-2" />
            <h2 className="font-semibold text-gray-800">Instagram</h2>
            <p className="text-gray-600">
              <a
                href="https://instagram.com/kenam.plan_bgr"
                className="text-pink-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                @kenam.plan_bgr
              </a>
            </p>
          </div>

          {/* Alamat Toko */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow">
            <MapPin className="h-10 w-10 text-red-500 mb-2" />
            <h2 className="font-semibold text-gray-800">Alamat Toko</h2>
            <p className="text-gray-600">
              <a
                href="https://www.google.com/maps?q=Graha+Cilebut+Residence+No.184,+Cilebut+Barat,+Sukaraja,+Kabupaten+Bogor,+Jawa+Barat"
                className="text-red-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Graha Cilebut Residence No.184, Cilebut Barat, Sukaraja, Kabupaten
                Bogor, Jawa Barat
              </a>
            </p>
          </div>
        </div>

        {/* Peta Lokasi */}
        <div className="w-full h-96 rounded-xl overflow-hidden shadow">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.920253123456!2d106.827153315316!3d-6.175110295529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e4b5b5b5b5%3A0x5b5b5b5b5b5b5b5b!2sMonas!5e0!3m2!1sen!2sid!4v1612345678901!5m2!1sen!2sid"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="border-0"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default KontakKami;
