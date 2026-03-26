"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../../lib/api";
import { useLanguage } from "@/contexts/LanguageContext";


export default function TournamentGroupPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const gm = {
    pageTitle: t("groupManage.pageTitle"),
    type: t("groupManage.type"),
    single: t("groupManage.single"),
    double: t("groupManage.double"),
    teamLabel: t("groupManage.teamLabel"),
    loading: t("groupManage.loading"),
    noGroupCreated: t("groupManage.noGroupCreated"),
  };
  const [matchType, setMatchType] = useState<"single" | "double">("single");

  // ข้อมูลจริงจาก API
  const [tournamentTitle, setTournamentTitle] = useState<string>("");
  const [availableRanks, setAvailableRanks] = useState<string[]>([]);
  const [selectedHandType, setSelectedHandType] = useState("BG");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึง tournament id จาก localStorage
  useEffect(() => {
    const tournamentId = localStorage.getItem("selectedTournamentId");
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/tournament/${tournamentId}`);
        const tournament = res.data.data;

        // set title
        setTournamentTitle(tournament?.title || "");

        // set playType จาก tournament
        if (tournament?.playType === "DOUBLE") {
          setMatchType("double");
        } else {
          setMatchType("single");
        }

        // set available ranks & default selection
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
        if (ranks.length > 0) {
          setSelectedHandType(ranks[0]);
        }

        // set groups ถ้ามีอยู่แล้ว
        const existingGroups = tournament?.groups;
        if (existingGroups && existingGroups.length > 0) {
          setGroups(existingGroups);
        }
      } catch (error) {
        console.error("Error fetching tournament data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, []);

  // Filter groups ตาม handType ที่เลือก
  const filteredGroups = groups.filter(
    (g) =>
      g.handType === selectedHandType ||
      (g.name && g.name.includes(selectedHandType))
  );

  const [groupingReason, setGroupingReason] = useState("");

  useEffect(() => {
    const tournamentId = localStorage.getItem("selectedTournamentId");
    if (tournamentId && selectedHandType) {
      const savedReasoning = localStorage.getItem(`groupingReason-${tournamentId}-${selectedHandType}`);
      setGroupingReason(savedReasoning || "");
    }
  }, [selectedHandType]);

  const totalTeams = filteredGroups.reduce(
    (sum, g) => sum + (g?.teams?.length || 0),
    0
  );

  const hasCurrentTypeGroups = filteredGroups.length > 0;

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
          {gm.pageTitle} {tournamentTitle || "-"} {gm.type}{" "}
          {matchType === "single" ? gm.single : gm.double}{" "}
          {totalTeams > 0 && `${totalTeams} ${gm.teamLabel}`}
        </h1>

        {/* ประเภท + ตัวเลือกรุ่น */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-5">
          {/* แสดงประเภทเดี่ยว/คู่ (read-only จาก API) */}
          <span
            className={`px-5 py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${matchType === "single"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-blue-700 border border-blue-300 opacity-50"
              }`}
          >
            {gm.type} {gm.single}
          </span>
          <span
            className={`px-5 py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${matchType === "double"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-white text-amber-600 border border-amber-300 opacity-50"
              }`}
          >
            {gm.type} {gm.double}
          </span>

          {/* ตัวเลือกรุ่น */}
          {availableRanks.length > 0 && (
            <select
              value={selectedHandType}
              onChange={(e) => setSelectedHandType(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-blue-300 transition-all duration-300 bg-white"
            >
              {availableRanks.map((type) => (
                <option key={type} value={type}>
                  {type === "P_PLUS"
                    ? "P+"
                    : type === "P_MINUS"
                      ? "P-"
                      : type}
                </option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 font-semibold z-10 mb-10">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {gm.loading}
        </div>
      )}

      {/* Reasoning Box (If available) */}
      {!loading && hasCurrentTypeGroups && groupingReason && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 p-5 bg-white/60 backdrop-blur-md border border-blue-200 rounded-2xl max-w-4xl w-full shadow-lg z-10"
        >
          <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold text-lg md:text-xl">
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3>{t("groupManage.aiThinkingProcess")}</h3>
          </div>
          <div className="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
            {groupingReason}
          </div>
        </motion.div>
      )}

      {/* กล่อง Group */}
      {!loading && hasCurrentTypeGroups ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 max-w-6xl w-full justify-items-center z-10"
        >
          {filteredGroups.map((group) => {
            const themeClassMap: Record<
              string,
              { color: string; header: string }
            > = {
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
            const theme =
              themeClassMap[themeKey] || themeClassMap["Group A"];

            return (
              <motion.div
                key={group.name}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                onClick={() =>
                  router.push(
                    `/user/group/group-scores?group=${encodeURIComponent(
                      group.name
                    )}`
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
        !loading && (
          <p className="text-gray-500 text-lg font-medium mt-10 z-10">
            {gm.noGroupCreated}
          </p>
        )
      )}
    </div>
  );
}
