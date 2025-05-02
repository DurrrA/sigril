"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react"
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
    </SessionProvider>
  );
}
