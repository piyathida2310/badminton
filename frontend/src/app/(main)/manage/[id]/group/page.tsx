"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import axios from "../../../../../lib/api";

export default function TournamentGroupPage() {
  const router = useRouter();
  const [matchType, setMatchType] = useState<"single" | "double">("single");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const { id } = useParams();

  //  state สำหรับควบคุมการกดปุ่ม "จัดแข่ง"
  const [showGroups, setShowGroups] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  // Fetch existing groups on load
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const res = await axios.get(`/api/tournament/${id}`);
        const existingGroups = res.data.data.groups;
        if (existingGroups && existingGroups.length > 0) {
          setGroups(existingGroups);
          setShowGroups(true);
        }
      } catch (error) {
        console.error("Error fetching tournament data:", error);
      }
    };

    fetchTournamentData();
  }, [id]);

  const totalTeams = groups.reduce((sum, g) => sum + g.teams.length, 0);

  //  ฟังก์ชันเมื่อกด "จัดแข่ง"
  const handleStartCompetition = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/tournament/managegroup/${id}`, {
        detail: "Balance skill levels" // Optional detail
      });

      if (res.data.groups) {
        setGroups(res.data.groups);
        setShowGroups(true);
        localStorage.setItem("showGroups", "true");
      }
    } catch (error: any) {
      console.error("Manage group error:", error);
      alert(error.response?.data?.message || "Failed to organize groups");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] py-8 md:py-12 px-4 sm:px-8 relative overflow-hidden">
      {/* วงกลมพื้นหลังตกแต่ง */}
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
          รายการแข่ง Rank BG ประเภท {matchType === "single" ? "เดี่ยว" : "คู่"}{" "}
        </h1>
        <p className="text-blue-700 font-semibold text-base sm:text-lg mt-2">
          วันที่{" "}
          {new Date(selectedDate).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* ปุ่มโหมด + วันที่ */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white"
          />
        </div>

        {/* ปุ่มจัดแข่ง */}
        {!showGroups && (
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartCompetition}
              disabled={loading}
              className={`text-white font-bold px-8 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
            >
              {loading ? "กำลังจัดกลุ่ม..." : "จัดแข่ง"}
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* แสดง Group */}
      {showGroups ? (
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
              onClick={() =>
                router.push(`/manage/${id}/group/group-stage-scores?group=${group.name}`)
              }
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
      ) : (
        // ยังไม่สร้าง Group
        <p className="text-gray-500 text-lg font-medium mt-10">
          ยังไม่มีการสร้าง Group
        </p>
      )}


    </div>
  );
}
