"use client";

import React from "react";

const KontakKami = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center mt-5">Kontak Kami</h1>

      {/* Grid Kontak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Nomor Telepon */}
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-lg shadow-md">
          <i className="fas fa-phone-alt text-4xl text-blue-500"></i>
          <h2 className="text-lg font-bold text-gray-800">Nomor Telepon</h2>
          <p className="text-gray-600">+6285282017495</p>
        </div>

        {/* WhatsApp */}
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-lg shadow-md">
          <i className="fab fa-whatsapp text-4xl text-green-500"></i>
          <h2 className="text-lg font-bold text-gray-800">WhatsApp</h2>
          <p className="text-gray-600">+6285282017495</p>
        </div>

        {/* Instagram */}
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-lg shadow-md">
          <i className="fab fa-instagram text-4xl text-pink-500"></i>
          <h2 className="text-lg font-bold text-gray-800">Instagram</h2>
          <p className="text-gray-600">@kenam.plan_bgr</p>
        </div>

        {/* Alamat Toko */}
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-lg shadow-md">
          <i className="fas fa-map-marker-alt text-4xl text-red-500"></i>
          <h2 className="text-lg font-bold text-gray-800">Alamat Toko</h2>
          <p className="text-gray-600 text-center">Graha Cilebut Residence No.184, Cilebut Bar., Kec. Sukaraja, Kabupaten Bogor, Jawa Barat</p>
        </div>
      </div>

      {/* Peta Lokasi */}
      <div className="w-full h-96 rounded-lg overflow-hidden shadow-md mb-10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.920253123456!2d106.827153315316!3d-6.175110295529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e4b5b5b5b5%3A0x5b5b5b5b5b5b5b5b!2sMonas!5e0!3m2!1sen!2sid!4v1612345678901!5m2!1sen!2sid"
          width="100%"
          height="100%"
          allowFullScreen={true}
          loading="lazy"
          className="border-0"
        ></iframe>
      </div>
    </div>
  );
};

export default KontakKami;