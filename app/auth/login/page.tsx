'use client';

import React, { useState, useEffect } from "react";
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

const AuthPage = () => {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(searchParams?.get('mode') !== 'register');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const modeParam = searchParams?.get('mode');
    if (modeParam === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setLoginError(res.error);
    } else {
      router.refresh();
      router.push('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const loginRes = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginRes?.error) {
        setIsLogin(true);
        alert('Account created successfully! Please log in.');
      } else {
        router.refresh();
        router.push('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSignUpError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setSignUpLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3528ab]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3528ab] px-4">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        <div className="w-full md:w-1/2 p-8 relative"> {/* Reduced padding */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="mb-8"
            />
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#232323]">{isLogin ? 'Login' : 'Sign up'}</h1>
            <p className="text-gray-500 mt-1">
              {isLogin ? 'Login to your account' : 'Sign up to enjoy the features of Sigril'}
            </p>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3528ab] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#3528ab] transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 h-5 w-5 text-gray-400"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3475F7] hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg flex justify-center items-center transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-400 text-sm">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                type="button"
                className="w-full bg-white text-gray-800 border border-gray-300 px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors hover:bg-gray-50"
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
                <Link
                  href="/login?mode=register"
                  className="text-[#3528AB] font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {signUpError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {signUpError}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3528ab] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3528ab] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#3528ab] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 h-5 w-5 text-gray-400"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full bg-[#3475F7] hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg flex justify-center items-center transition-colors"
              >
                {signUpLoading ? (
                  <div className="flex items-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Creating account...
                  </div>
                ) : (
                  'Sign up'
                )}
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-400 text-sm">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                type="button"
                className="w-full bg-white text-gray-800 border border-gray-300 px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors hover:bg-gray-50"
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
                <Link
                  href="/login"
                  className="text-[#3528AB] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>

        <div className="hidden md:block md:w-1/2 relative h-[650px]"> {/* Adjusted height */}
          <Image
            src="/BBQU.png"
            alt="BBQ"
            fill
            className="object-cover rounded-r-2xl shadow-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
