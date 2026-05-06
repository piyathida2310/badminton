"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";

import axios from "../../../../../lib/api";

export default function TournamentGroupPage() {
  const router = useRouter();
  const { id } = useParams();
  const { t, language } = useLanguage();

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
  const [saving, setSaving] = useState(false);

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
        setIsOrganizer(tournament.isOrganizer || false); //  Set organizer status

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
  const [requireReason, setRequireReason] = useState(false);
  const [groupingReason, setGroupingReason] = useState("");

  useEffect(() => {
    if (id && selectedHandType) {
      const savedDetail = localStorage.getItem(`detailInput-${id}-${selectedHandType}`);
      if (savedDetail) {
        setDetailInput(savedDetail);
      } else {
        setDetailInput("");
      }

      const savedRequireReason = localStorage.getItem(`requireReason-${id}-${selectedHandType}`);
      setRequireReason(savedRequireReason === "true");

      const savedReasoning = localStorage.getItem(`groupingReason-${id}-${selectedHandType}`);
      setGroupingReason(savedReasoning || "");
    }
  }, [id, selectedHandType]);

  // ฟังก์ชันเมื่อกด "จัดแข่ง"
  const handleStartCompetition = async () => {
    if (!selectedHandType) return alert(t("groupManage.selectHandType"));

    setLoading(true);
    try {
      const res = await axios.post(
        `/api/tournament/managegroup/${id}`,
        {
          detail: detailInput || "Balance skill levels", //  ส่ง detail ที่ user พิมพ์
          playType: selectedHandType,
          requireReason: requireReason,
          language: language
        },
        { timeout: 120000 }
      );

      if (res.data.groups) {
        setGroups(res.data.groups);
        setShowGroups(true);
        localStorage.setItem("showGroups", "true");
        
        if (res.data.reason) {
          setGroupingReason(res.data.reason);
          localStorage.setItem(`groupingReason-${id}-${selectedHandType}`, res.data.reason);
        } else {
          setGroupingReason("");
          localStorage.removeItem(`groupingReason-${id}-${selectedHandType}`);
        }
      }
    } catch (error: any) {
      console.log("Manage group error (Handled):", error.message);
      const resData = error.response?.data;
      const errorMessage = resData?.errors
        ? `${resData.message} - ${resData.errors}`
        : (resData?.message || "Failed to organize groups");

      const cleanMessage = errorMessage.replace("Something went wrong! - ", "");
      const isInvalidPrompt = cleanMessage.includes("ไม่เกี่ยวข้อง") || cleanMessage.includes("Invalid command");

      Swal.fire({
        width: '500px',
        html: `
          <div class="flex flex-col items-center pt-2">
            <div class="w-[76px] h-[76px] rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
              <div class="w-[56px] h-[56px] rounded-full bg-[#E02D24] flex items-center justify-center shadow-sm">
                <span class="material-symbols-outlined text-white select-none" style="font-size: 36px">close</span>
              </div>
            </div>
            <h2 class="text-[22px] font-bold text-gray-800 mb-2">
              ${isInvalidPrompt 
                ? (language === "th" ? "คำสั่งไม่ถูกต้อง" : "Invalid Command")
                : t("groupManage.conditionError")}
            </h2>
            <p class="text-[18px] text-gray-600 text-center leading-relaxed px-2">
              ${cleanMessage}
            </p>
          </div>
        `,
        confirmButtonText: t("groupManage.acknowledge"),
        background: "#ffffff",
        customClass: {
          popup: "!rounded-[24px] !p-6 shadow-2xl",
          confirmButton: "bg-[#E02D24] text-white px-12 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#c82820] transition-all active:scale-95 w-full max-w-[180px] mt-4",
          actions: "w-full flex justify-center"
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualGroups = async () => {
    setSaving(true);
    try {
      // Filter current hand type groups
      const currentHandGroups = groups.filter(
        (g) => !g.handType || g.handType === selectedHandType
      );

      const res = await axios.put(`/api/tournament/manual-group/${id}`, {
        playType: selectedHandType,
        groups: currentHandGroups.map((g) => ({
          name: g.name,
          teams: g.teams,
        })),
      });

      if (res.data.groups) {
        setGroups(res.data.groups);
        setIsModified(false);
        Swal.fire({
          icon: "success",
          title: t("groupManage.saveSuccess") || "บันทึกข้อมูลสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Save manual groups error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save manual grouping",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDragStart = (e: React.DragEvent, teamId: any, teamName: any, sourceGroupName: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("teamId", teamId?.toString() || "");
    e.dataTransfer.setData("teamName", typeof teamName === "string" ? teamName : JSON.stringify(teamName));
    e.dataTransfer.setData("sourceGroupName", sourceGroupName);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, targetGroupName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const teamIdStr = e.dataTransfer.getData("teamId");
    const teamNameStr = e.dataTransfer.getData("teamName");
    const sourceGroupName = e.dataTransfer.getData("sourceGroupName");

    if (sourceGroupName === targetGroupName) return;

    const targetGroup = groups.find(g => g.name === targetGroupName);
    if (targetGroup?.hasStarted) {
      Swal.fire({
        icon: "warning",
        title: language === "th" ? "กลุ่มเริ่มแข่งแล้ว" : "Matches Started",
        text: language === "th" ? "ไม่สามารถเพิ่มทีมเข้าไปในกลุ่มที่เริ่มแข่งขันไปแล้วได้" : "Cannot add teams to a group that has already started matches.",
        confirmButtonColor: "#194185",
      });
      return;
    }

    const sourceGroup = groups.find(g => g.name === sourceGroupName);
    if (sourceGroup?.hasStarted) {
      Swal.fire({
        icon: "warning",
        title: language === "th" ? "กลุ่มเริ่มแข่งแล้ว" : "Matches Started",
        text: language === "th" ? "ไม่สามารถย้ายทีมออกจากกลุ่มที่เริ่มแข่งขันไปแล้วได้" : "Cannot move teams out of a group that has already started matches.",
        confirmButtonColor: "#194185",
      });
      return;
    }

    const newGroups = groups.map((g) => ({ ...g, teams: [...g.teams] }));
    const sourceG = newGroups.find((g) => g.name === sourceGroupName);
    const targetG = newGroups.find((g) => g.name === targetGroupName);

    if (sourceG && targetG) {
      const teamIndex = sourceG.teams.findIndex((t: any) => {
        if (teamIdStr && t.id?.toString() === teamIdStr) return true;
        const currentName = typeof t.name !== "undefined" ? t.name : t;
        const targetName = teamNameStr.startsWith("[") || teamNameStr.startsWith("{") ? JSON.parse(teamNameStr) : teamNameStr;
        return JSON.stringify(currentName) === JSON.stringify(targetName);
      });
      if (teamIndex !== -1) {
        const [movedTeam] = sourceG.teams.splice(teamIndex, 1);
        targetG.teams.push(movedTeam);
        
        // Update local state first for responsiveness
        setGroups(newGroups);
        
        // Auto-save to backend
        setSaving(true);
        try {
          const currentHandGroups = newGroups.filter(
            (g) => !g.handType || g.handType === selectedHandType
          );

          const res = await axios.put(`/api/manual-update-groups/${id}`, {
            playType: selectedHandType,
            groups: currentHandGroups.map((g) => ({
              name: g.name,
              teams: g.teams,
            })),
          });

          if (res.data.groups) {
            setGroups(res.data.groups);
          }
        } catch (error) {
          console.error("Auto-save error:", error);
          // Removed popup as requested
        } finally {
          setSaving(false);
        }
      }
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
    <div className="h-full flex flex-col items-center bg-white py-8 md:py-12 px-4 sm:px-8 relative overflow-hidden">
      {/* วงกลมพื้นหลังตกแต่ง */}
      <div className="absolute top-[-150px] left-[-150px] w-[300px] h-[300px] bg-[#194185]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[300px] h-[300px] bg-[#2ED3B7]/5 rounded-full blur-3xl"></div>

      {/* ส่วนหัว */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 z-10 w-full flex flex-col items-center"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#194185] drop-shadow-sm leading-snug">
          {t("groupManage.pageTitle")} {tournamentTitle || "-"} {t("groupManage.type")}{" "}
          {matchType === "single" ? t("groupManage.single") : t("groupManage.double")}
        </h1>

        <p className="text-[#194185] font-semibold text-base sm:text-lg mt-2 mb-6">
          {t("groupManage.date")}{" "}
          {new Date(selectedDate).toLocaleDateString(language === "en" ? "en-US" : "th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/*  Control Panel Card Layout */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#2ED3B7]/20 p-6 sm:p-8 w-full max-w-2xl transform transition-all hover:scale-[1.01]">
          <div className="space-y-5">
            {/* Row 1: Hand Type Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-sm font-semibold text-gray-600 min-w-[100px]">{t("groupManage.handTypeL")}</label>
              <div className="relative w-full sm:w-auto flex-1">
                <select
                  value={selectedHandType}
                  onChange={(e) => setSelectedHandType(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[#194185] focus:border-[#194185] block p-2.5 shadow-sm transition-all"
                >
                  {availableRanks.length > 0 ? (
                    availableRanks.map((type) => (
                      <option key={type} value={type}>
                        {type === "P_PLUS" ? "P+" : type === "P_MINUS" ? "P-" : type}
                      </option>
                    ))
                  ) : (
                    <option value="">{t("groupManage.noCategory")}</option>
                  )}
                </select>
              </div>
              {/* Stats Badge */}
              {tournamentStats && isOrganizer && (
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${isEnoughPlayers ? "bg-[#2ED3B7]/10 text-[#194185]" : "bg-red-100 text-red-600"
                  }`}>
                  {tournamentStats.registrationStats?.[selectedHandType] || 0} / {tournamentStats.maxPlayers} {t("groupManage.teamLabel")}
                </span>
              )}
            </div>

            {/* Render Controls If Organizer */}
            {isOrganizer && (
              <>
                {/* Row 2: Detail Input (AI Prompt) */}
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-sm font-semibold text-gray-600">
                    {t("groupManage.promptDetail")}
                  </label>
                  <textarea
                    value={detailInput}
                    onChange={(e) => {
                      setDetailInput(e.target.value);
                      localStorage.setItem(`detailInput-${id}-${selectedHandType}`, e.target.value);
                    }}
                    placeholder={t("groupManage.promptPlaceholder")}
                    className="w-full h-24 p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-[#194185] focus:border-[#194185] shadow-inner resize-none transition-all"
                  />
                </div>

                {/* Require Reason Checkbox */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="requireReasonCheckbox"
                    checked={requireReason}
                    onChange={(e) => {
                      setRequireReason(e.target.checked);
                      localStorage.setItem(`requireReason-${id}-${selectedHandType}`, e.target.checked.toString());
                    }}
                    className="w-4 h-4 text-[#194185] bg-gray-100 border-gray-300 rounded focus:ring-[#194185]"
                  />
                  <label htmlFor="requireReasonCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                    {t("groupManage.explainReasoning")}
                  </label>
                </div>

                {/* Row 3: Action Button */}
                <div className="flex flex-col items-center pt-4 gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    {(() => {
                      const currentHandHasStarted = groups.some(g =>
                        ((g.handType === selectedHandType) || (g.name && g.name.includes(selectedHandType))) &&
                        g.hasStarted
                      );

                      return (
                        <motion.button
                          whileHover={isEnoughPlayers && !currentHandHasStarted ? { scale: 1.02 } : {}}
                          whileTap={isEnoughPlayers && !currentHandHasStarted ? { scale: 0.98 } : {}}
                          onClick={handleStartCompetition}
                          disabled={loading || !isEnoughPlayers || currentHandHasStarted}
                          className={`flex-1 sm:w-auto min-w-[200px] text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading || !isEnoughPlayers || currentHandHasStarted
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#194185] hover:bg-[#2ED3B7] shadow-lg hover:shadow-[#194185]/30"
                            }`}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t("groupManage.processing")}
                            </>
                          ) : (
                            currentHandHasStarted 
                              ? (language === "th" ? "เริ่มแข่งแล้ว (จัดใหม่ไม่ได้)" : "Started (Cannot Re-group)") 
                              : t("groupManage.startGrouping")
                          )}
                        </motion.button>
                      );
                    })()}
                  </div>

                  {!isEnoughPlayers && tournamentStats && !groups.some(g => ((g.handType === selectedHandType) || (g.name && g.name.includes(selectedHandType))) && g.hasStarted) && (
                    <p className="text-xs text-red-500 font-medium mt-2 bg-red-50 px-3 py-1 rounded-md border border-red-100">
                      {t("groupManage.notEnoughPlayers")}
                    </p>
                  )}

                  {groups.some(g => ((g.handType === selectedHandType) || (g.name && g.name.includes(selectedHandType))) && g.hasStarted) && (
                    <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      {language === "th" 
                        ? "มีการบันทึกคะแนนแล้ว ไม่สามารถจัดกลุ่มใหม่ได้" 
                        : "Scores recorded. AI re-grouping is disabled for this level."}
                    </p>
                  )}
                </div>

                {groupingReason && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-5 bg-[#2ED3B7]/5 border border-[#2ED3B7]/20 rounded-xl text-left shadow-md"
                  >
                    <h3 className="text-sm font-bold text-[#194185] mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      {t("groupManage.aiThinkingProcess")}
                    </h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {groupingReason}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Show message for Non-Organizer if no groups */}
            {!hasCurrentTypeGroups && !isOrganizer && (
              <div className="flex flex-col items-center justify-center py-4">
                <img
                  src="/images/groupform.png"
                  alt="No Group Data"
                  className="w-48 h-48 object-contain"
                />
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
                  color: "bg-white border-[#194185]/30 shadow-[#194185]/5",
                  header: "bg-[#194185] text-white",
                },
                "Group B": {
                  color: "bg-white border-[#2ED3B7]/30 shadow-[#2ED3B7]/5",
                  header: "bg-[#2ED3B7] text-[#194185]",
                },
                "Group C": {
                  color: "bg-white border-[#194185]/20 shadow-[#194185]/5",
                  header: "bg-[#194185]/80 text-white",
                },
                "Group D": {
                  color: "bg-white border-[#2ED3B7]/30 shadow-[#2ED3B7]/5",
                  header: "bg-[#2ED3B7]/60 text-[#194185]",
                },
              };

              const match = group.name.match(/Group [A-D]/);
              const themeKey = match ? match[0] : "Group A";
              const theme = themeClassMap[themeKey] || themeClassMap["Group A"];

              return (
                <motion.div
                  key={group.name}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, group.name)}
                  onClick={() => {
                    if (group.teams.length > 4) return;
                    router.push(`/manage/${id}/group/group-stage-scores?group=${group.name}`);
                  }}
                  className={`w-full max-w-[280px] sm:max-w-[260px] md:max-w-[280px] rounded-2xl border-2 bg-gradient-to-b ${theme.color} shadow-md hover:shadow-xl backdrop-blur-sm min-h-[200px] transition-all duration-300 relative group overflow-hidden ${group.teams.length > 4 ? "cursor-not-allowed border-red-500" : "cursor-pointer hover:scale-[1.02]"}`}
                >
                  <div
                    className={`${theme.header} text-center py-2.5 font-bold rounded-t-xl text-base md:text-lg shadow-sm px-4`}
                  >
                    {group.name.replace(selectedHandType, "").trim()}
                  </div>

                  {group.teams.length > 4 && (
                    <div className="bg-red-600 text-white text-[14px] py-1 px-2 text-center font-normal">
                      ทีมเกินกำหนด (สูงสุด 4 ทีม)
                    </div>
                  )}

                  {group.hasStarted && (
                    <div className="bg-blue-600 text-white text-[12px] py-1 px-2 text-center font-bold flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      {language === "th" ? "เริ่มแข่งแล้ว" : "Matches Started (Locked)"}
                    </div>
                  )}

                  <ul className="py-4 px-4 space-y-2.5 text-gray-700 font-medium text-center min-h-[150px]">
                    {group.teams.map((team: any, index: number) => {
                      const teamId = team.id;
                      const teamName = team.name || team;
                      
                      return (
                        <li
                          key={teamId || index}
                          draggable={isOrganizer && showGroups && !group.hasStarted}
                          onDragStart={(e) => onDragStart(e, teamId, teamName, group.name)}
                          className={`bg-white/80 backdrop-blur-sm rounded-lg py-2 shadow-sm transition-all duration-300 text-sm md:text-base ${isOrganizer && showGroups && !group.hasStarted ? "cursor-grab active:cursor-grabbing border border-transparent hover:border-[#194185]/20 hover:shadow-md hover:bg-white" : "cursor-default opacity-90"}`}
                        >
                          {(() => {
                            if (Array.isArray(teamName)) {
                              return (
                                <div className="flex flex-col items-center leading-tight">
                                  <span>{teamName[0]}</span>
                                  <span className="text-gray-500 text-xs">&</span>
                                  <span>{teamName[1]}</span>
                                </div>
                              );
                            }
                            return <span>{teamName}</span>;
                          })()}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 mt-10">
            <img
              src="/images/groupform.png"
              alt="No Group Data"
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
            />
          </div>
        )
      }
    </div >
  );
}
