"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md fixed w-full z-50 top-0 left-0">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* โลโก้ */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            MyApp
          </Link>

          {/* เมนู Desktop */}
          <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <li><Link href="/" className="hover:text-blue-600">หน้าแรก</Link></li>
            <li><Link href="/about" className="hover:text-blue-600">เกี่ยวกับ</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">ติดต่อ</Link></li>
          </ul>

          {/* ปุ่มเปิด Sidebar (มือถือเท่านั้น) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-700 md:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
