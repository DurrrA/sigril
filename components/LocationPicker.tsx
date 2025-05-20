"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

// Fix for Leaflet icon issues
const icon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  onLocationSelected?: (location: {lat: number, lng: number, address: string}) => void;
}

export default function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Default to Jakarta
  
  // Fetch user's saved location on load
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Updated to match the structure from /api/me endpoint
          if (data.data?.user?.location_lat && data.data?.user?.location_lng) {
            setPosition({
              lat: data.data.user.location_lat,
              lng: data.data.user.location_lng
            });
            setAddress(data.data.user.location_address || '');
            setCenter([data.data.user.location_lat, data.data.user.location_lng]);
          }
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocation();
  }, []);
  
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const newPosition = {lat: e.latlng.lat, lng: e.latlng.lng};
        setPosition(newPosition);
        reverseGeocode(newPosition.lat, newPosition.lng);
        
        if (onLocationSelected) {
          onLocationSelected({...newPosition, address});
        }
      },
    });
  
    return position === null ? null : (
      <Marker position={position} icon={icon}>
        <Popup>Your selected location</Popup>
      </Marker>
    );
  }
  
  async function reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
        
        if (onLocationSelected) {
          onLocationSelected({lat, lng, address: data.display_name});
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }
  
  const saveLocation = async () => {
    if (!position) return;
    
    setSaving(true);
    try {
      // Updated to use /api/me endpoint for location updates
      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lat: position.lat,
          lng: position.lng,
          address: address
        })
      });
      
      if (response.ok) {
        toast.success("Location saved to your profile");
      } else {
        toast.error("Failed to save location");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Error saving location");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#3528AB]" />
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={center as L.LatLngExpression}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
      
      {position && (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="font-semibold text-sm">Selected Location:</p>
            <p className="text-xs text-gray-600 mt-1">{address || 'Address not available'}</p>
          </div>
          
          <Button 
            onClick={saveLocation} 
            className="w-full bg-[#3528AB] hover:bg-[#291f8c]"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save to My Profile'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}