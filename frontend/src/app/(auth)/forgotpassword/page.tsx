"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendLink = async () => {
    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    try {
      await api.post("/auth/request-reset-password", { email });
      setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "ส่งลิงก์ไม่สำเร็จ");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">ลืมรหัสผ่าน</h2>
        {message && <p className="text-green-500 mb-2">{message}</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="กรอกอีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button
          onClick={handleSendLink}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
