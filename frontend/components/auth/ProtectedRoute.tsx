"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // ❌ ไม่ได้ login → ออกไปหน้า login
    if (!isSignedIn) {
      router.replace("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  // ⛔ ยังไม่โหลด Clerk (ป้องกันกระพริบหรือ redirect ผิด)
  if (!isLoaded) return null;

  // ⛔ Clerk โหลดแล้วแต่ไม่ได้ login
  if (!isSignedIn) return null;

  // ✔ Clerk โหลดเสร็จ + login แล้ว
  return <>{children}</>;
}
