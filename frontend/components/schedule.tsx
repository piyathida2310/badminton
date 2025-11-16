"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";


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
}: any) {
  const router = useRouter();
  const safeTime = newRoundTime || "";
  const safeDesc = newRoundDesc || "";
  const safeLevels = newRoundLevels || [];
  

  //  ฟังก์ชันแปลงเวลาให้เป็น "นาที"
  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const clean = timeStr.replace(/[^\d:]/g, "").trim();
    const [h, m] = clean.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  //  ฟังก์ชันบันทึก + เรียงเวลาอัตโนมัติ
  const handleAddRoundAndSort = () => {
    handleAddRound();
    setTimeout(() => {
      setRounds((prev: any[]) =>
        [...prev].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
      );
    }, 0);
  };

  return (
    <>
      {/* ตาราง */}
      <motion.div
        key="schedule"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-[90%] max-w-4xl mx-auto bg-gradient-to-br from-[#FFF8FA] via-[#FFFDF9] to-[#FFF8F5]
        rounded-3xl p-5 text-slate-800 mt-8 mb-4 shadow-md border border-pink-100"
      >
        <h1 className="text-[30px] font-bold text-center mb-1 text-slate-800">
          ตารางการแข่งขัน
        </h1>

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(true);
              setEditIndex(null);
            }}
            className="bg-[#EDE9FE] hover:bg-[#F3E8FF] text-violet-700 font-semibold 
            rounded-lg text-xs px-4 py-1.5 flex items-center gap-1 transition-all duration-300"
          >
            <Plus size={20} /> เพิ่มรอบ
          </button>
        </div>

        <div
          className="border-2 border-[#F9CCE3] rounded-xl 
          overflow-y-auto max-h-[55vh]
          scrollbar-thin scrollbar-thumb-[#f0a2c4]/50 hover:scrollbar-thumb-[#fbc2eb] 
          scrollbar-track-transparent scrollbar-thumb-rounded-full"
        >
          <div className="grid grid-cols-2 text-sm sm:text-base font-bold text-center bg-[#F9E0EC] 
          text-slate-800 border-b-2 border-[#F9CCE3] py-2">
            <div>เวลาประมาณ</div>
            <div>กำหนดการ</div>
          </div>

          {rounds.length === 0 ? (
            <div className="text-center py-5 text-slate-500 text-sm italic border-t border-[#F9CCE3]">
              ยังไม่มีข้อมูลรอบการแข่งขัน
            </div>
          ) : (
            rounds.map((r: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  // 👇 กดแถวไหนก็เข้าแก้ไขได้เลย
                  setEditIndex(index);
                  setNewRoundTime(r.time.replace(" น.", ""));
                  setNewRoundDesc(r.desc);
                  setNewRoundLevels(r.levels || []);
                  setShowAddModal(true);
                }}
                className={`grid grid-cols-2 items-center py-4 px-4 border-t border-[#F9CCE3]
                cursor-pointer hover:bg-pink-50 transition-all duration-200
                ${index % 2 === 0 ? "bg-[#FFF9FC]" : "bg-[#FFFDFE]"}`}
              >
                <div className="flex justify-center border-r border-[#F9CCE3]">
                  <span className="font-bold text-[20px] text-[#2C2C54]">
                    {r.time}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pl-4">
                  <p className="text-[14px] font-semibold text-[#2C2C54] leading-snug">
                    {r.desc}
                  </p>

                  {r.levels?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {r.levels.map((lv: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[15px] font-medium bg-[#f1f9c1]
                          text-[#3C3C3C] border border-[#f5d375]"
                        >
                           {lv}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ปุ่มลบเท่านั้น */}
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // ❗ ป้องกันไม่ให้คลิกลบแล้วเปิด modal
                        handleDeleteRound(index);
                      }}
                      className="p-1.5 rounded-md bg-[#FFD5DB] hover:bg-[#FFAEB7] border border-[#F9A8A8]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ปุ่มถัดไป / ย้อนกลับ */}
        <div className="flex justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setPage("rules")}
            className="px-6 py-2 rounded-xl text-sm font-semibold bg-gray-200 hover:bg-gray-300"
          >
            ย้อนกลับ
          </motion.button>

          <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/manage")}
          className="px-10 py-2.5 rounded-2xl font-semibold text-slate-800 text-base
                  bg-[#b3e5fc] hover:bg-[#7ccff5]
                   shadow-md transition-all duration-300"
        >
          ลงทะเบียน
        </motion.button>

         
        </div>
      </motion.div>

      {/* ✅ Modal */}
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
              className="bg-gradient-to-br from-pink-100 via-pink-200 to-yellow-100 
              border border-slate-200 rounded-xl p-6 w-[95%] max-w-md text-slate-700 shadow-xl"
            >
              <h2 className="text-lg font-bold mb-4 text-center text-slate-800">
                {editIndex !== null ? "แก้ไขรอบการแข่งขัน" : "เพิ่มรอบการแข่งขัน"}
              </h2>

              <div className="space-y-4 text-sm">
                <label className="block">
                  <div className="mb-1 font-semibold text-slate-700">
                    เวลาโดยประมาณ
                  </div>
                  <input
                    type="time"
                    value={safeTime}
                    onChange={(e) => setNewRoundTime(e.target.value)}
                    className="w-full rounded-lg bg-white/90 border border-slate-200 
                    px-3 py-2 text-slate-700 focus:ring-2 focus:ring-pink-200"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 font-semibold text-slate-700">
                    รายละเอียดกำหนดการ
                  </div>
                  <textarea
                    rows={6}
                    value={safeDesc}
                    onChange={(e) => setNewRoundDesc(e.target.value)}
                    placeholder="เช่น ลงทะเบียน (อย่างช้าที่สุดไม่เกิน 08:45 น.)"
                    className="w-full h-[150px] sm:h-[170px] rounded-lg bg-white/90 border border-slate-200 
                    px-3 py-2 text-[15px] leading-relaxed text-slate-700 
                    focus:ring-2 focus:ring-pink-200 resize-none overflow-auto"
                  />
                </label>

                <div>
                  <div className="mb-1 font-semibold text-slate-700">
                    รายการระดับมือ
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {levelOptions.map((opt: string) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setNewRoundLevels((prev: string[]) =>
                            prev.includes(opt)
                              ? prev.filter((x) => x !== opt)
                              : [...prev, opt]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all 
                          ${
                            safeLevels.includes(opt)
                              ? "bg-gradient-to-r from-pink-100 to-blue-100 text-slate-800 border-pink-300"
                              : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white/90"
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/*  ปุ่มบันทึก */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleAddRoundAndSort}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-slate-800 
                  bg-gradient-to-r from-pink-100 via-pink-200 to-blue-100 hover:from-pink-200 hover:to-blue-200"
                >
                  {editIndex !== null ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditIndex(null);
                  }}
                  className="px-6 py-2 rounded-lg text-sm bg-gray-300 hover:bg-gray-400 text-slate-700 font-semibold"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
