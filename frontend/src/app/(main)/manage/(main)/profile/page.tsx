"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Upload, LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    fullname: " ",
    nickname: " ",
    email: "",
    avatar: "", 
  });

  // ดึงข้อมูลจาก Clerk และ API ของเราเมื่อ component โหลด
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        const dbProfile = res.data;
        
        setProfile({
          fullname: `${dbProfile.firstName || ""} ${dbProfile.lastName || ""}`.trim(),
          nickname: dbProfile.userName || "",
          email: dbProfile.email || "",
          avatar: dbProfile.profileImg || user?.imageUrl || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile from API:", err);
        if (user) {
          setProfile({
            fullname: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            nickname: user.username || "",
            email: user.primaryEmailAddress?.emailAddress || "",
            avatar: user.imageUrl || "",
          });
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // เมื่ออัปโหลดรูปใหม่ไปยัง Clerk
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      
      // อัปโหลดรูปไปยัง Minio ผ่าน API ของเรา
      const formData = new FormData();
      formData.append("avatar", file);
      
      const res = await api.post("/auth/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (res.data.success) {
        const newImageUrl = res.data.profileImg;
        setProfile((prev) => ({ ...prev, avatar: newImageUrl }));
        alert("อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว!");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปโหลดรูป:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    try {
      // แยกชื่อและนามสกุล
      const nameParts = profile.fullname.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      // อัปเดตข้อมูลใน Clerk (เฉพาะ firstName และ lastName)
      await user?.update({
        firstName: firstName,
        lastName: lastName,
      });

      // อัปเดตข้อมูลในฐานข้อมูลของเรา
      await api.patch('/auth/me', {
        fullName: profile.fullname,
        email: profile.email,
        username: profile.nickname,
        profileImg: profile.avatar
      });
      
      // ถ้าต้องการอัปเดต username ต้องใช้ method อื่น
      // แต่ในที่นี้จะข้ามการอัปเดต username เพราะ Clerk ไม่รองรับใน update
      
      // ถ้าต้องการอัปเดต email ต้องทำผ่านกระบวนการพิเศษ
      // แต่ในที่นี้จะข้ามการอัปเดต email เพราะต้องการการยืนยัน
      
      alert("อัปเดตข้อมูลเรียบร้อยแล้ว!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Update error:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล: " + (err.message || "Unknown error"));
    }
  };



  const handleLogout = async () => {
    try {
      // ลบข้อมูลจาก localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      
      // ออกจากระบบด้วย Clerk
      await signOut();
      
      // ไปยังหน้าแรก
      router.push("/");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex justify-center items-center">
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row"
  >

        {/* LEFT SIDE: AVATAR */}
        <div className="bg-[#194185]/5 flex flex-col items-center justify-center p-10 relative">
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
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className={`absolute bottom-2 right-2 bg-white/90 border border-[#194185]/10 p-2 rounded-full shadow-sm cursor-pointer transition ${
                uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2ED3B7]/5"
              }`}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-[#2ED3B7]/30 border-t-[#194185] rounded-full animate-spin"></div>
              ) : (
                <Upload size={18} className="text-[#194185]" />
              )}
            </label>
          </div>
        </div>

        {/* RIGHT SIDE: INFO */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {t('profile.title')}
              <Edit3
                size={18}
                className="text-[#2ED3B7] cursor-pointer hover:text-[#194185] transition"
                onClick={() => setIsEditing(!isEditing)}
              />
            </h2>
          </div>

          <ProfileField
            label={t('profile.fullname')}
            value={profile.fullname}
            editable={isEditing}
            onChange={(v) => handleChange("fullname", v)}
          />
          
          <div className="pt-6 flex flex-wrap gap-3">
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdate}
                className="flex items-center justify-center gap-2 px-6 py-2.5 
                bg-[#194185] text-white font-bold rounded-xl shadow-md 
                hover:bg-[#2ED3B7] transition"
              >
                <Save size={18} />
                {t('profile.update')}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-2.5 
              bg-slate-100 text-slate-700 font-bold rounded-xl shadow-sm 
              hover:bg-slate-200 transition"
            >
              <LogOut size={18} />
              {t('profile.logout')}
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
    <div className="border-b border-[#194185]/20 pb-3 mb-4">
      <span className="text-gray-600 text-sm block mb-1">{label}</span>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent border-none border-b border-[#2ED3B7]/30 focus:border-[#194185] 
          focus:ring-0 text-gray-800 py-1 outline-none transition"
        />
      ) : (
        <span className="text-gray-800 font-medium">{value}</span>
      )}
    </div>
  );
}
