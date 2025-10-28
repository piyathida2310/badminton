"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Upload, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    fullname: "โมจิ พิมพ์ชนก",
    nickname: "Moji",
    email: "moji@example.com",
    password: "********",
    avatar: "/profile.png",
  });

  // ช่องไหนกำลังแก้ไขอยู่
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((prev) => ({
        ...prev,
        avatar: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    alert("ออกจากระบบเรียบร้อย!");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#FFE5F4] via-[#E8F3FF] to-[#FFFCEB] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-white/40 
        shadow-xl rounded-3xl p-8 flex flex-col items-center space-y-6"
      >
        {/* Avatar */}
        <div className="relative group">
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#FBCFE8] shadow-md transition-all duration-300 group-hover:scale-105"
          />
          <label
            htmlFor="avatar"
            className="absolute bottom-1 right-1 bg-white/90 p-2 rounded-full shadow cursor-pointer hover:bg-white transition"
          >
            <Upload size={16} className="text-pink-400" />
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Info */}
        <div className="w-full space-y-4">
          <EditableField
            label="ชื่อ–นามสกุล"
            value={profile.fullname}
            isEditing={editingField === "fullname"}
            onEdit={() => setEditingField("fullname")}
            onSave={(val) => {
              handleChange("fullname", val);
              setEditingField(null);
            }}
          />
          <EditableField
            label="ชื่อเล่น"
            value={profile.nickname}
            isEditing={editingField === "nickname"}
            onEdit={() => setEditingField("nickname")}
            onSave={(val) => {
              handleChange("nickname", val);
              setEditingField(null);
            }}
          />
          <EditableField
            label="อีเมล"
            value={profile.email}
            isEditing={editingField === "email"}
            onEdit={() => setEditingField("email")}
            onSave={(val) => {
              handleChange("email", val);
              setEditingField(null);
            }}
          />
          <NonEditableField label="รหัสผ่าน" value={profile.password} />
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex justify-center items-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FEE2E2] to-[#FCA5A5] 
          hover:opacity-90 text-gray-700 font-medium shadow transition-all mt-6"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </motion.button>
      </motion.div>
    </div>
  );
}


function EditableField({
  label,
  value,
  isEditing,
  onEdit,
  onSave,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (val: string) => void;
}) {
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => setTempValue(value), [value]);

  return (
    <div className="flex flex-col text-sm">
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-600">{label}</label>
        <Edit3
          size={16}
          className="text-pink-400 cursor-pointer hover:text-pink-500 transition"
          onClick={() => (isEditing ? onSave(tempValue) : onEdit())}
        />
      </div>

      {isEditing ? (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-full px-4 py-2 border border-pink-200 rounded-xl bg-white/90 
          focus:ring-2 focus:ring-pink-300 outline-none transition text-gray-800"
        />
      ) : (
        <div className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/70 text-gray-700">
          {value}
        </div>
      )}
    </div>
  );
}


function NonEditableField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col text-sm">
      <div className="flex items-center justify-between mb-1">
        <label className="text-gray-600">{label}</label>
      </div>
      <div className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/70 text-gray-700">
        {value}
      </div>
    </div>
  );
}
