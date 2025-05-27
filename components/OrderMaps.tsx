"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, parseISO, isWithinInterval, addDays  } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from '@/components/ui/calendar';

const { BaseLayer } = LayersControl;

// Fix for Leaflet icon issues
const icon = L.icon({
  iconUrl: '/icons/marker-icon-2x.png',
  shadowUrl: '/icons/marker-shadow.png',
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

interface OrdersMapProps {
  height?: string;
  className?: string;
}

// Component to fly to a location on the map
function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);
  
  return null;
}

export default function OrdersMap({ height = "600px", className = "" }: OrdersMapProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addresses, setAddresses] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Default to Jakarta
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<[Date | null, Date | null]>([null, null]);
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Define interface for Nominatim search results
  interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    place_id: number;
    osm_type?: string;
    osm_id?: number;
  }
  
  // Define map layers
  const mapLayers = {
    osm: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'
    },
    Topographic: {
      name: "Topographic",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
    },
    dark: {
      name: "Dark Mode",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  };

  // Define map layer type
  type MapLayerKey = 'osm' | 'satellite' | 'Topographic' | 'dark';
  
  // Set current layer state
  const [currentBaseLayer, ] = useState<MapLayerKey>("osm");
  
  useEffect(() => {
    console.log("Map layer changed to:", currentBaseLayer);
  }, [currentBaseLayer]);
  
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  
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
  
  // Fetch addresses for transactions
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
  
  // Fetch all transactions
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

  // Search for address/location using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // First, search within transactions
      const matchingTransaction = transactions.find(tx => 
        tx.id.toString() === searchQuery.trim() || 
        tx.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingTransaction && matchingTransaction.user.location_lat && matchingTransaction.user.location_long) {
        setFlyToTarget([matchingTransaction.user.location_lat, matchingTransaction.user.location_long]);
        setSearchResults([]);
        return;
      }
      
      // If no matching transaction, search for location
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'id' } }
      );
      
      const data = await response.json();
      setSearchResults(data);
      
      if (data && data.length > 0) {
        setFlyToTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setDateRangeFilter([null, null]);
    setSearchResults([]);
  };

  // Filter transactions based on search and filter criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Filter by status
      if (statusFilter && tx.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      
      // Filter by date range
      if (dateRangeFilter[0] && dateRangeFilter[1]) {
        const txDate = parseISO(tx.tanggal_transaksi);
        if (!isWithinInterval(txDate, { 
          start: dateRangeFilter[0], 
          end: addDays(dateRangeFilter[1], 1) // Include end date
        })) {
          return false;
        }
      }
      
      // Filter by search query (if not using geocoding)
      if (searchQuery && !searchResults.length) {
        const query = searchQuery.toLowerCase();
        const matchesId = tx.id.toString().includes(query);
        const matchesCustomer = tx.user.username.toLowerCase().includes(query) || 
                               tx.user.email.toLowerCase().includes(query) ||
                               tx.user.phone.toLowerCase().includes(query);
        const matchesAddress = addresses[tx.id]?.toLowerCase().includes(query);
        
        if (!(matchesId || matchesCustomer || matchesAddress)) {
          return false;
        }
      }
      
      return true;
    });
  }, [transactions, statusFilter, dateRangeFilter, searchQuery, searchResults.length, addresses]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading order map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Search and Filter Controls */}
      <div className="absolute top-20 left-4 right-4 z-[1000] flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by order ID, customer, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-white shadow-md"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 max-h-[200px] overflow-y-auto z-50">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm border-b border-gray-100 last:border-none"
                  onClick={() => {
                    setFlyToTarget([parseFloat(result.lat), parseFloat(result.lon)]);
                    setSearchResults([]);
                  }}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layer Switcher Dropdown (keep for UI consistency, but it won't control the map) */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white shadow-md flex gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Map Style</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(mapLayers).map(([key, layer]) => (
              <DropdownMenuItem 
                key={key}
                className={currentBaseLayer === key ? "bg-gray-100 font-medium" : ""}
                onClick={() => {
                  console.log("Changing to layer:", key);
                  setCurrentBaseLayer(key as MapLayerKey);
                }}
              >
                {layer.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Filter button - opens filter drawer on mobile */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="bg-white shadow-md flex sm:hidden gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filter Orders</DrawerTitle>
            </DrawerHeader>
            
            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <div className="space-y-2">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRangeFilter[0] || undefined,
                      to: dateRangeFilter[1] || undefined
                    }}
                    onSelect={(range) => 
                      setDateRangeFilter([
                        range?.from || null,
                        range?.to || null
                      ])
                    }
                    className="border rounded-md p-3"
                  />
                </div>
              </div>
              
              {/* Reset Button */}
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
            
            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Apply Filters</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Reset button (shows only when filters are applied) */}
        {(statusFilter || dateRangeFilter[0] || dateRangeFilter[1] || searchQuery) && (
          <Button 
            variant="ghost" 
            onClick={resetFilters}
            className="bg-white shadow-md"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Results counter */}
      <div className="absolute top-22 sm:top-8 right-16 z-[1000] bg-white px-2 py-1 rounded-md shadow-sm text-xs">
        {filteredTransactions.length} orders
      </div>

      {/* Map Container */}
      <div className="h-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={center as L.LatLngExpression}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Use Leaflet's built-in layer control instead */}
          <LayersControl position="topright">
            <BaseLayer checked={currentBaseLayer === "osm"} name="OpenStreetMap">
              <TileLayer
                attribution={mapLayers.osm.attribution}
                url={mapLayers.osm.url}
              />
            </BaseLayer>
            <BaseLayer checked={currentBaseLayer === "satellite"} name="Satellite">
              <TileLayer
                attribution={mapLayers.satellite.attribution}
                url={mapLayers.satellite.url}
              />
            </BaseLayer>
            <BaseLayer checked={currentBaseLayer === "Topographic"} name="Topographic">
              <TileLayer
                attribution={mapLayers.Topographic.attribution}
                url={mapLayers.Topographic.url}
              />
            </BaseLayer>
            <BaseLayer checked={currentBaseLayer === "dark"} name="Dark Mode">
              <TileLayer
                attribution={mapLayers.dark.attribution}
                url={mapLayers.dark.url}
              />
            </BaseLayer>
          </LayersControl>
          
          {/* Component to fly to a location when search is performed */}
          <FlyToLocation position={flyToTarget} />
          
          {/* Markers for transactions */}
          {filteredTransactions.map((transaction) => {
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
    </div>
  );
}