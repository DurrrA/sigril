import AuthProvider from "./AuthProvide";
import "../globals.css";

export const metadata = {
  title: "Kenamplan Admin",
  description: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthProvider>
  );
}