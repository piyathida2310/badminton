"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resetEmail, setResetEmail] = useState("");



  useEffect(() => {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (token && role) {
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        if (role === "manage") {
  router.replace("/manage");
} else if (role === "user") {
  router.replace("/user/tournament");
}

      })
      .catch(() => {
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
      });
  }
}, [router]);



  useEffect(() => {
    const isRegistered = searchParams.get("registered");
    if (isRegistered)
      setSuccessMessage(
        "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบด้วยบัญชีใหม่ของคุณ"
      );
    else setSuccessMessage("");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  //  ตรวจสอบ Gmail
  if (!form.email.endsWith("@gmail.com")) {
    setError("เข้าสู่ระบบได้เฉพาะบัญชี Gmail เท่านั้น");
    setLoading(false);
    return;
  }

  try {
    const resLogin = await api.post("/auth/login", form);
    const token = resLogin.data.accessToken;

    localStorage.setItem("accessToken", token);

    const resMe = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const roleMap: Record<string, string> = {
      ORGANIZER: "manage",
      PLAYER: "user",
    };

    const mappedRole = roleMap[resMe.data.role] || "user";
    localStorage.setItem("role", mappedRole);

    if (mappedRole === "manage") {
      router.replace("/manage");
    } else {
      router.replace("/user/tournament");
    }
  } catch (err: any) {
    setError(err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
  } finally {
    setLoading(false);
  }
};



const handleGoogleLoginSuccess = async (credentialResponse: any) => {
  if (!credentialResponse.credential) return;

  try {
    const { data } = await api.post("/auth/google", {
      idToken: credentialResponse.credential,
    });

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      const mappedRole = data.role === "PLAYER" ? "user" : "manage";
      localStorage.setItem("role", mappedRole);
      router.replace(mappedRole === "manage" ? "/manage" : "/user/tournament");
    } else if (data.needsProfile) {
      router.push(`/complete-profile?userId=${data.userId}`);
    }
  } catch (err) {
    console.error(err);
    setError("เกิดข้อผิดพลาด Google Login");
  }
};

const handleGoogleLoginError = () => {
  setError("Google Login ล้มเหลว");
};




  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF8E1] via-[#FFF3E0] to-[#E3F2FD]">
      {/* หัวข้อ */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-extrabold text-[#F06292]">BADMINTON</h1>
        <p className="text-sm text-gray-600 font-medium tracking-wide">
          Competition Management
        </p>
      </motion.div>

      {/* กล่องเข้าสู่ระบบ */}
      <div className="relative z-10 w-full max-w-md rounded-3xl p-10 bg-white shadow-lg border border-[#FFE0B2]">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          เข้าสู่ระบบ
        </h2>

        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-300 text-green-700 p-3 mb-4 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-300 text-rose-700 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-6">
  <GoogleLogin
    onSuccess={handleGoogleLoginSuccess}
    onError={handleGoogleLoginError}
    text="continue_with"
    shape="pill"          
    size="large"          
    theme="outline"       
  />
</div>



        <form onSubmit={handleSubmit} className="space-y-5">
          {/* อีเมล */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="อีเมล"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#FFD6E0] bg-[#FFF9F9] focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="รหัสผ่าน"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#FFD6E0] bg-[#FFF9F9] focus:ring-2 focus:ring-[#F8BBD0] focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
            />
           
          </div>
         
          <div className="text-right mt-2">
  <Link
    href="/forgotpassword"
    className="text-sm text-[#E91E63] hover:text-[#D81B60] font-medium transition-colors"
  >
    ลืมรหัสผ่าน?
  </Link>
</div>



          {/* ปุ่มเข้าสู่ระบบ */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white rounded-full bg-[#FFC107] hover:bg-[#FFB300] shadow-md transition-all duration-300 disabled:opacity-50 mt-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="text-[#E91E63] hover:text-[#D81B60] font-medium transition-colors"
          >
            สมัครสมาชิกใหม่
          </Link>
        </div>
      </div>

  
      
    </div>
  );
};

export default LoginPage;
