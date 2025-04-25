"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useLoginIsRequiredClient() {
  const session = useSession();
  const router = useRouter();

  if (!session.data) {
    router.push("/");
  }
}