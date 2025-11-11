"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Upload, LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullname: " ",
    nickname: " ",
    email: "",
    avatar: "", 
  });

  // เมื่ออัปโหลดรูปใหม่
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageURL = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar: imageURL }));
  };

  const handleChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Token not found");

    console.log(" Sending update:", {
      fullName: profile.fullname,
      email: profile.email,
      username: profile.nickname,
    });

    const res = await api.patch(
      "/auth/me",
      {
        fullName: profile.fullname,
        email: profile.email,
        username: profile.nickname,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Update response:", res.data);
    alert("อัปเดตข้อมูลเรียบร้อยแล้ว!");
    setIsEditing(false);
  } catch (err: any) {
    console.error(" Update error:", err.response?.data || err.message);
    alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
  }
};



  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    alert("ออกจากระบบเรียบร้อย!");
    router.push("/");
  };

  //  ดึงข้อมูลผู้ใช้จาก token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile((prev) => ({
          ...prev,
          fullname: `${res.data.firstName} ${res.data.lastName}`,
          nickname: res.data.userName,
          email: res.data.email,
          avatar: res.data.avatar || prev.avatar || "",
        }));
      });
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#F3F8FF] via-[#FFF4F6] to-[#FFFDF0] flex justify-center items-center">
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row"
  >

        {/* LEFT SIDE: AVATAR */}
        <div className=" bg-[#f1cfff]  flex flex-col items-center justify-center p-10 relative">
          <div className="relative group">
            {/* ถ้ามีรูป ให้โชว์รูป */}
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="avatar"
                onError={(e) => (e.currentTarget.src = "")}
                className="w-36 h-36 rounded-full object-cover shadow-md border-4 border-white group-hover:scale-105 transition-all"
              />
            ) : (
              // ถ้ายังไม่มีรูป ให้โชว์ไอคอน default 
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md border-4 border-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#9ca3af"
                  viewBox="0 0 24 24"
                  className="w-16 h-16"
                >
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
              </div>
            )}

            {/* ปุ่มอัปโหลด */}
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className="absolute bottom-2 right-2 bg-white/90 border border-pink-200 p-2 rounded-full shadow-sm cursor-pointer hover:bg-pink-50 transition"
            >
              <Upload size={18} className="text-pink-500" />
            </label>
          </div>
        </div>

        {/* RIGHT SIDE: INFO */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ข้อมูลส่วนตัว
              <Edit3
                size={18}
                className="text-pink-400 cursor-pointer hover:text-pink-500 transition"
                onClick={() => setIsEditing(!isEditing)}
              />
            </h2>
          </div>

          <ProfileField
            label="ชื่อ–นามสกุล"
            value={profile.fullname}
            editable={isEditing}
            onChange={(v) => handleChange("fullname", v)}
          />
          <ProfileField
            label="อีเมล"
            value={profile.email}
            editable={isEditing}
            onChange={(v) => handleChange("email", v)}
          />
          
          <div className="pt-6 flex flex-wrap gap-3">
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdate}
                className="flex items-center justify-center gap-2 px-6 py-2.5 
                bg-gradient-to-r from-[#D8EEFF] to-[#C5E4FF] text-gray-800 font-medium rounded-xl shadow-sm 
                hover:shadow-md transition"
              >
                <Save size={18} />
                อัปเดตข้อมูล
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-2.5 
              bg-gradient-to-r from-[#FFD6E0] to-[#FFB6C1] text-gray-700 font-medium rounded-xl shadow-sm 
              hover:shadow-md transition"
            >
              <LogOut size={18} />
              ออกจากระบบ
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Component สำหรับแสดงแต่ละ field
function ProfileField({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="border-b border-pink-200/50 pb-3 mb-4">
      <span className="text-gray-600 text-sm block mb-1">{label}</span>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent border-none border-b border-pink-200/70 focus:border-pink-400 
          focus:ring-0 text-gray-800 py-1 outline-none transition"
        />
      ) : (
        <span className="text-gray-800 font-medium">{value}</span>
      )}
    </div>
  );
}
