"use client";

import { useState } from "react";

/* โครงสร้างข้อมูล */
interface Match {
  position: string;
  rank: string;
  code: string;
  team: string;
  player1: string;
  player2?: string; // optional สำหรับประเภทเดี่ยว
  shuttle?: string; //  เพิ่ม field "ลูกใช้"
}

interface SectionData {
  title: string;
  color: string;
  type: "single" | "double"; // เพิ่มประเภท
  matches: Match[];
}

/*  Mock ข้อมูลผลการแข่งขัน (ของคุณเดิมทุกตัวครบ) */
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
          shuttle: "30", // ตัวอย่าง mock ลูกใช้
        },
        {
          position: "รองชนะเลิศอันดับ 1",
          rank: "2nd",
          code: "NB2D",
          team: "Little Bear",
          player1: "อนุสรณ์ (แท็บ)",
          player2: "สุภาภรณ์ (ยุ้ย)",
          shuttle: "40",
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
          shuttle: "60",
        },
        {
          position: "รองชนะเลิศอันดับ 1",
          rank: "2nd",
          code: "N1B",
          team: "NET KING",
          player1: "ศุภวิชญ์ (เบส)",
          shuttle: "70",
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
          shuttle: "80",
        },
      ],
    },
  ],
  "2025-07-10": [
    {
      title: "S ประเภทเดี่ยว",
      color: "from-sky-100 to-indigo-100",
      type: "single",
      matches: [
        {
          position: "ชนะเลิศ",
          rank: "1st",
          code: "S1A",
          team: "TEAM S",
          player1: "สมชาย (ต่อ)",
          shuttle: "40",
        },
      ],
    },
  ],
  "2025-08-01": [
    {
      title: "P+ ประเภทคู่",
      color: "from-green-100 to-emerald-100",
      type: "double",
      matches: [
        {
          position: "ชนะเลิศ",
          rank: "1st",
          code: "P+1Z",
          team: "GREEN SPIRIT",
          player1: "ณัฐวุฒิ",
          player2: "ปกรณ์",
          shuttle: "70",
        },
      ],
    },
  ],
};

export default function ResultSummaryPage() {
  const [selectedEvent, setSelectedEvent] = useState("เพียงตะวัน 3/2568");
  const [selectedDate, setSelectedDate] = useState("2025-06-15");
  const [filterType, setFilterType] = useState<"all" | "single" | "double">("all");
  const [selectedRank, setSelectedRank] = useState("all");

  const results = resultsByDate[selectedDate] || [];

  const events = [
    { name: "เพียงตะวัน 3/2568", date: "2025-06-15" },
    { name: "ชิงแชมป์เยาวชน 2568", date: "2025-07-10" },
    { name: "มหกรรมกีฬา ", date: "2025-08-01" },
  ];

  let filteredResults =
    filterType === "all"
      ? results
      : results.filter((section) => section.type === filterType);

  if (selectedRank !== "all") {
    filteredResults = filteredResults
      .map((section) => ({
        ...section,
        matches: section.matches.filter((m) => m.code.startsWith(selectedRank)),
      }))
      .filter((section) => section.matches.length > 0);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 px-4 sm:px-8 md:px-16 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-pink-500 tracking-tight drop-shadow-md">
          🏆 สรุปผลการแข่งขัน
        </h1>

        <div className="mt-4 text-gray-700 leading-relaxed space-y-1">
          <p>รายการแข่งขันแบดมินตัน</p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="competition-event" className="font-medium text-gray-800">
                รายการแข่งขัน:
              </label>
              <select
                id="competition-event"
                value={selectedEvent}
                onChange={(e) => {
                  const event = events.find((ev) => ev.name === e.target.value);
                  if (event) {
                    setSelectedEvent(event.name);
                    setSelectedDate(event.date);
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              >
                {events.map((ev) => (
                  <option key={ev.date} value={ev.name}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

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
      <div className="bg-gradient-to-r from-pink-200 via-pink-100 to-rose-100 py-3 border-b border-pink-200">
        <h2 className="text-center text-xl font-bold text-pink-600 tracking-wide drop-shadow-sm">
          {title}
        </h2>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-gradient-to-r from-pink-100 via-rose-50 to-purple-50">
            <tr className="border-b border-pink-200">
              <th className="p-3 border-r border-pink-200">ตำแหน่ง</th>
              <th className="p-3 border-r border-pink-200">ลำดับ</th>
              <th className="p-3 border-r border-pink-200">รหัสทีม</th>
              <th className="p-3 border-r border-pink-200">ชื่อทีม</th>
              <th className="p-3 border-r border-pink-200">ผู้เล่น 1</th>
              {hasDouble && <th className="p-3 border-r border-pink-200">ผู้เล่น 2</th>}
              {/* เพิ่มคอลัมน์ ลูกใช้ */}
              <th className="p-3 border-r border-pink-200">ลูกที่ใช้</th>
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
                <td className="p-3 border-r border-pink-100">{m.position}</td>
                <td className="p-3 border-r border-pink-100">{m.rank}</td>
                <td className="p-3 border-r border-pink-100">{m.code}</td>
                <td className="p-3 border-r border-pink-100 text-rose-700 font-medium">
                  {m.team}
                </td>
                <td className="p-3 border-r border-pink-100">{m.player1}</td>
                {hasDouble && (
                  <td className="p-3 border-r border-pink-100">{m.player2 || "-"}</td>
                )}
                {/*  แสดงข้อมูลลูกใช้ */}
                <td className="p-3 border-r border-pink-100">{m.shuttle || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
