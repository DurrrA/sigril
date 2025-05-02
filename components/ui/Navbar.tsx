"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, UserCircle, LogIn, UserPlus, Package, User as UserIcon, LogOut, ShieldCheck } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { User } from "@/interfaces/user.interfaces"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const Navbar = () => {
  const { status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isLoggedIn = status === "authenticated"
  const [userData, setUserData] = useState<User | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  console.log(router)
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  // Close dropdown when route changes
  useEffect(() => {
    setDropdownOpen(false)
  }, [pathname])

  // Fetch user data when logged in
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

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev)
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }
  
  // Get cart item count
  const cartItemCount = userData?.keranjang?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <nav className="bg-[#3528AB] px-4 md:px-20 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 text-white font-medium">
        <Link
          href="/"
          className={cn(
            "px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]",
            pathname === "/" && "bg-white text-[#3528AB]"
          )}
        >
          Home
        </Link>
        <Link
          href="/produk"
          className={cn(
            "px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]",
            pathname === "/produk" && "bg-white text-[#3528AB]"
          )}
        >
          Produk
        </Link>
        <Link
          href="/kontak"
          className={cn(
            "px-3 py-1 rounded-full transition-all duration-300 hover:bg-white hover:text-[#3528AB]",
            pathname === "/kontak" && "bg-white text-[#3528AB]"
          )}
        >
          Kontak Kami
        </Link>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-4 relative">
        {/* Show user info when logged in */}
        {isLoggedIn && userData && (
          <div className="flex items-center gap-2 text-white md:flex">
            <span className="font-medium">
              Hi, {userData.username || userData.email.split('@')[0]}
            </span>
            
            {userData.avatar && (
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={userData.avatar} alt={userData.username || "Profile"} />
                <AvatarFallback>{userData.username?.[0] || userData.email?.[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
        )}
        
        {/* Shopping Cart with Badge */}
        <Link href="/keranjang" className="text-white hover:text-gray-300 relative">
          <ShoppingCart className="h-6 w-6" />
          {isLoggedIn && cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-white text-[#3528AB] px-1.5 py-0.5 min-w-[20px] text-xs flex items-center justify-center rounded-full">
              {cartItemCount}
            </Badge>
          )}
        </Link>

        {/* Profile Icon with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown} 
            className="text-white hover:text-gray-300 ml-2 focus:outline-none"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <UserCircle className="h-6 w-6" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 z-50 transition-all duration-200 ease-in-out">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-[#3528AB] hover:text-white transition-colors duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-3" /> Login
                  </Link>
                  <Link
                    href="/login?mode=register"
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-[#3528AB] hover:text-white transition-colors duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-3" /> Register
                  </Link>
                </>
              ) : (
                <>
                  {/* User Profile Info */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData?.avatar || ""} alt={userData?.username || "Profile"} />
                        <AvatarFallback className="bg-[#3528AB] text-white">
                          {userData?.username?.[0].toUpperCase() || userData?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userData?.username || userData?.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-500">{userData?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white transition-colors duration-200"
                    >
                      <UserIcon className="h-4 w-4 mr-3" /> Profil Saya
                    </Link>
                    <Link
                      href="/myTransaction"
                      className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white transition-colors duration-200"
                    >
                      <Package className="h-4 w-4 mr-3" /> Pesanan Saya
                    </Link>
                    
                    {/* Admin menu items */}
                    {userData?.role?.role_name === "Admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-gray-800 hover:bg-[#3528AB] hover:text-white transition-colors duration-200"
                      >
                        <ShieldCheck className="h-4 w-4 mr-3" /> Dashboard Admin
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
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
    </nav>
  )
}

export default Navbar