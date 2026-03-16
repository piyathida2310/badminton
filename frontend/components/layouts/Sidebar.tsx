"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserCircle2,
  Trophy,
  Clock,
  Users,
  Swords,
  BookOpen,
  Medal,
  LogOut,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { NavbarVariant } from "./Navbar";

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  variant?: NavbarVariant; // Extends the variant from Navbar
  user?: any; // keep for backwards compatibility if needed, though we fetch it here now
};

export default function Sidebar({ isOpen, onClose, variant = 'manage' }: SidebarProps) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { t } = useLanguage();

  const [tournamentName, setTournamentName] = useState<string>("");
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<{ name: string; avatar?: string } | null>(null);

  // Fallback for custom API user if Clerk is not used
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

  // Handle Tournament Names based on variant
  useEffect(() => {
    if (variant === 'manage-id' && id) {
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
    } else if (variant === 'user') {
      if (pathname === "/user/tournament") {
        setTournamentName("");
        setTournamentId(null);
        localStorage.removeItem("selectedTournamentName");
        localStorage.removeItem("selectedTournamentId");
      } else {
        const tName = localStorage.getItem("selectedTournamentName");
        const tId = localStorage.getItem("selectedTournamentId");
        if (tName) setTournamentName(tName);
        if (tId) setTournamentId(tId);
      }
    } else {
        // 'manage' standard
        setTournamentName("");
        setTournamentId(null);
    }
  }, [id, variant, pathname]);

  const getUserLink = (path: string) => {
    return tournamentId ? `${path}?id=${tournamentId}` : path;
  };

  // Determine which links to show based on standard logic from original files
  const getLinks = () => {
    if (variant === 'manage-id') {
      return [
        { href: "/manage", icon: <Trophy size={18} />, label: t('sidebar.tournaments') },
        { href: `/manage/${id}/manage-rules`, icon: <BookOpen size={18} />, label: t('sidebar.rules') },
        { href: `/manage/${id}/group`, icon: <Clock size={18} />, label: t('sidebar.manageGroups') },
        { href: `/manage/${id}/bracket`, icon: <Swords size={18} />, label: t('sidebar.brackets') },
        { href: `/manage/${id}/players-status`, icon: <Users size={18} />, label: t('sidebar.playerStatus') },
        { href: `/manage/${id}/match-history`, icon: <Clock size={18} />, label: t('sidebar.courtRunning') },
        { href: `/manage/${id}/results-competition`, icon: <Medal size={18} />, label: t('sidebar.results') },
        { href: `/manage/profile`, icon: <UserCircle2 size={18} />, label: t('sidebar.profile') },
      ];
    } else if (variant === 'user') {
      const allLinks = [
        { href: "/user/tournament", icon: <Trophy size={18} />, label: t('sidebar.tournaments'), rawLabel: "รายการแข่งขัน" },
        { href: getUserLink("/user/match-rules"), icon: <BookOpen size={18} />, label: t('sidebar.rules'), rawLabel: "กติกา" },
        { href: getUserLink("/user/group"), icon: <Clock size={18} />, label: t('sidebar.manageGroups'), rawLabel: "จัดกลุ่มการแข่งขัน" },
        { href: getUserLink("/user/bracket"), icon: <Swords size={18} />, label: t('sidebar.brackets'), rawLabel: "สายการแข่งขัน" },
        { href: getUserLink("/user/status"), icon: <Users size={18} />, label: t('sidebar.playerStatus'), rawLabel: "สถานะผู้แข่ง" },
        { href: getUserLink("/user/court-running"), icon: <Clock size={18} />, label: t('sidebar.courtRunning'), rawLabel: "ตารางการแข่งขัน" },
        { href: getUserLink("/user/results"), icon: <Medal size={18} />, label: t('sidebar.results'), rawLabel: "ผลการแข่งขัน" },
        { href: `/user/profile`, icon: <UserCircle2 size={18} />, label: t('sidebar.profile'), rawLabel: "ข้อมูลส่วนตัว" },
      ];

      return allLinks.filter(link => {
        if (link.rawLabel === "รายการแข่งขัน" || link.rawLabel === "ข้อมูลส่วนตัว") return true;
        return !!tournamentId;
      });
    } else {
        // 'manage'
        return [
            { href: "/manage", icon: <Trophy size={18} />, label: t('sidebar.tournaments') },
            { href: "/manage/profile", icon: <UserCircle2 size={18} />, label: t('sidebar.profile') }
        ];
    }
  };

  const displayedLinks = getLinks();


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
          {displayAvatar ? (
            <Image
              src={displayAvatar}
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
              {displayName}
            </span>
            <Link 
                href={variant === 'user' ? "/user/profile" : "/manage/profile"} 
                className="text-sm text-pink-600 hover:underline" 
                onClick={onClose}
            >
              {t('sidebar.profile')}
            </Link>
          </div>
        </div>

        {/* Sidebar มือถือ */}
        <nav className="flex flex-col gap-4 text-gray-700 font-medium">
          {displayedLinks.map((link) => (
             <SidebarMobileLink 
                key={link.href} 
                href={link.href} 
                icon={link.icon as React.ReactNode} 
                label={link.label} 
                onClick={onClose} 
             />
          ))}
        </nav>

        {/* Logout on Mobile for User Variant */}
        {variant === 'user' && (
             <button
             onClick={async () => {
               localStorage.removeItem("accessToken");
               localStorage.removeItem("userRole");
               localStorage.removeItem("role"); 
               if(clerkUser) {
                   await signOut();
               }
               router.push("/");
             }}
             className="mt-8 flex items-center gap-3 px-3 py-2 text-pink-700 hover:bg-pink-200 rounded-lg transition-all"
           >
             <LogOut size={18} />
             <span>{t('sidebar.logout')}</span>
           </button>
        )}
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
            {displayedLinks.map((link) => (
                <SidebarDesktopLink 
                    key={link.href} 
                    href={link.href} 
                    icon={link.icon} 
                    label={link.label} 
                />
            ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarDesktopLink({
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
  // Strip query params for active check
  const isActive = pathname === href.split('?')[0];

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

function SidebarMobileLink({
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
    const isActive = pathname === href.split('?')[0];

    return (
        <motion.div
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Link
                href={href}
                onClick={onClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                ${isActive
                    ? "bg-gradient-to-r from-pink-200 to-amber-100 text-pink-700 font-semibold shadow-md"
                    : "hover:bg-gradient-to-r hover:from-pink-100 hover:to-amber-50 hover:text-pink-600 hover:shadow-md"
                }`}
            >
                <span>{icon}</span>
                <span>{label}</span>
            </Link>
        </motion.div>
    )
}
