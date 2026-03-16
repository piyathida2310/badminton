"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import About from "../../components/about";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  // ตรวจสอบ role และ redirect อัตโนมัติ
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");

    if (token && userRole) {
      // Redirect ตาม role ที่ถูกต้อง
      if (userRole === "PLAYER") {
        router.replace("/user/tournament");
      } else if (userRole === "ORGANIZER") {
        router.replace("/manage");
      }
      return;
    }
  }, [router]);

  return (

    <main className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-slate-50 scroll-smooth pt-[70px]">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed w-full top-0 left-0 z-50 backdrop-blur-xl bg-white/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-gray-100"
      >
        {/* เนื้อหา Navbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 h-[70px] relative z-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 -ml-2 sm:ml-0">
            <Image
              src="/images/bad_logo.png"
              alt="Badminton Logo"
              width={140}
              height={140}
              className="drop-shadow-lg"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 xl:gap-12 text-slate-600 font-medium text-sm md:text-base lg:text-lg">
            <a
              href="#"
              className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 transition-all duration-300"
            >
              {t('home.navHome')}
            </a>
            <a
              href="#about"
              className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 transition-all duration-300"
            >
              {t('home.navAbout')}
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-3 lg:gap-5 items-center">
            <a
              href="/sign-in"
              className="bg-white text-orange-600 border border-orange-200 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-sm lg:text-base hover:bg-orange-50 hover:border-orange-300 hover:shadow-md transition-all duration-300 font-medium"
            >
              {t('home.login')}
            </a>
            <a
              href="/register"
              className="relative group bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 lg:px-6 lg:py-2.5 rounded-full text-sm lg:text-base hover:shadow-[0_8px_25px_-5px_rgba(249,115,22,0.4)] transition-all duration-300 font-semibold overflow-hidden"
            >
              <span className="relative z-10">{t('home.register')}</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-slate-700 hover:text-orange-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-white border-b border-gray-200 flex flex-col items-center gap-6 py-6 md:hidden z-50 shadow-lg"
          >
            <div className="flex flex-col items-center gap-4">
              <a
                href="#"
                className="text-slate-700 text-lg hover:text-orange-500 transition"
                onClick={() => setIsOpen(false)}
              >
                {t('home.navHome')}
              </a>
              <a
                href="#about"
                className="text-slate-700 text-lg hover:text-orange-500 transition"
                onClick={() => setIsOpen(false)}
              >
                {t('home.navAbout')}
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 w-full px-8">
              <a
                href="/sign-in"
                className="bg-orange-50 text-orange-600 border border-orange-200 px-5 py-2 rounded-lg hover:bg-orange-100 transition w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                {t('home.login')}
              </a>
              <a
                href="/register"
                className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600 transition w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                {t('home.register')}
              </a>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row flex-1 items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-12 sm:py-16 lg:py-20 xl:py-28 gap-12 md:gap-20 lg:gap-28 xl:gap-40">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold tracking-wide uppercase">
            Elevate Your Game ✨
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-800 leading-[1.15] tracking-tight">
            {t('home.title')} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
              {t('home.subtitle')}
            </span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium">
            {t('home.description')}
          </p>
          <a
            href="/register"
            className="group relative inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-full w-fit mx-auto lg:mx-0 text-base sm:text-lg font-bold hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">{t('home.getStarted')}</span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </motion.div>

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
