"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State untuk status login
  const [dropdownOpen, setDropdownOpen] = useState(false); // State untuk dropdown

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Logika logout
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-[#3528AB] px-20 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-white font-medium">
          <Link
            href="/"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Home
          </Link>
          <a
            href="/produk"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Produk
          </a>
          <a
            href="/kontak"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Kontak Kami
          </a>
        </div>

        {/* Icons */}
        <div className="flex space-x-4 relative">
          <a href="/keranjang" className="text-white hover:text-gray-300 text-2xl">
            <i className="fas fa-shopping-cart"></i>
          </a>

          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="text-white hover:text-gray-300 ml-2 text-2xl focus:outline-none"
            >
              <i className="fas fa-user-circle"></i>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i> Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <i className="fas fa-user-plus mr-2"></i> Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/pesanan-saya"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <i className="fas fa-box mr-2"></i> Pesanan Saya
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <i className="fas fa-user mr-2"></i> Akun Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;