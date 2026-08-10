"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    // Clear the custom JWT cookies (email/password users)
    await fetch("/api/auth/logout", { method: "POST" });
    // Clear the NextAuth session cookie (Google OAuth users) — harmless no-op
    // if the user signed in via email/password instead.
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className={className ?? "hover:underline text-sm"}>
      Logout
    </button>
  );
}
