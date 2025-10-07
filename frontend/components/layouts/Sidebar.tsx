"use client";

import Link from "next/link";
import { X } from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Sidebar สำหรับมือถือ (สามารถเปิด/ปิดได้) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      >
        <aside
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 p-6 transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-blue-600">เมนู</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-gray-700 font-medium">
            <Link href="/" onClick={onClose} className="hover:text-blue-600">
              หน้าแรก
            </Link>
            <Link href="/about" onClick={onClose} className="hover:text-blue-600">
              เกี่ยวกับ
            </Link>
            <Link href="/contact" onClick={onClose} className="hover:text-blue-600">
              ติดต่อ
            </Link>
          </nav>
        </aside>
      </div>

      {/* Sidebar สำหรับหน้าจอ Desktop (เปิดค้างไว้ตลอด) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-screen bg-white shadow-md p-6 z-40">
        <h2 className="text-xl font-bold text-blue-600 mb-6">เมนู</h2>
        <nav className="flex flex-col gap-4 text-gray-700 font-medium">
          <Link href="/manage" className="hover:text-blue-600">
            รายการแข่งขัน
          </Link>
          <Link href="/manage/timeline" className="hover:text-blue-600">
            แผนผังการแข่ง
          </Link>
          <Link href="/manage/players-status" className="hover:text-blue-600">
            สถานะผู้แข่ง
          </Link>
          <Link href="/manage/match-history" className="hover:text-blue-600">
            ประวัติการแข่งขัน
          </Link>
          <Link href="/manage/profile" className="hover:text-blue-600">
            ข้อมูลส่วนตัว
          </Link>
          
        </nav>
      </aside>
    </>
  );
}
