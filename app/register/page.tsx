"use client";

import React, { useState } from "react";
import { EyeOffIcon } from "lucide-react";
import Image from "next/image";

interface SignUpData {
  name: string;
  dob: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    dob: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Tambahkan logika submit ke API di sini
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3528ab] px-4">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-10 relative">
          {/* Logo */}
          <Image
          src="/logo.png" // Pastikan file ada di folder 'public'
          alt="Logo"
          width={40}  
          height={40}
          className="mb-8"
         />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#232323]">Sign up</h1>
            <p className="text-gray-500 mt-1">
              Sign up to enjoy the feature of Revolutie
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jonas Khanwald"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3528ab]"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm text-gray -600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jonas_kahnwald@gmail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10"
                />
                <EyeOffIcon className="absolute top-2.5 right-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#3475F7] hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
            >
              Sign up
            </button>

            {/* Divider */}
            <div className="flex items-center my-2">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-gray-400">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full border border-gray-300 flex justify-center items-center py-2 rounded-lg hover:bg-gray-100"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </button>
          </form>

          {/* Redirect Link */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account??{" "}
            <a href="#" className="text-[#3528AB] font-semibold">
              Sign in
            </a>
          </p>
        </div>

        {/* Image Section */}
        <div className="hidden md:block md:w-205 relative h-[750px]">
          <Image
            src="/BBQU.png"          // Pastikan file ini ada di folder 'public'
            alt="BBQ"
            fill                     // Gunakan 'fill' agar memenuhi container
            className="object-cover rounded-r-2x8 shadow-lg" // Tambahan styling opsional
            priority                 // Opsional: prioritaskan loading gambar ini
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
