"use client";

import { useState } from "react";

/* 🧩 โครงสร้างข้อมูล */
interface Match {
  position: string;
  rank: string;
  code: string;
  team: string;
  player1: string;
  player2?: string; // optional สำหรับประเภทเดี่ยว
}

interface SectionData {
  title: string;
  color: string;
  type: "single" | "double"; // ✅ เพิ่มประเภท
  matches: Match[];
}

/* 🗓️ Mock ข้อมูลผลการแข่งขัน */
const resultsByDate: Record<string, SectionData[]> = {
  "2025-06-15": [
    {
      title: "NB สายบน (ประเภทคู่)",
      color: "from-pink-100 to-rose-100",
      type: "double",
      matches: [
        {
          position: "ชนะเลิศ",
          rank: "1st",
          code: "NB1K",
          team: "LUMPHUN SMASH BAD...",
          player1: "ธวัชชัย",
          player2: "ธนวัฒน์",
        },
        {
          position: "รองชนะเลิศอันดับ 1",
          rank: "2nd",
          code: "NB2D",
          team: "Little Bear",
          player1: "อนุสรณ์ (แท็บ)",
          player2: "สุภาภรณ์ (ยุ้ย)",
        },
      ],
    },
    {
      title: "N ประเภทเดี่ยว",
      color: "from-orange-100 to-pink-100",
      type: "single",
      matches: [
        {
          position: "ชนะเลิศ",
          rank: "1st",
          code: "N1A",
          team: "SMASH MASTER",
          player1: "อิทธิพล (บอล)",
        },
        {
          position: "รองชนะเลิศอันดับ 1",
          rank: "2nd",
          code: "N1B",
          team: "NET KING",
          player1: "ศุภวิชญ์ (เบส)",
        },
      ],
    },
    {
      title: "BG ประเภทคู่",
      color: "from-purple-100 to-pink-100",
      type: "double",
      matches: [
        {
          position: "ชนะเลิศ",
          rank: "1st",
          code: "BG1A",
          team: "LUCKY BIRD",
          player1: "พีรพงศ์",
          player2: "ชัชวาลย์",
        },
      ],
    },
  ],
};

