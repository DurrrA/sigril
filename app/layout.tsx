"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { Suspense, memo } from "react";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});


const MemoizedNavbar = memo(Navbar);
const MemoizedFooter = memo(Footer);

const NavbarFallback = () => <div className="h-16 w-full bg-gray-100 animate-pulse" />;
const FooterFallback = () => <div className="h-32 w-full bg-gray-100 animate-pulse" />;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || "";
  
  const isAdminOrAuth = pathname.startsWith('/admin') || pathname.startsWith('/auth') || 
                        pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <html lang="en" className={isAdminOrAuth ? 'admin-auth-page' : 'main-page'}>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <SessionProvider>
          {!isAdminOrAuth && (
            <Suspense fallback={<NavbarFallback />}>
              <MemoizedNavbar />
            </Suspense>
          )}
          
          <main className={`min-h-screen ${isAdminOrAuth ? '' : 'pt-4 pb-8'}`}>
            {children}
          </main>
          
          {!isAdminOrAuth && (
            <Suspense fallback={<FooterFallback />}>
              <MemoizedFooter />
            </Suspense>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}