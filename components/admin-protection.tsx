"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminProtection({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/login?redirect=/admin/barang');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthorized(false);
        router.push('/login?redirect=/admin/barang');
      }
    }
    
    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3528AB]" />
        <span className="ml-2">Checking authorization...</span>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null; // Will redirect, but render nothing in the meantime
  }

  return <>{children}</>;
}