"use client";

import { motion } from "framer-motion";

export default function TournamentGroupPage() {
  const groups = [
    {
      name: "Group A",
      color: "from-yellow-100 to-yellow-50 border-yellow-400 shadow-yellow-200/50",
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
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] py-8 md:py-10 px-6 relative overflow-hidden">
      {/* วงกลมตกแต่งพื้นหลัง */}
      <div className="absolute top-[-150px] left-[-150px] w-[300px] h-[300px] bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[300px] h-[300px] bg-yellow-200/30 rounded-full blur-3xl"></div>

      {/* หัวข้อ */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A] tracking-wide drop-shadow-sm">
          รายการแข่ง Rank BG ประเภท เดี่ยว 16 ทีม
        </h1>
        <div className="flex justify-center mt-2 mb-3">
          {/* <div className="w-24 h-1 bg-blue-400 rounded-full"></div> */}
        </div>
        <p className="text-blue-700 font-semibold text-lg">วันที่ 2 มกราคม 2568</p>
      </motion.div>

      {/* กล่อง Group */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-6xl w-full justify-items-center"
      >
        {groups.map((group) => (
          <motion.div
            key={group.name}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`w-56 md:w-64 rounded-2xl border-2 bg-gradient-to-b ${group.color} shadow-md hover:shadow-xl backdrop-blur-sm`}
          >
            <div
              className={`${group.header} text-center py-2.5 font-bold rounded-t-xl text-base md:text-lg shadow-sm`}
            >
              {group.name}
            </div>
            <ul className="py-4 px-5 space-y-2.5 text-gray-700 font-medium text-center">
              {group.teams.map((team) => (
                <li
                  key={team}
                  className="bg-white/80 backdrop-blur-sm rounded-lg py-1.5 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 text-sm md:text-base"
                >
                  {team}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* ปุ่ม */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="mt-14 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold px-10 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        ถัดไป
      </motion.button>
    </div>
  );
}
