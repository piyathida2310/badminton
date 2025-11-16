"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  User,
  UserCircle2,
  X,
  Trophy,
  Clock,
  Users,
  Settings,
  LogOut,
  Swords,
  BookOpen,
  Medal, 
} from "lucide-react";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar?: string }>({
    name: "",
    avatar: "",
  });

  // ดึงข้อมูลผู้ใช้จาก token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Import api dynamically to avoid issues
    const fetchUserData = async () => {
      try {
        const api = (await import("@/lib/api")).default;
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUser({
          name: res.data.firstName
            ? `${res.data.firstName} ${res.data.lastName}`.trim()
            : res.data.userName || "ผู้ใช้",
          avatar: res.data.profileImg || "",
        });
      } catch (err) {
        console.warn("ไม่สามารถดึงข้อมูลผู้ใช้ได้", err);
        // Fallback to localStorage if API fails
        const storedName = localStorage.getItem("userName") || localStorage.getItem("name");
        if (storedName) {
          setUser({ name: storedName, avatar: "" });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    alert("ออกจากระบบเรียบร้อย");
    window.location.href = "/";
  };

  return (
    <>
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gradient-to-r from-amber-200/80 via-pink-400/70 to-pink-600/80 shadow-lg border-b border-white/20">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-white via-yellow-200 to-pink-200 opacity-60 animate-[gradient_4s_linear_infinite]" />

        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 h-[70px] relative z-10">
          {/* โลโก้ */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/images/bad_logo.png"
                alt="Badminton Logo"
                width={120}
                height={120}
                className="rounded-full drop-shadow-lg"
              />
            </motion.div>
          </Link>

          {/* ชื่อผู้ใช้ Desktop */}
          <div className="hidden md:flex items-center relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/25 hover:bg-white/35 transition-all cursor-pointer shadow-md"
            >
              <User size={18} className="text-white" />
              <span className="font-medium tracking-wide">
                {user.name || "ผู้ใช้"}
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

            {/* Dropdown Desktop */}
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-[110%] mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                <Link
                  href="/manage/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} />
                  <span>แก้ไขโปรไฟล์</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <LogOut size={16} />
                  <span>ออกจากระบบ</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* ปุ่ม Hamburger Mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(true)}
            className="text-white md:hidden p-2 rounded-md hover:bg-white/20 transition"
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} onLogout={handleLogout} />
    </>
  );
}

/* Sidebar Section */
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string };
  onLogout: () => void;
};

function Sidebar({ isOpen, onClose, user, onLogout }: SidebarProps) {
  return (
    <>
      {/* Overlay Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Mobile */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-amber-50 to-pink-100 shadow-2xl z-50 p-6 border-r border-pink-200 md:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-pink-600 tracking-wide">MENU</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-pink-200 transition">
            <X size={22} className="text-pink-600" />
          </button>
        </div>

        {/* User Info Mobile */}
        <div className="flex items-center gap-3 px-4 py-2 mb-6 rounded-lg bg-white/30 backdrop-blur-sm shadow-sm cursor-pointer">
          {/* รูปโปรไฟล์ */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full object-cover border border-pink-300"
            />
          ) : (
            <Image
              src="/images/bad_logo.png"
              alt="User"
              width={40}
              height={40}
              className="rounded-full border border-pink-300"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{user.name}</span>
            <Link href="/manage/profile" className="text-sm text-pink-600 hover:underline" onClick={onClose}>
              โปรไฟล์ของฉัน
            </Link>
          </div>
        </div>

        {/* Sidebar มือถือ */}
        <nav className="flex flex-col gap-4 text-gray-700 font-medium">
          <SidebarLink href="/manage" icon={<Trophy size={18} />} label="รายการแข่งขัน" onClick={onClose} />
          <SidebarLink href="/manage/profile" icon={<UserCircle2 size={18} />} label="ข้อมูลส่วนตัว" onClick={onClose} />
        </nav>

        {/* ปุ่มออกจากระบบ */}
        <button
          onClick={onLogout}
          className="mt-8 flex items-center gap-3 px-3 py-2 text-pink-700 hover:bg-pink-200 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </motion.aside>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-white via-pink-50 to-amber-100 shadow-lg p-8 z-40 border-r border-pink-200">
        <h2 className="text-2xl font-extrabold text-pink-600 mt-20 mb-8 tracking-wide">MENU</h2>

        <nav className="flex flex-col gap-5 text-gray-700 font-medium">
          <SidebarLink href="/manage" icon={<Trophy size={18} />} label="รายการแข่งขัน" />         
          <SidebarLink href="/manage/profile" icon={<UserCircle2 size={18} />} label="ข้อมูลส่วนตัว" />
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div whileHover={{ x: 6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
          ${
            isActive
              ? "bg-gradient-to-r from-pink-200 to-amber-100 text-pink-700 font-semibold shadow-md"
              : "hover:bg-gradient-to-r hover:from-pink-100 hover:to-amber-50 hover:text-pink-600 hover:shadow-md"
          }`}
      >
        <motion.span
          whileHover={{ rotate: 8 }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`${isActive ? "text-pink-700" : "text-pink-600 group-hover:text-pink-700"}`}
        >
          {icon}
        </motion.span>
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}
