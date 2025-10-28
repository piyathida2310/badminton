"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Upload, LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullname: "โมจิ พิมพ์ชนก",
    nickname: "Moji",
    email: "moji@example.com",
    password: "********",
    avatar: "/profile.png",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setProfile((prev) => ({ ...prev, avatar: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = () => {
    setIsEditing(false);
    alert("อัปเดตข้อมูลเรียบร้อยแล้ว!");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    alert("ออกจากระบบเรียบร้อย!");
    router.push("/page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F8FF] via-[#FFF4F6] to-[#FFFDF0] flex justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row"
      >
        {/* LEFT SIDE: AVATAR */}
        <div className="md:w-1/3 bg-gradient-to-b from-[#FFE8EF] to-[#EAF3FF] flex flex-col items-center justify-center p-8 relative">
          <div className="relative group">
            <img
              src={profile.avatar}
              alt="avatar"
              className="w-36 h-36 rounded-full object-cover shadow-md border-4 border-white group-hover:scale-105 transition-all"
            />
            <label
              htmlFor="avatar"
              className="absolute bottom-2 right-2 bg-white/90 border border-pink-200 p-2 rounded-full shadow-sm cursor-pointer hover:bg-pink-50 transition"
            >
              <Upload size={18} className="text-pink-500" />
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-800">
            {profile.nickname}
          </p>
          <p className="text-sm text-gray-500">{profile.email}</p>
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

          {/* Profile Fields */}
          <ProfileField
            label="ชื่อ–นามสกุล"
            value={profile.fullname}
            editable={isEditing}
            onChange={(v) => handleChange("fullname", v)}
          />
          <ProfileField
            label="ชื่อเล่น"
            value={profile.nickname}
            editable={isEditing}
            onChange={(v) => handleChange("nickname", v)}
          />
          <ProfileField
            label="อีเมล"
            value={profile.email}
            editable={isEditing}
            onChange={(v) => handleChange("email", v)}
          />
          <ProfileField
            label="รหัสผ่าน"
            value={profile.password}
            editable={false}
          />

          {/* Update & Logout */}
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
