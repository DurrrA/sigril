"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

// Fix for Leaflet icon issues
const icon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Define transaction interface
interface Transaction {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    address: string;
    location_lat: number;
    location_long: number;
    // Removed location_address
  };
  tanggal_transaksi: string;
  start_date: string;
  end_date: string;
  status: string;
  totalAmount: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export default function OrdersMap() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addresses, setAddresses] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Default to Jakarta
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMM yyyy', { locale: id });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };
  
  // Fetch addresses for transactions with coordinates
  useEffect(() => {
    const getAddresses = async () => {
      const addressData: Record<number, string> = {};
      
      for (const tx of transactions) {
        if (tx.user.location_lat && tx.user.location_long) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${tx.user.location_lat}&lon=${tx.user.location_long}&format=json`,
              { headers: { 'Accept-Language': 'id' } }
            );
            const data = await response.json();
            
            if (data && data.display_name) {
              addressData[tx.id] = data.display_name;
            }
            
            // Respect rate limits by waiting 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error fetching address for transaction ${tx.id}:`, error);
          }
        }
      }
      
      setAddresses(addressData);
    };
    
    if (transactions.length > 0) {
      getAddresses();
    }
  }, [transactions]);
  
  // Fetch all transactions with user locations
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transaksi/admin/location', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction data');
        }
        
        const data = await response.json();
        setTransactions(data.data || []);
        
        // If there are transactions, center the map on the first one
        if (data.data && data.data.length > 0 && data.data[0].user) {
          setCenter([data.data[0].user.location_lat, data.data[0].user.location_long]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading order map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center as L.LatLngExpression}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {transactions.map((transaction) => {
          // Only display transactions from users with location data
          if (!transaction.user || !transaction.user.location_lat || !transaction.user.location_long) {
            return null;
          }
          
          return (
            <Marker 
              key={transaction.id}
              position={[transaction.user.location_lat, transaction.user.location_long]} 
              icon={icon}
            >
              <Popup className="transaction-popup" minWidth={280} maxWidth={320}>
                <div className="p-1">
                  <h3 className="font-bold text-md border-b pb-2 mb-2">
                    Order #{transaction.id}
                  </h3>
                  
                  <div className="text-sm space-y-2">
                    <div>
                      <p className="font-semibold">Customer</p>
                      <p>{transaction.user.username}</p>
                      <p>{transaction.user.phone}</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-xs">
                        {addresses[transaction.id] || transaction.user.address || 'No address available'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold">Date</p>
                        <p>{formatDate(transaction.tanggal_transaksi)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Status</p>
                        <p className={`${
                          transaction.status === 'completed' ? 'text-green-600' : 
                          transaction.status === 'cancelled' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold">Coordinates</p>
                      <p className="text-xs">
                        {transaction.user.location_lat.toFixed(6)}, {transaction.user.location_long.toFixed(6)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold">Items</p>
                      <ul className="list-disc list-inside text-xs">
                        {transaction.items.map(item => (
                          <li key={item.id}>
                            {item.name} (x{item.quantity}) - {formatCurrency(item.subtotal)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="font-semibold text-right border-t pt-2 mt-2">
                      Total: {formatCurrency(transaction.totalAmount)}
                    </div>
                    
                    <div className="text-center mt-2">
                      <a 
                        href={`/admin/transaksi/${transaction.id}`}
                        className="text-[#3528AB] hover:underline text-xs"
                      >
                        View Complete Details →
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}