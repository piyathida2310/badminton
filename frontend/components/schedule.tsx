"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "../src/lib/api";

interface CompetType {
  id: number;
  time: string;
  detail: string;
  rank: string[];
  tournamentId: number;
}

export default function Schedule({
  rounds,
  setRounds,
  handleDeleteRound,
  setShowAddModal,
  showAddModal,
  setPage,
  levelOptions,
  newRoundTime,
  setNewRoundTime,
  newRoundDesc,
  setNewRoundDesc,
  newRoundLevels,
  setNewRoundLevels,
  editIndex,
  setEditIndex,
  handleAddRound,
  tournamentID,
  onFinalSubmit,
}: any) {
  const router = useRouter();
  const safeTime = newRoundTime || "";
  const safeDesc = newRoundDesc || "";
  const safeLevels = newRoundLevels || [];

  const [compet, setCompet] = useState<CompetType[]>([]);
  const [editingCompetID, setEditingCompetID] = useState<number | null>(null); //  ใช้สำหรับแก้ไข

  // ใช้ rounds จาก props ถ้าไม่มี tournamentID (Flow สร้างใหม่)
  const displayRounds = tournamentID ? compet : (rounds || []);

  const { t } = useLanguage();

  //  Format Time สำหรับ Prisma DateTime
  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatRank = (rank: string) => {
    switch (rank) {
      case "P_MINUS":
        return "P-";
      case "P_PLUS":
        return "P+";
      default:
        return rank;
    }
  };

  //  โหลดข้อมูลทั้งหมด
  const fetCompet = async () => {
    try {
      const res = await axios.get(`/compet?tournamentId=${tournamentID}`);
      setCompet(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tournamentID) fetCompet();
  }, [tournamentID]);

  //  บันทึก (รองรับเพิ่มใหม่ + แก้ไข)
  const handleSubmitCom = async () => {
    // กรณีสร้างใหม่ (ยังไม่มี tournamentID) -> จัดการผ่าน state ใน parent
    if (!tournamentID) {
      handleAddRound(); // เรียกฟังก์ชันจาก parent (page.tsx)
      return;
    }

    try {
      const payload = {
        time: safeTime,
        detail: safeDesc,
        rank: Array.isArray(safeLevels) ? safeLevels : [safeLevels],
        tournamentId: tournamentID,
      };

      //  หาเวลาที่ซ้ำ (เฉพาะตอนเพิ่ม)
      const duplicate = compet.find(
        (c) =>
          formatTime(c.time) === safeTime &&
          c.tournamentId === tournamentID
      );

      if (editingCompetID !== null) {
        // แก้ไขจากปุ่ม "แก้ไข"
        await axios.put(`/compet/${editingCompetID}`, payload);
      } else if (duplicate) {
        // เวลาเหมือน → เขียนทับ
        await axios.put(`/compet/${duplicate.id}`, payload);
      } else {
        // เพิ่มใหม่
        await axios.post("/compet", payload);
      }

      await fetCompet();
      setShowAddModal(false);

      // reset state
      setEditIndex(null);
      setEditingCompetID(null);
      setNewRoundTime("");
      setNewRoundDesc("");
      setNewRoundLevels([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* ตาราง */}
      <motion.div
        key="schedule"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-[90%] max-w-4xl mx-auto bg-gradient-to-br from-[#2ED3B7]/10 via-white to-[#194185]/5
        rounded-3xl p-5 text-slate-800 mt-8 mb-4 shadow-md border border-[#194185]/10"
      >
        <h1 className="text-[30px] font-bold text-center mb-1 text-[#194185]">
          {t('manageMatch.scheduleTitle')}
        </h1>

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(true);
              setEditIndex(null);
              setEditingCompetID(null);
            }}
            className="bg-[#2ED3B7]/10 hover:bg-[#2ED3B7]/20 text-[#194185] font-semibold 
            rounded-lg text-xs px-4 py-1.5 flex items-center gap-1 transition-colors"
          >
            <Plus size={20} /> {t('manageMatch.addRound')}
          </button>
        </div>

        <div
          className="border-2 border-[#194185]/20 rounded-xl 
          overflow-y-auto max-h-[55vh]
          scrollbar-thin scrollbar-thumb-[#194185]/20 hover:scrollbar-thumb-[#194185]/40"
        >
          <div className="grid grid-cols-2 text-sm sm:text-base font-bold text-center bg-[#194185]/10 border-b-2 border-[#194185]/20 py-2 text-[#194185]">
            <div>{t('manageMatch.estTime')}</div>
            <div>{t('manageMatch.scheduleDesc')}</div>
          </div>

          {displayRounds.length === 0 ? (
            <div className="text-center py-5 text-slate-500 italic border-t">
              {t('manageMatch.noSchedule')}
            </div>
          ) : (
            displayRounds.map((r: any, index: number) => (
              <div
                key={r.id || index}
                className={`grid grid-cols-2 items-center py-4 px-4 border-t hover:bg-[#2ED3B7]/10
                ${index % 2 === 0 ? "bg-white" : "bg-[#2ED3B7]/5"}`}
              >
                {/* เวลา */}
                <div className="flex flex-col items-center border-r">
                  <span className="font-bold text-[20px]">
                    {r.time.includes('น.') ? r.time : formatTime(r.time)}
                  </span>

                  <button
                    className="mt-2 text-xs px-2 py-1 bg-[#2ED3B7]/20 text-[#194185] rounded-lg hover:bg-[#2ED3B7]/30 transition-colors font-medium"
                    onClick={() => {
                      if (tournamentID) {
                        setEditingCompetID(r.id);
                        setNewRoundTime(formatTime(r.time));
                      } else {
                        setEditIndex(index);
                        setNewRoundTime(r.time.replace(" น.", ""));
                      }
                      setNewRoundDesc(r.detail || r.desc);
                      setNewRoundLevels(r.rank || r.levels);
                      setShowAddModal(true);
                    }}
                  >
                    {t('manageMatch.edit')}
                  </button>
                </div>

                {/* รายละเอียด */}
                <div className="flex flex-col gap-1 pl-4">
                  <p className="text-[14px] font-semibold">{r.detail || r.desc}</p>

                  {(r.rank || r.levels)?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(r.rank || r.levels).map((lv: any, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[13px] bg-[#2ED3B7]/10 border border-[#2ED3B7]/30 text-[#194185] font-medium"
                        >
                          {formatRank(lv)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ลบ */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        if (confirm(t('manageMatch.confirmDelete'))) {
                          if (tournamentID) {
                            await axios.delete(`/compet/${r.id}`);
                            fetCompet();
                          } else {
                            handleDeleteRound(index);
                          }
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-200 text-red-700 rounded-lg hover:bg-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> {t('manageMatch.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ปุ่มถัดไป */}
        <div className="flex justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setPage("rules")}
            className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            {t('manageMatch.back')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (tournamentID) {
                router.push("/manage");
              } else {
                onFinalSubmit();
              }
            }}
            className="px-10 py-2.5 rounded-2xl bg-[#194185] text-white hover:bg-[#2ED3B7] shadow-lg shadow-[#194185]/20"
          >
            {t('manageMatch.register')}
          </motion.button>
        </div>
      </motion.div>

      {/* โมดัล */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            key="addRoundModal"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-[#2ED3B7]/10 to-white 
              border border-[#2ED3B7]/30 rounded-xl p-6 w-[95%] max-w-md text-slate-700 shadow-2xl"
            >
              <h2 className="text-lg font-bold mb-4 text-center text-[#194185]">
                {editingCompetID !== null
                  ? t('manageMatch.editRoundModal')
                  : t('manageMatch.addRoundModal')}
              </h2>

              <div className="space-y-4 text-sm">
                <label className="block">
                  <div className="mb-1 font-semibold">{t('manageMatch.timeLabel')}</div>
                  <input
                    type="time"
                    value={safeTime}
                    onChange={(e) => setNewRoundTime(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 font-semibold">{t('manageMatch.descLabel')}</div>
                  <textarea
                    rows={6}
                    value={safeDesc}
                    onChange={(e) => setNewRoundDesc(e.target.value)}
                    placeholder={t('manageMatch.descPlaceholder')}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>

                <div>
                  <div className="mb-1 font-semibold">{t('manageMatch.levelLabel')}</div>
                  <div className="flex flex-wrap gap-2">
                    {levelOptions.map((opt: any) => {
                      const value = opt.value ?? opt; // ถ้าเป็น object → ใช้ opt.value
                      const label = opt.label ?? opt; // ถ้าเป็น object → ใช้ opt.label

                      return (
                        <button
                          key={value} //  key เป็น string ชัดเจน
                          type="button"
                          onClick={() =>
                            setNewRoundLevels((prev: string[]) =>
                              prev.includes(value)
                                ? prev.filter((x) => x !== value)
                                : [...prev, value]
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
        ${safeLevels.includes(value)
                                ? "bg-[#2ED3B7] border-[#2ED3B7] text-[#194185]"
                                : "bg-white border-gray-300 text-gray-600"
                              }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleSubmitCom}
                  className="px-6 py-2 rounded-lg bg-[#194185] text-white hover:bg-[#2ED3B7] shadow-md transition-all font-bold"
                >
                  {editingCompetID !== null ? t('manageMatch.saveChanges') : t('manageMatch.save')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCompetID(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  {t('manageMatch.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
