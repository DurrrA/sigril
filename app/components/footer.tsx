import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="bg-[#3528AB] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About Section */}
          <div>
            <div className="flex items-center mb-4">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
            </div>
            <p className="text-sm leading-relaxed">
            Kenam.Plan Bogor adalah platform penyewaan alat yang memudahkan Anda dalam mencari dan menyewa berbagai perlengkapan piknik, BBQ, dan aktivitas outdoor lainnya.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-gray-300">Beranda</a>
              </li>
              <li>
                <a href="/produk" className="hover:text-gray-300">Produk</a>
              </li>
              <li>
                <a href="/kontak" className="hover:text-gray-300">Kontak Kami</a>
              </li>
              <li>
                <a href="/tentang-kami" className="hover:text-gray-300">Tentang Kami</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-right">
            <h3 className="text-lg font-bold mb-4">Hubungi Kami</h3>
            <p className="text-sm">Jl. Raya Bogor No. 123, Bogor, Indonesia</p>
            <p className="text-sm">Email: info@kenamplan.com</p>
            <p className="text-sm">Telepon: +62 812-3456-7890</p>
            <div className="flex justify-end space-x-4 mt-4 text-lg">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-600 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Kenam.Plan Bogor. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