export default function ResultSummaryPage() {
  const [selectedDate, setSelectedDate] = useState("2025-06-15");
  const [filterType, setFilterType] = useState<"all" | "single" | "double">("all");
  const [selectedRank, setSelectedRank] = useState("all"); // ✅ Rank filter

  const results = resultsByDate[selectedDate] || [];

  // 🎯 กรองข้อมูลตามประเภท (single/double)
  let filteredResults =
    filterType === "all"
      ? results
      : results.filter((section) => section.type === filterType);

  // 🎯 เพิ่มกรองตาม Rank (BG, NB, N, S, P+, P−)
  if (selectedRank !== "all") {
    filteredResults = filteredResults
      .map((section) => ({
        ...section,
        matches: section.matches.filter((m) =>
          m.code.startsWith(selectedRank)
        ),
      }))
      .filter((section) => section.matches.length > 0);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 px-4 sm:px-8 md:px-16 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-pink-500 tracking-tight drop-shadow-md">
          🏆 สรุปผลการแข่งขัน
        </h1>

        <div className="mt-4 text-gray-700 leading-relaxed space-y-1">
          <p>รายการ เพียงตะวัน 3/2568</p>

          {/* ปฏิทิน + Dropdown filter */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-3">
            {/* วันที่แข่งขัน */}
            <div className="flex items-center gap-2">
              <label htmlFor="competition-date" className="font-medium text-gray-800">
                วันที่แข่งขัน:
              </label>
              <input
                id="competition-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* ประเภท */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-type" className="font-medium text-gray-800">
                ประเภท:
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="double">ประเภทคู่ 👫</option>
                <option value="single">ประเภทเดี่ยว 🏸</option>
              </select>
            </div>

            {/* ✅ Rank Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="rank-filter" className="font-medium text-gray-800">
                Rank:
              </label>
              <select
                id="rank-filter"
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="BG">BG</option>
                <option value="NB">NB</option>
                <option value="N">N</option>
                <option value="S">S</option>
                <option value="P+">P+</option>
                <option value="P-">P-</option>
              </select>
            </div>
          </div>

          <p>ณ สนามแบดมินตัน 18 คอร์ต ราชพฤกษ์</p>
        </div>
      </div>

      {/* ตารางแสดงผล */}
      {filteredResults.length > 0 ? (
        <div className="space-y-14">
          {filteredResults.map((section, index) => (
            <Section
              key={index}
              title={section.title}
              color={section.color}
              matches={section.matches}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-10">
          <p>📅 ยังไม่มีผลการแข่งขันตามเงื่อนไขที่เลือก</p>
        </div>
      )}
    </main>
  );
}

/* ──────────────────────────────── COMPONENT ──────────────────────────────── */
function Section({
  title,
  color,
  matches,
}: {
  title: string;
  color: string;
  matches: Match[];
}) {
  const hasDouble = matches.some((m) => m.player2);

  return (
    <section
      className={`rounded-2xl shadow-xl border border-pink-100 bg-gradient-to-b ${color} overflow-hidden`}
    >
      {/* หัวข้อ */}
      <div className="bg-gradient-to-r from-pink-200 via-pink-100 to-rose-100 py-3 border-b border-pink-200">
        <h2 className="text-center text-xl font-bold text-pink-600 tracking-wide drop-shadow-sm">
          {title}
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-gradient-to-r from-pink-100 via-rose-50 to-purple-50">
            <tr className="border-b border-pink-200">
              <th className="p-3 border-r border-pink-200 text-pink-600 font-semibold">
                ตำแหน่ง
              </th>
              <th className="p-3 border-r border-pink-200 text-pink-600 font-semibold">
                ลำดับ
              </th>
              <th className="p-3 border-r border-pink-200 text-pink-600 font-semibold">
                รหัสทีม
              </th>
              <th className="p-3 border-r border-pink-200 text-pink-600 font-semibold">
                ชื่อทีม
              </th>
              <th className="p-3 border-r border-pink-200 text-pink-600 font-semibold">
                ผู้เล่น 1
              </th>
              {hasDouble && (
                <th className="p-3 border-r border-pink-200 text-pink-600 font-semibold">
                  ผู้เล่น 2
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr
                key={i}
                className={`border-t border-pink-100 transition ${
                  i % 2 === 0 ? "bg-white/80" : "bg-pink-50/70"
                } hover:bg-rose-100/70`}
              >
                <td className="p-3 border-r border-pink-100 text-gray-700">
                  {m.position}
                </td>
                <td className="p-3 border-r border-pink-100 text-gray-700">
                  {m.rank}
                </td>
                <td className="p-3 border-r border-pink-100 text-gray-700">
                  {m.code}
                </td>
                <td className="p-3 border-r border-pink-100 text-rose-700 font-medium">
                  {m.team}
                </td>
                <td className="p-3 border-r border-pink-100 text-gray-700">
                  {m.player1}
                </td>
                {hasDouble && (
                  <td className="p-3 border-r border-pink-100 text-gray-700">
                    {m.player2 || "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card */}
      <div className="block md:hidden space-y-3 p-3">
        {matches.map((m, i) => (
          <div
            key={i}
            className="bg-white/90 rounded-xl border border-pink-200 shadow-sm p-3 text-sm hover:shadow-md hover:bg-pink-50 transition"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="font-medium text-pink-600">ตำแหน่ง:</p>
              <p className="text-gray-800">{m.position}</p>
              <p className="font-medium text-pink-600">ลำดับ:</p>
              <p className="text-gray-800">{m.rank}</p>
              <p className="font-medium text-pink-600">รหัสทีม:</p>
              <p className="text-gray-800">{m.code}</p>
              <p className="font-medium text-pink-600">ชื่อทีม:</p>
              <p className="text-gray-800">{m.team}</p>
              <p className="font-medium text-pink-600">ผู้เล่น 1:</p>
              <p className="text-gray-800">{m.player1}</p>
              {m.player2 && (
                <>
                  <p className="font-medium text-pink-600">ผู้เล่น 2:</p>
                  <p className="text-gray-800">{m.player2}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
