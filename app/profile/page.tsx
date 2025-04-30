//BLOM DINAMIS -DURRR
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  username: string;
  phone: string;
  address: string;
  profile_image: string | null;
}

const Profile = () => {
  // Data lokal sebagai fallback
  const localUser: UserProfile = {
    id: "123456",
    username: "john_doe",
    phone: "+62 812 3456 7890",
    address: "Graha Cilebut Residence No.184, Cilebut Bar., Kec. Sukaraja, Kabupaten Bogor, Jawa Barat",
    profile_image: null, // Ganti dengan URL gambar jika ada
  };

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State untuk mode edit
  const [formData, setFormData] = useState<UserProfile | null>(null); // State untuk data form

  useEffect(() => {
    // Ganti ID ini dengan ID pengguna yang ingin diambil
    const userId = "123456";

    // Ambil data pengguna dari API
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) {
          throw new Error("User not found");
        }
        const data = await response.json();
        setUser(data);
        setFormData(data); // Set form data dengan data pengguna
      } catch (error) {
        console.error("Error fetching user:", error);
        // Jika terjadi error, gunakan data lokal
        setUser(localUser);
        setFormData(localUser); // Set form data dengan data lokal
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSave = () => {
    setUser(formData); // Simpan perubahan ke state user
    setIsEditing(false); // Keluar dari mode edit
    console.log("Data yang disimpan:", formData); // Debugging: log data yang disimpan
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!user) {
    return <p className="text-center">User not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-5 mb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Akun Saya</h1>

      {/* Gambar Profil */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
          {user.profile_image ? (
            <Image
              src={user.profile_image}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <i className="fas fa-user text-4xl text-gray-500"></i>
          )}
        </div>
        <p className="text-gray-600 mt-2">{user.username}</p>
      </div>

      {/* Informasi Profil */}
      <div className="grid grid-cols-1 gap-4">
        {/* ID */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">ID</h2>
          <p className="text-gray-600">{user.id}</p>
        </div>

        {/* Username */}
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

        {/* Nomor Telepon */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Nomor Telepon</h2>
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={formData?.phone || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
            />
          ) : (
            <p className="text-gray-600">{user.phone}</p>
          )}
        </div>

        {/* Alamat */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800">Alamat</h2>
          {isEditing ? (
            <textarea
              name="address"
              value={formData?.address || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 mt-2"
            />
          ) : (
            <p className="text-gray-600">{user.address}</p>
          )}
        </div>
      </div>

      {/* Tombol Edit/Simpan */}
      <div className="flex justify-center mt-6">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            Simpan
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-200 hover:bg-[#3528AB] hover:text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2"
          >
            <i className="fas fa-pencil-alt"></i> Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;