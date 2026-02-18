"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import axios from "../../../../../lib/api";

export default function TournamentGroupPage() {
  const router = useRouter();
  const { id } = useParams();

  const [matchType, setMatchType] = useState<"single" | "double">("single");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHandType, setSelectedHandType] = useState("BG");

  //  เก็บ title ของ tournament
  const [tournamentTitle, setTournamentTitle] = useState<string>("");
  //  เก็บข้อมูล Stats เพื่อเช็คจำนวนคนก่อนจัด
  const [tournamentStats, setTournamentStats] = useState<any>(null);
  //  เก็บประเภทมือที่ผู้จัดเลือกเปิด
  const [availableRanks, setAvailableRanks] = useState<string[]>([]);

  // state สำหรับควบคุมการกดปุ่ม "จัดแข่ง"
  const [showGroups, setShowGroups] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  //  เก็บสถานะว่าเป็น Organizer หรือไม่
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Fetch existing groups on load + ดึง title
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const res = await axios.get(`/api/tournament/${id}`);
        const tournament = res.data.data;

        //  set title
        setTournamentTitle(tournament?.title || "");
        setTournamentStats(tournament);
        setIsOrganizer(tournament.isOrganizer || false); // ✅ Set organizer status

        //  set matchType
        if (tournament?.playType) {
          setMatchType(tournament.playType.toLowerCase() as "single" | "double");
        }

        //  set available ranks & default selection
        let ranks: string[] = [];
        if (Array.isArray(tournament?.rank)) {
          ranks = tournament.rank;
        } else if (typeof tournament?.rank === "string") {
          try {
            ranks = JSON.parse(tournament.rank);
          } catch (e) {
            console.error("Error parsing rank:", e);
          }
        }

        setAvailableRanks(ranks);
        if (ranks.length > 0 && !selectedHandType) {
          setSelectedHandType(ranks[0]);
        } else if (ranks.length > 0 && !ranks.includes(selectedHandType)) {
          // If currently selected is not in available (e.g. default BG but BG not in tourney), switch to first available
          setSelectedHandType(ranks[0]);
        }

        //  set groups ถ้ามีอยู่แล้ว
        const existingGroups = tournament?.groups;
        if (existingGroups && existingGroups.length > 0) {
          setGroups(existingGroups);
          setShowGroups(true);
        }
      } catch (error) {
        console.error("Error fetching tournament data:", error);
      }
    };

    if (id) fetchTournamentData();
  }, [id]);

  const totalTeams = groups.reduce((sum, g) => sum + (g?.teams?.length || 0), 0);

  // Check if groups exist for the selected hand type
  const hasCurrentTypeGroups = groups.some(g =>
    (g.handType === selectedHandType) ||
    (g.name && g.name.includes(selectedHandType))
  );

  // เก็บรายละเอียดเพิ่มเติมสำหรับ AI
  const [detailInput, setDetailInput] = useState("");

  // ฟังก์ชันเมื่อกด "จัดแข่ง"
  const handleStartCompetition = async () => {
    if (!selectedHandType) return alert("กรุณาเลือกประเภทมือ");

    setLoading(true);
    try {
      const res = await axios.post(
        `/api/tournament/managegroup/${id}`,
        {
          detail: detailInput || "Balance skill levels", //  ส่ง detail ที่ user พิมพ์
          playType: selectedHandType
        },
        { timeout: 120000 }
      );

      if (res.data.groups) {
        setGroups(res.data.groups);
        setShowGroups(true);
        localStorage.setItem("showGroups", "true");
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Manage group error:", error);
      alert(error.response?.data?.message || "Failed to organize groups");
    } finally {
      setLoading(false);
    }
  };

  // Logic เช็คจำนวนคนสมัครว่าพอจัดแข่งไหม (ต้องเกินครึ่ง)
  const isEnoughPlayers = (() => {
    if (!tournamentStats) return false;
    const count = tournamentStats.registrationStats?.[selectedHandType] || 0;
    const max = tournamentStats.maxPlayers || 0;
    return max > 0 && count >= (max / 2);
  })();

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
        className="text-center mb-10 z-10 w-full flex flex-col items-center"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E3A8A] drop-shadow-sm leading-snug">
          รายการแข่ง {tournamentTitle || "-"} ประเภท{" "}
          {matchType === "single" ? "เดี่ยว" : "คู่"}
        </h1>

        <p className="text-blue-700 font-semibold text-base sm:text-lg mt-2 mb-6">
          วันที่{" "}
          {new Date(selectedDate).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/*  Control Panel Card Layout */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 w-full max-w-2xl transform transition-all hover:scale-[1.01]">
          <div className="space-y-5">
            {/* Row 1: Hand Type Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-sm font-semibold text-gray-600 min-w-[100px]">ประเภทมือ:</label>
              <div className="relative w-full sm:w-auto flex-1">
                <select
                  value={selectedHandType}
                  onChange={(e) => setSelectedHandType(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm transition-all"
                >
                  {availableRanks.length > 0 ? (
                    availableRanks.map((type) => (
                      <option key={type} value={type}>
                        {type === "P_PLUS" ? "P+" : type === "P_MINUS" ? "P-" : type}
                      </option>
                    ))
                  ) : (
                    <option value="">ไม่พบรุ่นการแข่งขัน</option>
                  )}
                </select>
              </div>
              {/* Stats Badge */}
              {tournamentStats && isOrganizer && (
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${isEnoughPlayers ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                  {tournamentStats.registrationStats?.[selectedHandType] || 0} / {tournamentStats.maxPlayers} ทีม
                </span>
              )}
            </div>

            {/* Render Controls ONLY If Organizer and No Groups Yet */}
            {!hasCurrentTypeGroups && isOrganizer && (
              <>
                {/* Row 2: Detail Input (AI Prompt) */}
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-sm font-semibold text-gray-600">
                    รายละเอียดเพิ่มเติม (Prompt):
                  </label>
                  <textarea
                    value={detailInput}
                    onChange={(e) => setDetailInput(e.target.value)}
                    placeholder="พิมพ์คำสั่งเพิ่มเติมให้ AI ที่นี่..."
                    className="w-full h-24 p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-inner resize-none transition-all"
                  />
                </div>

                {/* Row 3: Action Button */}
                <div className="flex flex-col items-center pt-2">
                  <motion.button
                    whileHover={isEnoughPlayers ? { scale: 1.02 } : {}}
                    whileTap={isEnoughPlayers ? { scale: 0.98 } : {}}
                    onClick={handleStartCompetition}
                    disabled={loading || !isEnoughPlayers}
                    className={`w-full sm:w-auto min-w-[200px] text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading || !isEnoughPlayers
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30"
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังประมวลผล (AI)...
                      </>
                    ) : (
                      "เริ่มจัดกลุ่มแข่งขัน"
                    )}
                  </motion.button>

                  {!isEnoughPlayers && tournamentStats && (
                    <p className="text-xs text-red-500 font-medium mt-2 bg-red-50 px-3 py-1 rounded-md border border-red-100">
                      จำนวนผู้สมัครยังถึงเกณฑ์ไม่สามารถจัดได้
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Show message for Non-Organizer if no groups */}
            {!hasCurrentTypeGroups && !isOrganizer && (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                ยังไม่มีการจับกลุ่มสายการแข่งขัน
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* แสดง Group */}
      {
        hasCurrentTypeGroups ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 max-w-6xl w-full justify-items-center z-10"
          >
            {groups.filter(group => !group.handType || group.handType === selectedHandType).map((group) => {
              const themeClassMap: Record<string, { color: string; header: string }> = {
                "Group A": {
                  color: "from-yellow-100 to-yellow-50 border-yellow-400 shadow-yellow-200/50",
                  header: "bg-yellow-400/80 text-yellow-900",
                },
                "Group B": {
                  color: "from-blue-100 to-blue-50 border-blue-400 shadow-blue-200/50",
                  header: "bg-blue-400/80 text-blue-900",
                },
                "Group C": {
                  color: "from-pink-100 to-pink-50 border-pink-400 shadow-pink-200/50",
                  header: "bg-pink-400/80 text-pink-900",
                },
                "Group D": {
                  color: "from-green-100 to-green-50 border-green-400 shadow-green-200/50",
                  header: "bg-green-400/80 text-green-900",
                },
              };

              const match = group.name.match(/Group [A-D]/);
              const themeKey = match ? match[0] : "Group A";
              const theme = themeClassMap[themeKey] || themeClassMap["Group A"];

              return (
                <motion.div
                  key={group.name}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={() =>
                    router.push(
                      `/manage/${id}/group/group-stage-scores?group=${group.name}`
                    )
                  }
                  className={`cursor-pointer w-full max-w-[280px] sm:max-w-[260px] md:max-w-[280px] rounded-2xl border-2 bg-gradient-to-b ${theme.color} shadow-md hover:shadow-xl backdrop-blur-sm`}
                >
                  <div
                    className={`${theme.header} text-center py-2.5 font-bold rounded-t-xl text-base md:text-lg shadow-sm`}
                  >
                    {group.name.replace(selectedHandType, "").trim()}
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
              );
            })}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-lg font-medium mt-10">
            ยังไม่มีการสร้าง Group
          </p>
        )
      }
    </div >
  );
}
