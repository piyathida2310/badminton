"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, Upload } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullname: "โมจิ พิมพ์ชนก",
    nickname: "Moji",
    email: "moji@example.com",
    password: "********",
    avatar: "/profile.png",
  });

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setProfile((prev) => ({
            ...prev,
            avatar: ev.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const toggleEdit = () => setIsEditing(!isEditing);

  return (
    <div
      className="h-screen w-screen flex justify-center items-center 
      bg-gradient-to-br from-[#FFF8E7] via-[#FDF1F5] to-[#E9F7FF] 
      overflow-hidden px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[90%] max-w-md mr-64 mb-14 bg-white/80 backdrop-blur-xl 
        rounded-3xl shadow-lg p-8 border border-pink-100 
        flex flex-col items-center justify-center 
        max-lg:mr-0 max-lg:mb-10 max-md:p-6 max-sm:p-4"
      >
        {/* รูปโปรไฟล์ */}
        <div className="relative mb-4">
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-pink-200 object-cover shadow-sm max-sm:w-24 max-sm:h-24"
          />
          {isEditing && (
            <label
              htmlFor="avatar"
              className="absolute bottom-1 right-1 bg-white/90 hover:bg-white text-pink-500 p-2 rounded-full cursor-pointer shadow transition-all"
            >
              <Upload size={16} />
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {profile.fullname}
        </h2>

        {/* ฟอร์ม */}
        <div className="space-y-3 w-full mt-3">
          <InputField
            label="ชื่อ–นามสกุล"
            value={profile.fullname}
            editable={isEditing}
            onChange={(val) => handleChange("fullname", val)}
          />
          <InputField
            label="ชื่อเล่น"
            value={profile.nickname}
            editable={isEditing}
            onChange={(val) => handleChange("nickname", val)}
          />
          <InputField
            label="อีเมล"
            value={profile.email}
            editable={isEditing}
            onChange={(val) => handleChange("email", val)}
          />
          {/* 🔒 ช่องรหัสผ่านห้ามแก้ไข */}
          <InputField
            label="รหัสผ่าน"
            value={profile.password}
            editable={false} // ปิดการแก้ไขไว้ตลอด
            onChange={() => {}}
            type="password"
          />
        </div>

        <button
          onClick={toggleEdit}
          className={`mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all ${
            isEditing
              ? "bg-gradient-to-r from-pink-300 to-amber-200 text-gray-800 hover:opacity-90"
              : "bg-gradient-to-r from-indigo-200 to-pink-200 text-gray-800 hover:opacity-90"
          } max-sm:w-full justify-center`}
        >
          {isEditing ? (
            <>
              <Save size={18} />
              บันทึก
            </>
          ) : (
            <>
              <Edit3 size={18} />
              แก้ไขข้อมูล
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

/* ---------- ช่องอินพุต ---------- */
interface InputFieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChange: (val: string) => void;
  type?: string;
}

function InputField({
  label,
  value,
  editable,
  onChange,
  type = "text",
}: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      {editable ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-pink-200 rounded-xl px-4 py-2 focus:outline-none 
            focus:ring-2 focus:ring-pink-200 bg-white/90 transition-all text-gray-800 
            max-sm:px-3 max-sm:py-1.5"
        />
      ) : (
        <div className="w-full border border-pink-100 rounded-xl px-4 py-2 bg-pink-50/40 text-gray-700 max-sm:px-3 max-sm:py-1.5">
          {value}
        </div>
      )}
    </div>
  );
}
