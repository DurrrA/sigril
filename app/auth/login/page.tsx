import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginClient from "./loginClient"; // Adjust the import path as necessary

export default async function LoginPage() {
  const session = await getServerSession(authConfig);

  // Redirect if the user is already logged in
  if (session) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}