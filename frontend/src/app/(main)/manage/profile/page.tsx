"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleLogout = () => {
    // ล้างข้อมูล session / token
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
 
    <div className="h-full w-full pt-10 overflow-hidden flex items-center justify-center p-1 relative bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 ">
   
      

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative p-10  mb-11 overflow-hidden w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_10px_40px_-10px_rgba(255,182,193,0.5)]  max-w-md border border-pink-200"
      >
        <h1 className="text-center text-4xl font-extrabold text-pink-500 mb-8 drop-shadow-md">
          โปรไฟล์ 
        </h1>

        <form className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              ชื่อ–นามสกุล
            </label>
            <input
              type="text"
              defaultValue="ปิยธิดา อันชม"
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 bg-pink-50 placeholder:text-gray-400 transition-all"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              ชื่อเล่น
            </label>
            <input
              type="text"
              defaultValue="ฝ้าย"
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 bg-pink-50"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              defaultValue="fai.baddy@example.com"
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 bg-pink-50"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              defaultValue="12345678"
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 bg-pink-50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            type="button"
            className="w-full mt-6 bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-rose-300/70 transition-all"
          >
            ออกจากระบบ
          </motion.button>
        </form>

       
      </motion.div>
    </div>

 
  );
}
