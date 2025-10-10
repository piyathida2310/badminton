"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // เปลี่ยนหน้า

export default function TournamentGroupPage() {
  const router = useRouter(); // 🆕
  const [matchType, setMatchType] = useState<"single" | "double">("single");
  const [selectedDate, setSelectedDate] = useState<string>("2025-01-02");

  // Mock ข้อมูลทั้งหมด
  const dataByTypeAndDate: Record<string, Record<string, any[]>> = {
    single: {
      "2025-01-02": [
        {
          name: "Group A",
          color:
            "from-yellow-100 to-yellow-50 border-yellow-400 shadow-yellow-200/50",
          header: "bg-yellow-400/80 text-yellow-900",
          teams: ["Smash Warriors", "Shuttle Kings", "Net Masters", "Power Drive"],
        },
        {
          name: "Group B",
          color: "from-blue-100 to-blue-50 border-blue-400 shadow-blue-200/50",
          header: "bg-blue-400/80 text-blue-900",
          teams: ["Lightning Shots", "Speed Feathers", "Sky Smashers", "Drop Shot Crew"],
        },
        {
          name: "Group C",
          color: "from-pink-100 to-pink-50 border-pink-400 shadow-pink-200/50",
          header: "bg-pink-400/80 text-pink-900",
          teams: ["Net Killers", "Clear Fighters", "Birdie Hunters", "Spin Attack"],
        },
        {
          name: "Group D",
          color: "from-green-100 to-green-50 border-green-400 shadow-green-200/50",
          header: "bg-green-400/80 text-green-900",
          teams: ["Thunder Racquets", "Rapid Smash", "Ace Strikers", "Golden Shuttle"],
        },
      ],
    },
  };

  const [groups, setGroups] = useState<any[]>(dataByTypeAndDate[matchType][selectedDate]);
  useEffect(() => {
    setGroups(dataByTypeAndDate[matchType][selectedDate] || []);
  }, [selectedDate, matchType]);

  const totalTeams = groups.reduce((sum, g) => sum + g.teams.length, 0);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] py-8 md:py-12 px-4 sm:px-8 relative overflow-hidden">
      {/* พื้นหลังตกแต่ง */}
      <div className="absolute top-[-150px] left-[-150px] w-[300px] h-[300px] bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[300px] h-[300px] bg-yellow-200/30 rounded-full blur-3xl"></div>

      {/* ส่วนหัว */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 z-10"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E3A8A] drop-shadow-sm leading-snug">
          รายการแข่ง Rank BG ประเภท{" "}
          {matchType === "single" ? "เดี่ยว" : "คู่"} {totalTeams} ทีม
        </h1>
        <p className="text-blue-700 font-semibold text-base sm:text-lg mt-2">
          วันที่{" "}
          {new Date(selectedDate).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* ปุ่มโหมด + ปฏิทิน */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-5">
          <button
            onClick={() => setMatchType("single")}
            className={`px-5 py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
              matchType === "single"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-blue-700 border border-blue-300"
            }`}
          >
            ประเภทเดี่ยว
          </button>
          <button
            onClick={() => setMatchType("double")}
            className={`px-5 py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
              matchType === "double"
                ? "bg-amber-500 text-white shadow-md"
                : "bg-white text-amber-600 border border-amber-300"
            }`}
          >
            ประเภทคู่
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white"
          />
        </div>
      </motion.div>

      {/* กล่อง Group */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 max-w-6xl w-full justify-items-center z-10"
      >
        {groups.map((group) => (
          <motion.div
            key={group.name}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={() => router.push("/manage/group/court-running")} // 🆕 เมื่อคลิกแล้วเด้งไปหน้าใหม่
            className={`cursor-pointer w-full max-w-[280px] sm:max-w-[260px] md:max-w-[280px] rounded-2xl border-2 bg-gradient-to-b ${group.color} shadow-md hover:shadow-xl backdrop-blur-sm`}
          >
            <div
              className={`${group.header} text-center py-2.5 font-bold rounded-t-xl text-base md:text-lg shadow-sm`}
            >
              {group.name}
            </div>
            <ul className="py-4 px-4 space-y-2.5 text-gray-700 font-medium text-center">
              {group.teams.map((team: any, index: number) => (
                <li
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-lg py-2 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 text-sm md:text-base"
                >
                  {Array.isArray(team) ? (
                    <div className="flex flex-col items-center leading-tight">
                      <span>{team[0]}</span>
                      <span className="text-gray-500 text-xs">&</span>
                      <span>{team[1]}</span>
                    </div>
                  ) : (
                    <span>{team}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* ปุ่ม ถัดไป */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="mt-12 sm:mt-14 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold px-8 sm:px-10 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
      >
        ถัดไป
      </motion.button>
    </div>
  );
}
