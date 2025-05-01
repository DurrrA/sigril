'use client';

import React, { useState } from "react";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EyeOffIcon } from "lucide-react";
import Image from "next/image";

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // State untuk login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // State untuk sign-up
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      alert('Login failed: ' + res.error);
    } else {
      router.push('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="mb-8"
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#232323]">{isLogin ? 'Login' : 'Sign up'}</h1>
            <p className="text-gray-500 mt-1">
              {isLogin ? 'Login to your account' : 'Sign up to enjoy the feature of Revolutie'}
            </p>
          </div>

          {isLogin ? (
            <div>
              {/* Login Form */}
              <input
                type="email"
                placeholder="Email"
                className="border p-2 mb-2 w-80"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 mb-4 w-80"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded w-80 transition-opacity duration-300 ease-in-out hover:opacity-80 active:opacity-60"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <hr className="my-4 w-80" />
              <button
                onClick={() => signIn('google')}
                className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded w-80 flex justify-center items-center gap-2 transition-all duration-300 hover:bg-gray-100"
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Login with Google
              </button>

              <p className="text-sm text-center mt-6 text-gray-600">
                Don&apos;t have an account?{" "}
                <a onClick={() => setIsLogin(false)} className="text-[#3528AB] font-semibold cursor-pointer">
                  Sign up
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sign Up Form */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jonas Khanwald"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3528ab]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jonas_kahnwald@gmail.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
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

              <button
                type="submit"
                className="w-full bg-[#3475F7] hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
              >
                Sign up
              </button>

              <div className="flex items-center my-2">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-400">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                onClick={() => signIn('google')}
                type="button"
                className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded w-80 flex justify-center items-center gap-2 transition-all duration-300 hover:bg-gray-100"
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </button>

              <p className="text-sm text-center mt-6 text-gray-600">
                Already have an account?{" "}
                <a onClick={() => setIsLogin(true)} className="text-[#3528AB] font-semibold cursor-pointer">
                  Sign in
                </a>
              </p>
            </form>
          )}
        </div>

        {/* Image Section */}
        <div className="hidden md:block md:w-205 relative h-[750px]">
          <Image
            src="/BBQU.png"
            alt="BBQ"
            fill
            className="object-cover rounded-r-2x8 shadow-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
