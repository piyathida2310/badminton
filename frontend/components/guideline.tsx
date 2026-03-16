"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "../src/lib/api";
interface tournament {
  name: string;
  location: string;
  playType: "SINGLE" | "DOUBLE" | any;
  rank: [];
  shuttlePrice: string;
  maxPlayers: string;
  posterImg: string;
  qrCodeImg: string;
  startDate: string;
  ruleId: string;
  isLowerBracket: boolean;
}
export default function Guideline({
  rulesText,
  setRulesText,
  setPage,
  tournament,
  setTournamentID,
}: {
  rulesText: string;
  setRulesText: any;
  setPage: any;
  tournament: tournament;
  setTournamentID: any;
}) {
  const { t } = useLanguage();

  const handelSummit = async () => {
    setPage("schedule");

    const rules = await axios.post("/api/rules", { content: rulesText });
    console.log(tournament);

    const formData = new FormData();

    formData.append("name", tournament.name);
    formData.append("playType", tournament.playType);
    formData.append("rank", JSON.stringify(tournament.rank));
    formData.append("location", tournament.location);

    formData.append("shuttlePrice", String(tournament.shuttlePrice));
    formData.append("maxPlayers", String(tournament.maxPlayers));
    formData.append("posterImg", tournament.posterImg); // ถ้าเป็นไฟล์ ต้องเป็น File object
    formData.append("qrCodeImg", tournament.qrCodeImg);
    formData.append("startDate", tournament.startDate);
    formData.append("ruleId", String(rules.data.data.id));
    formData.append("isLowerBracket", String(tournament.isLowerBracket));
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    await axios
      .post("/api/tournament", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res.data.data.id + "hello world!!!!!!!");

        setTournamentID(res.data.data.id);
      });
  };

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
        {t('manageMatch.rulesTitle')}
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
          placeholder={t('manageMatch.rulesPlaceholder')}
        />
      </div>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage("organize")}
          className="px-8 py-2.5 rounded-2xl font-semibold text-slate-800 text-sm md:text-base
                   bg-gray-200 hover:bg-gray-300
                   shadow-md transition-all duration-300"
        >
          {t('manageMatch.back')}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handelSummit()}
          className="px-7 py-2 rounded-xl text-sm font-semibold bg-[#b3e5fc] hover:bg-[#7ccff5]"
        >
          {t('manageMatch.next')}
        </motion.button>
      </div>
    </motion.div>
  );
}
