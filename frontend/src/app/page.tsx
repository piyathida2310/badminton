"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import About from "../../components/about";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFFDF6] to-[#F9F6EE] scroll-smooth">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-3 max-h-[60px] shadow-sm bg-gradient-to-r from-amber-200 to-pink-600 relative "
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/bad_logo.png"
            alt="Badminton Logo"
            width={150}
            height={150}
            className="drop-shadow-lg"
          />
          {/* <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tracking-wide">
              Badminton
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm text-gray-200">
              Competition Management
            </span>
          </div> */}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-10 text-white font-medium text-sm md:text-base lg:text-lg">
          <a
            href="#"
            className="hover:text-yellow-200 hover:scale-105 transition-transform"
          >
            หน้าแรก
          </a>
          <a
            href="#about"
            className="hover:text-yellow-200 hover:scale-105 transition-transform"
          >
            เกี่ยวกับ
          </a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-2 lg:gap-4">
          <a
            href="/login"
            className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base hover:bg-white/30 hover:scale-105 transition-transform shadow-md"
          >
            เข้าสู่ระบบ
          </a>
          <a
            href="/register"
            className="bg-yellow-400 text-gray-900 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base hover:bg-yellow-500 hover:scale-105 transition-transform font-semibold shadow-md"
          >
            ลงทะเบียน
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu (Dropdown) */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-gradient-to-r from-amber-600 to-pink-500 flex flex-col items-center gap-6 py-6 md:hidden z-50 shadow-lg"
          >
            {/* Nav Links */}
            <div className="flex flex-col items-center gap-4">
              <a
                href="#"
                className="text-white text-lg hover:text-yellow-200 transition"
                onClick={() => setIsOpen(false)}
              >
                หน้าแรก
              </a>
              <a
                href="#about"
                className="text-white text-lg hover:text-yellow-200 transition"
                onClick={() => setIsOpen(false)}
              >
                เกี่ยวกับ
              </a>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3 w-full px-8">
              <a
                href="/login"
                className="bg-white/20 text-white px-5 py-2 rounded-lg hover:bg-white/30 transition w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                เข้าสู่ระบบ
              </a>
              <a
                href="/register"
                className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                ลงทะเบียน
              </a>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row flex-1 items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-12 sm:py-16 lg:py-20 xl:py-28 gap-12 md:gap-20 lg:gap-28 xl:gap-40">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-800 leading-snug">
            ระบบจัดการแข่งขัน <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-amber-600 to-pink-500 bg-clip-text text-transparent">
              แบดมินตัน
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
            จัดการการแข่งขัน สมัครผู้เล่น และติดตามผลการแข่งได้ง่ายๆ
            ในระบบเดียว รองรับทั้งนักกีฬาและผู้จัดการแข่งขัน
          </p>
          <a
            href="/register"
            className="bg-amber-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg w-fit mx-auto lg:mx-0 text-sm sm:text-base md:text-lg hover:bg-amber-600 hover:scale-105 transition-transform shadow-md"
          >
            เริ่มต้นใช้งาน
          </a>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-[220px] h-[180px] sm:w-[260px] sm:h-[220px] md:w-[360px] md:h-[280px] lg:w-[420px] lg:h-[300px] xl:w-[500px] xl:h-[360px] flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-full h-full"
          >
            <Image
              src="/images/bad.svg"
              alt="Badminton Illustration"
              fill
              className="object-contain drop-shadow-lg"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <About />
    </main>
  );
}
