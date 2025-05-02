import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth"; // Adjust the import path as necessary
import { redirect } from "next/navigation";
import LogoutButton from "../../components/ui/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  
  console.log("Dashboard Session:", session);
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      Welcome, {session.user?.name}!
      <LogoutButton /> 
    </div>
  );
}