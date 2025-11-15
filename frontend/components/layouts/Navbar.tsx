"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User, Settings, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function NavbarManage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // role จาก Clerk
  const role = (user?.publicMetadata?.role as string)?.toUpperCase() || "USER";

  // ไปหน้าโปรไฟล์
  const handleGoToProfile = () => {
    setIsDropdownOpen(false);
    if (role === "ORGANIZER") router.push("/manage/profile");
    else router.push("/user/profile");
  };

  // logout
  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const displayName =
    user?.firstName || user?.username || user?.fullName || "ผู้ใช้";

  return (
    <>
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gradient-to-r from-amber-200 to-pink-600 shadow-lg border-b border-white/20">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-white via-yellow-200 to-pink-200 opacity-60 animate-[gradient_4s_linear_infinite]" />

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

          {/* user */}
          <div className="relative hidden md:flex items-center text-white">
            {isSignedIn ? (
              <>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/25 hover:bg-white/35 transition-all cursor-pointer shadow-md"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center border border-white/30">
                      <User size={18} className="text-white" />
                    </div>
                  )}

                  <span className="font-medium tracking-wide">
                    {displayName}
                  </span>

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
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      <LogOut size={16} />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/sign-in"
                className="px-5 py-2 bg-white/25 rounded-full text-white hover:bg-white/40 transition"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white md:hidden p-2 rounded-md hover:bg-white/20 transition"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Sidebar แบบเดิม + เพิ่มชื่อ */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={displayName}
      />
    </>
  );
}
