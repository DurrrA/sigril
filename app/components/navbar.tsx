import { Asset } from 'next/font/google'
import Image from 'next/image'
import React from 'react'

const Navbar = () => {
  return (
    <>
      <nav className="bg-[#3528AB] px-20 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </a>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-white font-medium">
          <a
            href="/"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Home
          </a>
          <a
            href="/produk"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Produk
          </a>
          <a
            href="/kontak-kami"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Kontak Kami
          </a>
        </div>

        {/* Icons */}
        <div className="flex space-x-4">
          <a href="/keranjang" className="text-white hover:text-gray-300 text-2xl">
            <i className="fas fa-shopping-cart"></i>
          </a>
          <a href="/akun" className="text-white hover:text-gray-300 ml-2 text-2xl">
            <i className="fas fa-user-circle"></i>
          </a>
        </div>
      </nav>
    </>
  )
}

export default Navbar
