"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User, Settings, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";

export type NavbarVariant = 'manage' | 'manage-id' | 'user';

interface NavbarProps {
  variant?: NavbarVariant;
}

export default function Navbar({ variant = 'manage' }: NavbarProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  // Fallback for custom API user if Clerk is not used
  const [localUser, setLocalUser] = useState<{ name: string; avatar?: string } | null>(null);

  useEffect(() => {
    // If we have a Clerk user, we don't need to fetch the local one
    if (clerkUser) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLocalUser({
          name: `${res.data.firstName || ""} ${res.data.lastName || ""}`.trim(),
          avatar: res.data.avatar || "",
        });
      })
      .catch(() => {
        console.warn("ไม่สามารถดึงข้อมูลผู้ใช้ได้ (Local Auth)");
      });
  }, [clerkUser]);

  // Derived user info
  const displayName = clerkUser?.firstName && clerkUser?.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser?.firstName || clerkUser?.username || localUser?.name || t('navbar.user');

  const displayAvatar = clerkUser?.imageUrl || localUser?.avatar;

  //  ออกจากระบบ
  const handleLogout = async () => {
    // ลบข้อมูลใน localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("role"); // from original Navbar.tsx

    // ออกจากระบบด้วย Clerk ถ้ามี
    if (clerkUser) {
      await signOut();
    }

    // ไปหน้าแรก
    router.push("/");
  };

  //  ไปหน้าโปรไฟล์
  const handleGoToProfile = () => {
    setIsDropdownOpen(false);

    // Check various roles used in the original components
    const userRole = localStorage.getItem("userRole");
    const role = localStorage.getItem("role");

    if (userRole === "ORGANIZER" || role === "organizer") {
      // Original Navbar.tsx used /organizer/profile, but others used /manage/profile.
      // Standardizing to /manage/profile based on layout structure.
      router.push("/manage/profile");
    } else {
      router.push("/user/profile");
    }
  };


  return (
    <>
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gradient-to-r from-amber-200 to-pink-600 shadow-lg border-b border-white/20">
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
          <div className="relative hidden md:flex items-center text-white gap-3">
            {/* ปุ่มเปลี่ยนภาษา (Toggle Text) */}
            <div
              onClick={() => setLanguage(language === "th" ? "en" : "th")}
              className="flex items-center bg-white/10 p-1.5 rounded-full cursor-pointer border border-white/20 backdrop-blur-md shadow-inner transition-all hover:bg-white/20"
            >
              <div className={`flex items-center justify-center px-3 py-1 rounded-full transition-all duration-300 ${language === "th" ? "bg-white shadow-md text-pink-600 font-bold" : "text-white opacity-70 hover:opacity-100 font-medium"}`}>
                <span className="text-sm">TH</span>
              </div>
              <div className={`flex items-center justify-center px-3 py-1 rounded-full transition-all duration-300 ${language === "en" ? "bg-white shadow-md text-pink-600 font-bold" : "text-white opacity-70 hover:opacity-100 font-medium"}`}>
                <span className="text-sm">EN</span>
              </div>
            </div>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/25 hover:bg-white/35 transition-all cursor-pointer shadow-md"
            >
              {/* รูปโปรไฟล์ */}
              {displayAvatar ? (
                <img
                  src={displayAvatar}
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
                {displayName}
              </span>

              {/* ลูกศร */}
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
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
                  <span>{t('navbar.editProfile')}</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  <span>{t('navbar.logout')}</span>
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

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant={variant}
      />
    </>
  );
}
