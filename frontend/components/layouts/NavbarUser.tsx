"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User, Settings, LogOut } from "lucide-react";
import SidebarUser from "./SidebarUser";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NavbarUser() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar?: string }>({
    name: "",
    avatar: "",
  });

  //  ดึงข้อมูลผู้ใช้จาก token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser({
          name: `${res.data.firstName || ""} ${res.data.lastName || ""}`.trim(),
          avatar: res.data.avatar || "",
        });
      })
      .catch(() => {
        console.warn("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      });
  }, []);

  //  ออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    alert("ออกจากระบบเรียบร้อย");
    router.push("/");
  };

  //  ไปหน้าโปรไฟล์
  // ของใหม่ (แก้แล้ว)
const handleGoToProfile = () => {
  setIsDropdownOpen(false);
  const role = localStorage.getItem("role");

  if (role === "organizer") {
    router.push("/manage/profile");
  } else {
    router.push("/user/profile");
  }
};


  return (
    <>
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gradient-to-r from-amber-200 to-pink-600 shadow-lg border-b border-white/20">
        {/* เส้นบน Navbar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-white via-yellow-200 to-pink-200 opacity-60 animate-[gradient_4s_linear_infinite]" />

        {/* เนื้อหา Navbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 h-[70px] relative z-10">
          {/* โลโก้ */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110">
              <Image
                src="/images/bad_logo.png"
                alt="Badminton Logo"
                width={150}
                height={150}
                className="rounded-full drop-shadow-lg"
              />
            </div>
          </Link>

          {/* ชื่อผู้ใช้ + avatar */}
          <div className="relative hidden md:flex items-center text-white">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/25 hover:bg-white/35 transition-all cursor-pointer shadow-md"
            >
              {/* รูปโปรไฟล์ */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center border border-white/30">
                  <User size={18} className="text-white" />
                </div>
              )}

              {/* ชื่อผู้ใช้ */}
              <span className="font-medium tracking-wide">
                {user.name || "ผู้ใช้"}
              </span>

              {/* ลูกศร */}
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-[110%] mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-left"
                >
                  <Settings size={16} />
                  <span>แก้ไขโปรไฟล์</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <LogOut size={16} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>

          {/* ปุ่มเมนู (Mobile) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white md:hidden p-2 rounded-md hover:bg-white/20 transition"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* SidebarUser */}
      <SidebarUser
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
