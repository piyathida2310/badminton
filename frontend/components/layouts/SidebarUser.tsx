"use client";
import { useEffect, useState } from "react"; 
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Home,
  Trophy,
  Clock,
  Users,
  LogOut,
  Medal,
  BookOpen,
  Swords,
  UserCircle2,
  History,
} from "lucide-react";
import { usePathname } from "next/navigation";

type SidebarUserProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SidebarUser({ isOpen, onClose }: SidebarUserProps) {
  const pathname = usePathname();

  const [role, setRole] = useState("user");

useEffect(() => {
  const storedRole = localStorage.getItem("role");
  if (storedRole) setRole(storedRole.toUpperCase());
}, []);




  const links = [
  {
    href: role === "manage" ? "/manage" : "/user/tournament",
    icon: <Trophy size={18} />,
    label: "รายการแข่งขัน",
  },
  { href: role === "manage" ? "/manage/manage-rules" : "/user/match-rules", icon: <BookOpen size={18} />, label: "กติกา" },
  { href: role === "manage" ? "/manage/group" : "/user/group", icon: <Clock size={18} />, label: "จัดกลุ่มการแข่งขัน" },
  { href: role === "manage" ? "/manage/bracket" : "/user/bracket", icon: <Swords size={18} />, label: "สายการแข่งขัน" },
  { href: role === "manage" ? "/manage/players-status" : "/user/status", icon: <Users size={18} />, label: "สถานะผู้แข่ง" },
  { href: role === "manage" ? "/manage/match-history" : "/user/court-running", icon: <Clock size={18} />, label: "Court Running" },
  { href: role === "manage" ? "/manage/results-competition" : "/user/results", icon: <Medal size={18} />, label: "ผลการแข่งขัน" },
  { href: role === "manage" ? "/manage/profile" : "/user/profile", icon: <UserCircle2 size={18} />, label: "ข้อมูลส่วนตัว" },
];


  return (
    <>
      {/*  Overlay มือถือ */}
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

      {/*  Sidebar มือถือ (Slide) */}
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-pink-200 transition"
          >
            <X size={22} className="text-pink-600" />
          </button>
        </div>

        {/* โปรไฟล์บนมือถือ */}
        <div className="flex items-center gap-3 px-4 py-2 mb-6 rounded-lg bg-white/40 backdrop-blur-sm shadow-sm cursor-pointer">
          <Image
            src="/images/bad_logo.png"
            alt="User"
            width={40}
            height={40}
            className="rounded-full border border-pink-300"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">Halo</span>
            <Link
              href={`/${role}/profile`}
              onClick={onClose}
              className="text-sm text-pink-600 hover:underline"
            >
              โปรไฟล์ของฉัน
            </Link>

          </div>
        </div>

        {/*  ลิงก์ใน Sidebar (มือถือ) */}
        <nav className="flex flex-col gap-4 text-gray-700 font-medium">
          {links.map((link) => (
            <motion.div
              key={link.href}
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-pink-200 to-amber-100 text-pink-700 font-semibold shadow-md"
                    : "hover:bg-gradient-to-r hover:from-pink-100 hover:to-amber-50 hover:text-pink-600 hover:shadow-md"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* ปุ่มออกจากระบบ */}
        <button
          onClick={() => alert("ออกจากระบบสำเร็จ")}
          className="mt-8 flex items-center gap-3 px-3 py-2 text-pink-700 hover:bg-pink-200 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </motion.aside>

      {/*  Sidebar Desktop ถาวร */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-white via-pink-50 to-amber-100 shadow-lg p-8 z-40 border-r border-pink-200">
        <h2 className="text-2xl font-extrabold text-pink-600 mt-20 mb-8 tracking-wide">
          MENU
        </h2>

        <nav className="flex flex-col gap-5 text-gray-700 font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
              ${
                pathname === link.href
                  ? "bg-gradient-to-r from-pink-200 to-amber-100 text-pink-700 font-semibold shadow-md"
                  : "hover:bg-gradient-to-r hover:from-pink-100 hover:to-amber-50 hover:text-pink-600 hover:shadow-md"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
