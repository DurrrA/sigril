"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart,
  UserCircle,
  LogIn,
  UserPlus,
  Package,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { User } from "@/interfaces/user.interfaces"

const Navbar = () => {
  const { status } = useSession()
  const [userData, setUserData] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isLoggedIn = status === "authenticated"

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Tutup dropdown & mobile menu saat rute berubah
  useEffect(() => {
    setDropdownOpen(false)
    setMobileOpen(false)
  }, [pathname])

  // Ambil data user saat login
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch("/api/me")
          if (response.ok) {
            const data = await response.json()
            setUserData(data.data.user)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserData(null)
      }
    }

    fetchUserData()
  }, [isLoggedIn])

  const toggleDropdown = () => setDropdownOpen((prev) => !prev)
  const toggleMobile = () => setMobileOpen((prev) => !prev)

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  const cartItemCount =
    userData?.keranjang?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <nav className="bg-[#3528AB] px-4 md:px-20 py-3 sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>

        {/* Hamburger Mobile */}
        <button
          className="md:hidden text-white"
          onClick={toggleMobile}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Navigasi Tengah Desktop */}
        <div className="hidden md:flex space-x-6 text-white font-medium absolute left-1/2 transform -translate-x-1/2">
          {[
            { label: "Home", href: "/" },
            { label: "Produk", href: "/produk" },
            { label: "Kontak Kami", href: "/kontak" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]",
                pathname === link.href && "bg-white text-[#3528AB]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Ikon Kanan */}
        <div className="flex items-center gap-4 text-white">
          {/* User Info Desktop */}
          {isLoggedIn && userData && (
            <div className="hidden md:flex fixed top-4 right-40 z-50 items-center gap-2">
              <span className="font-medium">
                Hi, {userData.username || userData.email.split("@")[0]}
              </span>
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={userData?.avatar || ""} alt="Profile" />
                <AvatarFallback>
                  {userData?.username?.[0]?.toUpperCase() ||
                    userData?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Keranjang */}
          <Link href="/keranjang" className="relative hover:text-gray-300">
            <ShoppingCart className="h-6 w-6" />
            {isLoggedIn && cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-white text-[#3528AB] px-1.5 py-0.5 min-w-[20px] text-xs flex items-center justify-center rounded-full">
                {cartItemCount}
              </Badge>
            )}
          </Link>

          {/* Dropdown Profil */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="hover:text-gray-300 focus:outline-none"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              <UserCircle className="h-6 w-6" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 z-50 transition-all duration-200 ease-in-out">
                {/* Jika belum login */}
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center px-4 py-3 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <LogIn className="h-4 w-4 mr-3" /> Login
                    </Link>
                    <Link
                      href="/login?mode=register"
                      className="flex items-center px-4 py-3 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-3" /> Register
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Header User */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userData?.avatar || ""} alt="Profile" />
                          <AvatarFallback className="bg-[#3528AB] text-white">
                            {userData?.username?.[0]?.toUpperCase() ||
                              userData?.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#3528AB]">
                            {userData?.username || userData?.email.split("@")[0]}
                          </p>
                          <p className="text-xs text-gray-500">{userData?.email}</p>
                        </div>
                      </div>
                    </div>
                    {/* Menu User */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                      >
                        <UserIcon className="h-4 w-4 mr-3" /> Profil Saya
                      </Link>
                      <Link
                        href="/myTransaction"
                        className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                      >
                        <Package className="h-4 w-4 mr-3" /> Pesanan Saya
                      </Link>
                      {userData?.role?.role_name === "Admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white"
                        >
                          <ShieldCheck className="h-4 w-4 mr-3" /> Dashboard Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileOpen && (
        <div className="md:hidden mt-2 space-y-2 bg-[#3528AB] px-4 py-4">
          {[
            { label: "Home", href: "/" },
            { label: "Produk", href: "/produk" },
            { label: "Kontak Kami", href: "/kontak" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded transition-all duration-300 text-white",
                pathname === link.href && "bg-white text-[#3528AB]"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && userData ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded text-white hover:bg-white hover:text-[#3528AB]"
              >
                Profil Saya
              </Link>
              <Link
                href="/myTransaction"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded text-white hover:bg-white hover:text-[#3528AB]"
              >
                Pesanan Saya
              </Link>
              {userData.role?.id === 1 && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded text-white hover:bg-white hover:text-[#3528AB]"
                >
                  Dashboard Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileOpen(false)
                  handleLogout()
                }}
                className="w-full text-left block px-3 py-2 rounded text-red-300 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded text-white hover:bg-white hover:text-[#3528AB]"
              >
                Login
              </Link>
              <Link
                href="/login?mode=register"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded text-white hover:bg-white hover:text-[#3528AB]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
