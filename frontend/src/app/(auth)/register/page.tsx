"use client";

import { useState, useEffect } from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      const res = await fetch(
        `http://localhost:8000/auth/get-role?userName=${user.id}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (data.role === "PLAYER") {
        router.replace("/user/tournament");
        return;
      }

      if (data.role === "ORGANIZER") {
        router.replace("/manage");
        return;
      }

      setShowRoleSelection(true);
      setLoading(false);
    };

    checkRole();
  }, [isLoaded]);

  const handleSelectRole = async (role: string) => {
    if (!user) return;

    setLoading(true);

    const res = await fetch("http://localhost:8000/auth/create-from-clerk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
      }),
    });

    if (res.ok) {
      router.replace(role === "PLAYER" ? "/user/tournament" : "/manage");
    } else {
      alert("เกิดข้อผิดพลาด");
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-6">สมัครสมาชิก</h2>

      {!showRoleSelection && (
        <div className="w-full max-w-md p-6 rounded-3xl bg-white shadow">
          <SignUp />
        </div>
      )}

      {showRoleSelection && (
        <div className="w-full max-w-md p-6 rounded-3xl bg-white shadow flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4">เลือกบทบาทของคุณ</h3>

          <div className="flex gap-6">
            <button
              onClick={() => handleSelectRole("PLAYER")}
              className="px-6 py-3 bg-pink-400 text-white rounded-xl"
            >
              ผู้เล่น
            </button>

            <button
              onClick={() => handleSelectRole("ORGANIZER")}
              className="px-6 py-3 bg-yellow-400 text-white rounded-xl"
            >
              ผู้จัดแข่งขัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
