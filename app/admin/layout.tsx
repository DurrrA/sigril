// app/admin/layout.tsx
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminProtection from "@/components/admin-protection";
import AuthProvider from "./AuthProvide"; // Make sure this path is correct

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await requireAdmin();

  
  
  return (
    <AuthProvider>
      <AdminProtection>
        <div className="min-h-screen flex">
          {children}
        </div>
      </AdminProtection>
    </AuthProvider>
  );
}