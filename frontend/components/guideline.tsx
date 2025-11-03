"use client";

import { motion } from "framer-motion";

export default function Guideline({
  rulesText,
  setRulesText,
  setPage,
  router,
}: any) {
  return (
    <motion.div
      key="rules"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-[90%] max-w-4xl 
               bg-gradient-to-br from-[#F8FAFF] via-[#FFF7F0] to-[#FDF5F8]
               backdrop-blur-xl rounded-3xl border border-slate-200 
               shadow-[0_20px_80px_rgba(0,0,0,0.12)]
               p-6 text-slate-700 py-8 mt-12 mb-16"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-slate-800 drop-shadow-sm">
        กติกาและข้อควรระวัง
      </h1>

      <div
        className="overflow-y-auto max-h-[55vh] 
                    scrollbar-thin scrollbar-thumb-[#EADCF4] 
                    hover:scrollbar-thumb-[#F3EAFB] 
                    scrollbar-track-transparent scrollbar-thumb-rounded-full"
      >
        <textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          className="w-full min-h-[320px] rounded-lg bg-white/90 border border-slate-200 
                     px-3 py-2 text-slate-700 placeholder:text-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-sky-200 
                     text-sm leading-relaxed shadow-inner"
          placeholder="พิมพ์กติกาและข้อควรระวังที่นี่"
        />
      </div>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage("schedule")}
          className="px-8 py-2.5 rounded-2xl font-semibold text-slate-800 text-sm md:text-base
                   bg-gray-200 hover:bg-gray-300
                   shadow-md transition-all duration-300"
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
  );
}
