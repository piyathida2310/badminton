"use client";

import { useEffect } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    const checkRole = async () => {
      const res = await fetch(
        `http://localhost:8000/auth/get-role?userName=${user.id}`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (!data.role) {
        router.replace("/register");
        return;
      }

      router.replace(
        data.role === "PLAYER" ? "/user/tournament" : "/manage"
      );
    };

    checkRole();
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn />
    </div>
  );
}
