"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
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
import { useUser, useClerk } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t, language, setLanguage } = useLanguage();

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
          <div className="hidden md:flex items-center relative gap-3">
            {/* ปุ่มเปลี่ยนภาษา (Toggle ธงชาติ) */}
            <div 
              onClick={() => setLanguage(language === "th" ? "en" : "th")}
              className="flex items-center bg-black/10 p-1 rounded-full cursor-pointer border border-white/20 backdrop-blur-md shadow-inner transition-all hover:bg-black/20"
            >
              <div className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${language === "th" ? "bg-white shadow-md text-pink-600" : "opacity-60 hover:opacity-100 text-white"}`}>
                <span className="text-lg leading-none">🇹🇭</span>
                <span className={`text-xs font-extrabold ${language === "th" ? "block" : "hidden"}`}>TH</span>
              </div>
              <div className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 ${language === "en" ? "bg-white shadow-md text-pink-600" : "opacity-60 hover:opacity-100 text-white"}`}>
                <span className="text-lg leading-none">🇬🇧</span>
                <span className={`text-xs font-extrabold ${language === "en" ? "block" : "hidden"}`}>EN</span>
              </div>
            </div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/25 hover:bg-white/35 transition-all cursor-pointer shadow-md"
            >
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="User Avatar" className="w-5 h-5 rounded-full object-cover border border-white shadow-sm" />
              ) : (
                <User size={18} className="text-white" />
              )}
              <span className="font-medium tracking-wide">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.username || t('navbar.user')}
              </span>
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
                  <span>{t('navbar.editProfile')}</span>
                </Link>
                <button
                  onClick={async () => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("userRole");
                    await signOut();
                    router.push("/");
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <LogOut size={16} />
                  <span>{t('navbar.logout')}</span>
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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
    </>
  );
}

/* Sidebar Section */
export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
};

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const { id } = useParams();
  const [tournamentName, setTournamentName] = useState<string>("");
  const { t } = useLanguage();

  useEffect(() => {
    if (id) {
      const fetchTournament = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/tournament/${id}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.data && data.data.title) {
              setTournamentName(data.data.title);
            }
          }
        } catch (error) {
          console.error("Failed to fetch tournament name", error);
        }
      };
      fetchTournament();
    }
  }, [id]);

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
          <h2 className="text-xl font-bold text-pink-600 tracking-wide">{t('sidebar.menu')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-pink-200 transition">
            <X size={22} className="text-pink-600" />
          </button>
        </div>

        {/* Tournament Name Display (Mobile) */}
        {tournamentName && (
          <div className="mb-4 mx-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-amber-300 rounded-lg blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative px-3 py-2 bg-white/80 backdrop-blur-md rounded-lg border border-white/50 shadow-sm text-center">
              <div className="flex justify-center items-center mb-0.5">
                <span className="bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent text-[9px] font-extrabold uppercase tracking-widest">
                  {t('sidebar.currentTournament')}
                </span>
              </div>
              <h3 className="text-xs font-bold text-gray-800 break-words leading-tight drop-shadow-sm">
                {tournamentName}
              </h3>
            </div>
          </div>
        )}

        {/* User Info Mobile */}
        <div className="flex items-center gap-3 px-4 py-2 mb-6 rounded-lg bg-white/30 backdrop-blur-sm shadow-sm cursor-pointer">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="User"
              width={40}
              height={40}
              className="rounded-full border border-pink-300"
            />
          ) : (
            <UserCircle2 size={24} className="text-pink-600" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.firstName || user?.username || t('navbar.user')}
            </span>
            <Link href="/manage/profile" className="text-sm text-pink-600 hover:underline" onClick={onClose}>
              {t('sidebar.profile')}
            </Link>
          </div>
        </div>

        {/* Sidebar มือถือ */}
        <nav className="flex flex-col gap-4 text-gray-700 font-medium">
          <SidebarLink href="/manage" icon={<Trophy size={18} />} label={t('sidebar.tournaments')} onClick={onClose} />
          <SidebarLink href={`/manage/${id}/manage-rules`} icon={<BookOpen size={18} />} label={t('sidebar.rules')} onClick={onClose} />
          <SidebarLink href={`/manage/${id}/group`} icon={<Clock size={18} />} label={t('sidebar.manageGroups')} onClick={onClose} />
          <SidebarLink href={`/manage/${id}/bracket`} icon={<Swords size={18} />} label={t('sidebar.brackets')} onClick={onClose} />

          <SidebarLink href={`/manage/${id}/players-status`} icon={<Users size={18} />} label={t('sidebar.playerStatus')} onClick={onClose} />
          <SidebarLink href={`/manage/${id}/match-history`} icon={<Clock size={18} />} label={t('sidebar.courtRunning')} onClick={onClose} />
          <SidebarLink href={`/manage/${id}/results-competition`} icon={<Medal size={18} />} label={t('sidebar.results')} onClick={onClose} />
          <SidebarLink href={`/manage/profile`} icon={<UserCircle2 size={18} />} label={t('sidebar.profile')} onClick={onClose} />
        </nav>
      </motion.aside>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-white via-pink-50 to-amber-100 shadow-lg p-8 z-40 border-r border-pink-200">
        <h2 className="text-2xl font-extrabold text-pink-600 mt-20 mb-8 tracking-wide">{t('sidebar.menu')}</h2>

        {/* Tournament Name Display (Desktop) */}
        {tournamentName && (
          <div className="mb-6 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-amber-400 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative px-4 py-3 bg-white/90 backdrop-blur-xl rounded-xl border border-white/60 shadow-lg text-center transform transition-all hover:scale-[1.02]">
              <div className="flex justify-center items-center gap-2 mb-1 opacity-80">
                <Trophy size={12} className="text-amber-500" />
                <span className="text-[9px] font-extrabold text-pink-500 tracking-[0.2em] uppercase">
                  {t('sidebar.currentTournament')}
                </span>
                <Trophy size={12} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-700 to-amber-700 break-words leading-snug">
                {tournamentName}
              </h3>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-5 text-gray-700 font-medium">
          <SidebarLink href="/manage" icon={<Trophy size={18} />} label={t('sidebar.tournaments')} />
          <SidebarLink href={`/manage/${id}/manage-rules`} icon={<BookOpen size={18} />} label={t('sidebar.rules')} />
          <SidebarLink href={`/manage/${id}/group`} icon={<Clock size={18} />} label={t('sidebar.manageGroups')} />
          <SidebarLink href={`/manage/${id}/bracket`} icon={<Swords size={18} />} label={t('sidebar.brackets')} />

          <SidebarLink href={`/manage/${id}/players-status`} icon={<Users size={18} />} label={t('sidebar.playerStatus')} />
          <SidebarLink href={`/manage/${id}/match-history`} icon={<Clock size={18} />} label={t('sidebar.courtRunning')} />
          <SidebarLink href={`/manage/${id}/results-competition`} icon={<Medal size={18} />} label={t('sidebar.results')} />
          <SidebarLink href={`/manage/profile`} icon={<UserCircle2 size={18} />} label={t('sidebar.profile')} />
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
          ${isActive
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
