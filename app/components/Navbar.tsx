"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, UserCircle, LogIn, UserPlus, Package, User, LogOut } from "lucide-react"

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // State untuk status login
  const [dropdownOpen, setDropdownOpen] = useState(false) // State untuk dropdown

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  const handleLogout = () => {
    // Logika logout
    setIsLoggedIn(false)
    setDropdownOpen(false)
  }

  return (
    <>
      <nav className="bg-[#3528AB] px-4 md:px-20 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6 text-white font-medium">
          <Link
            href="/"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Home
          </Link>
          <Link
            href="/produk"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Produk
          </Link>
          <Link
            href="/kontak"
            className="px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]"
          >
            Kontak Kami
          </Link>
        </div>

        {/* Icons */}
        <div className="flex space-x-4 relative">
          <Link href="/keranjang" className="text-white hover:text-gray-300">
            <ShoppingCart className="h-6 w-6" />
          </Link>

          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button onClick={toggleDropdown} className="text-white hover:text-gray-300 ml-2 focus:outline-none">
              <UserCircle className="h-6 w-6" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <LogIn className="h-4 w-4 mr-2" /> Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" /> Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/pesanan-saya"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <Package className="h-4 w-4 mr-2" /> Pesanan Saya
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <User className="h-4 w-4 mr-2" /> Akun Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
