"use client";

import "../globals.css";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${poppins.variable} font-sans`}>
      <SessionProvider>
        {/* Admin-specific content can go here */}
        <main className="min-h-screen">
          {children}
        </main>
      </SessionProvider>
    </div>
  );
}