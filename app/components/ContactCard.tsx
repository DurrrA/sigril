import React from "react";

const ContactCard = () => {
  return (
    <div
      className="rounded-lg p-6 shadow-md flex flex-col items-center text-center"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.59)" }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Perlu tanya-tanya?</h2>
      <p className="text-gray-700 text-lg mb-6">
        Jangan ragu! Hubungi kami langsung dan kami siap membantu kebutuhan BBQ, piknik, atau camping impianmu! 📩🔥
      </p>
      <button className="bg-[#3528AB] text-white px-6 py-2 rounded-full hover:bg-white hover:text-[#3528AB] transition duration-300">
        Kontak Kami
      </button>
    </div>
  );
};

export default ContactCard;