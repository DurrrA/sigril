// app/profile/page.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  fullName: string;
  dateOfBirth: string | null;
  profile_image: string | null;
}

const Profile = () => {
  const { status } = useSession();
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== "authenticated") return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/me");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch profile");
        }
        
        const profileData = await response.json();
        setUser(profileData);
        setFormData(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [status]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : null,
      });
    }
  };
  
  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      const updatedProfile = await response.json();
      setUser(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3528AB]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3528AB] text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center">User not found</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 mt-5 mb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Akun Saya</h1>
      
      {/* Profile Image */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center shadow-md relative">
          {user.profile_image ? (
            <Image
              src={user.profile_image}
              alt="Profile"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-4xl text-gray-500">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
          
          {isEditing && (
            <button
              className="absolute bottom-0 right-0 bg-[#3528AB] text-white rounded-full p-1"
              onClick={() => {/* Implement image upload */}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
              </svg>
            </button>
          )}
        </div>
        <p className="text-gray-600 mt-2">{user.username}</p>
      </div>
      
      {/* Profile Data */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">ID</h2>
          <p className="text-gray-600">{user.id}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Email</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Full Name</h2>
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={formData?.fullName || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
              placeholder="Enter your full name"
            />
          ) : (
            <p className="text-gray-600">{user.fullName || "Not set"}</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Username</h2>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData?.username || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
            />
          ) : (
            <p className="text-gray-600">{user.username}</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Date of Birth</h2>
          {isEditing ? (
            <input
              type="date"
              name="dateOfBirth"
              value={formData?.dateOfBirth ? format(new Date(formData.dateOfBirth), 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
            />
          ) : (
            <p className="text-gray-600">
              {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMMM dd, yyyy') : "Not set"}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Nomor Telepon</h2>
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={formData?.phone || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
              placeholder="+62 8xx xxxx xxxx"
            />
          ) : (
            <p className="text-gray-600">{user.phone || "Not set"}</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Alamat</h2>
          {isEditing ? (
            <textarea
              name="address"
              value={formData?.address || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
              rows={3}
              placeholder="Enter your full address"
            />
          ) : (
            <p className="text-gray-600">{user.address || "Not set"}</p>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-center mt-6">
        {isEditing ? (
          <div className="flex gap-4">
            <button
              onClick={() => {
                setFormData(user);
                setIsEditing(false);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-200 hover:bg-[#3528AB] hover:text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg> 
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;