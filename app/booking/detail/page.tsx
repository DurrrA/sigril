"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ArrowLeft, Loader2 } from "lucide-react"
import { useMapEvents } from "react-leaflet"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import "leaflet/dist/leaflet.css"
import dynamic from "next/dynamic"
import { format } from "date-fns"
import L from "leaflet"

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

interface RentalItem {
  id: string;
  barangId: number;
  name: string;
  image: string;
  price: number;
  initialQuantity: number;
  startDate: string | Date;
  endDate: string | Date;
  rentalDays: number;
  subtotal: number;
}

const icon = L.icon({
  iconUrl: '/icons/marker-icon-2x.png',
  shadowUrl: '/icons/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],  
  shadowSize: [41, 41]
});

// Helper component for picking location
function LocationPicker({
  lat,
  long,
  setLatLong,
}: {
  lat: string;
  long: string;
  setLatLong: (lat: string, long: string) => void;
}) {
  useMapEvents({ // plural, not singular
    click(e) {
      setLatLong(e.latlng.lat.toString(), e.latlng.lng.toString());
    },
  });

  return lat && long ? (
    <Marker position={[parseFloat(lat), parseFloat(long)]} icon={icon} />
  ) : null;
}

export default function BookingDetailsPage() {
  const router = useRouter()
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    lat: "",
    long: "",
    full_name: "",
    isLoading: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load selected items from sessionStorage
    const loadItemsFromSession = () => {
      try {
        setIsLoading(true)

        // First check for items in sessionStorage
        const selectedCartItemsJSON = sessionStorage.getItem('selectedCartItems')
        const cartTotal = sessionStorage.getItem('cartTotal')

        if (!selectedCartItemsJSON || !cartTotal) {
          toast.error("No items found in your booking")
          router.push('/keranjang')
          return
        }

        const selectedItems = JSON.parse(selectedCartItemsJSON)
        setRentalItems(selectedItems)
        setTotalAmount(parseFloat(cartTotal))
        
        // Load user data in parallel
        loadUserData()
      } catch (error) {
        console.error("Error loading session data:", error)
        toast.error("Failed to load booking data")
        router.push('/keranjang')
      } finally {
        setIsLoading(false)
      }
    }

    const loadUserData = async () => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'include'
    })

    if (!response.ok) {
      router.push('/login?redirect=/booking/details')
      return
    }

    const userData = await response.json()
    if (userData.data.user) {
      setUserData({
        full_name: userData.data.user.full_name || "",
        name: userData.data.user.fullname || userData.data.user.username || "",
        phone: userData.data.user.no_telp || "",
        email: userData.data.user.email || "",
        // Map from location_lat and location_long to lat/long in your state
        lat: userData.data.user.location_lat || "",
        long: userData.data.user.location_long || "",
        address: userData.data.user.alamat || "",
        isLoading: false
      });
    }
    console.log("User data from API:", userData.data.user);
  } catch (error) {
    console.error("Error loading user data:", error)
    toast.error("Failed to load user information")
    setUserData(prev => ({ ...prev, isLoading: false }))
  }
}

    loadItemsFromSession()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Basic validation
  if (!userData.name || !userData.phone || !userData.email || !userData.address) {
    toast.error("Please fill all required fields");
    return;
  }

  try {
    setIsSubmitting(true);

    // Log what we're sending for debugging
    console.log("Sending location data:", {
      lat: userData.lat,
      long: userData.long,
      address: userData.address
    });

    // Create FormData instead of JSON
    const formData = new FormData();
    formData.append("fullName", userData.name);
    formData.append("phone", userData.phone);
    formData.append("address", userData.address);
    
    // Use the correct field names - location_lat and location_long
    formData.append("location_lat", userData.lat); 
    formData.append("location_long", userData.long);
    formData.append("username", userData.full_name);
    
    // Send FormData without Content-Type header (browser will set it automatically)
    const response = await fetch('/api/me', {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    // Log location data after sending
    console.log("Location data sent to server:", {
      location_lat: userData.lat,
      location_long: userData.long,
      address: userData.address
    });

    // Also log the response for debugging
    const responseData = await response.json();
    console.log("Server response:", responseData);

    // Store the address for the payment page
    sessionStorage.setItem('userAddress', userData.address);
    sessionStorage.setItem('userLat', userData.lat);
    sessionStorage.setItem('userLong', userData.long);
    
    // Continue to payment page
    router.push('/payment');
  } catch (error) {
    console.error("Error saving user data:", error);
    toast.error("Failed to save your details");
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading || userData.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Back button */}
      <Link href="/keranjang" className="flex items-center text-sm mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Link>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center w-full max-w-md">
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-[#3528AB] text-white flex items-center justify-center w-8 h-8 z-10">1</div>
            <div className="text-xs mt-2 text-[#3528AB]">Booking Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-[#3528AB]"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-[#3528AB] text-white flex items-center justify-center w-8 h-8 z-10">2</div>
            <div className="text-xs mt-2 text-[#3528AB] font-medium">Your Details</div>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-gray-200 text-gray-600 flex items-center justify-center w-8 h-8 z-10">
              3
            </div>
            <div className="text-xs mt-2 text-gray-600">Payment</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Informasi Pemesan</h2>

            <div className="space-y-4">
              <div>
                <label className="font-medium block mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium block mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor telepon"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium block mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat email"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    readOnly={!!userData.email}
                  />
                </div>
              </div>

              <div>
                <label className="font-medium block mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={userData.address}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                ></textarea>
              </div>

              {/* Leaflet Map for Lat/Long */}
              <div>
                <label className="font-medium block mb-2">Pilih Lokasi di Peta (klik untuk menandai)</label>
                <div style={{ height: 300, width: "100%" }}>
                  {typeof window !== "undefined" && MapContainer && TileLayer && Marker && (
                    <MapContainer
                      center={[
                        userData.lat ? parseFloat(userData.lat) : -6.2,
                        userData.long ? parseFloat(userData.long) : 106.8
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        lat={userData.lat}
                        long={userData.long}
                        setLatLong={(lat, long) => setUserData(prev => ({ ...prev, lat, long }))}
                      />
                    </MapContainer>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md text-sm text-gray-700 border border-yellow-200">
                <h3 className="font-medium mb-2">Ketentuan:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Bersedia menyerahkan identitas pribadi (KTP/SIM) sebagai jaminan.</li>
                  <li>Jika tidak mau menyerahkan, maka bersedia membayar uang deposit sebagai jaminan peminjaman.</li>
                  <li>Produk yang rusak atau hilang selama masa sewa menjadi tanggung jawab penyewa.</li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      Memproses...
                    </>
                  ) : (
                    "Lanjutkan ke Pembayaran"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-medium mb-4">Ringkasan Pesanan</h3>

            {/* List of items */}
            <div className="space-y-4 mb-6">
              {rentalItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="text-sm text-gray-600 flex items-center mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>
                        {format(new Date(item.startDate), "dd/MM/yyyy")} - {format(new Date(item.endDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-600">
                        {item.initialQuantity} × {item.rentalDays} hari
                      </span>
                      <span className="font-medium">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-500">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}