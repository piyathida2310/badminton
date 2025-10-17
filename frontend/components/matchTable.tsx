"use client";
import { useState } from "react";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  ChevronDown,
  Filter,
  User,
  Users,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Match {
  id: number;
  court: string;
  status: "รอแข่ง" | "กำลังแข่ง" | "แข่งสำเร็จ";
  matchType: "single" | "double";
  timeIn: string;
  timeOut: string;
  duration: string;
  type: string;
  round: string;
  group: string;
  team1: string;
  player1A: string;
  player1B?: string;
  vsGroup: string;
  team2: string;
  player2A: string;
  player2B?: string;
}

const mockData: Match[] = [
  {
    id: 269,
    court: "A4",
    status: "แข่งสำเร็จ",
    matchType: "double",
    timeIn: "20:39",
    timeOut: "21:23",
    duration: "00:44",
    type: "N",
    round: "Round1",
    group: "N1A",
    team1: "MASTERPIECE",
    player1A: "ลดัสซน์",
    player1B: "ภาคภูมิ",
    vsGroup: "N2A",
    team2: "โรจน์ทีม",
    player2A: "อาทิตย์",
    player2B: "วัชระ",
  },
  {
    id: 270,
    court: "A1",
    status: "กำลังแข่ง",
    matchType: "single",
    timeIn: "20:04",
    timeOut: "-",
    duration: "-",
    type: "S",
    round: "Semi-Final",
    group: "N1C",
    team1: "YESMINTON",
    player1A: "ศุภชัย",
    vsGroup: "N1D",
    team2: "Sky Smash",
    player2A: "จิรศักดิ์",
  },
  {
    id: 271,
    court: "A3",
    status: "รอแข่ง",
    matchType: "double",
    timeIn: "-",
    timeOut: "-",
    duration: "-",
    type: "P+",
    round: "Round1",
    group: "N1E",
    team1: "MUSE by แม่เปิ้ล",
    player1A: "ญาณภัทร",
    player1B: "สโรจน์",
    vsGroup: "N1F",
    team2: "กรุงเทพชาล์ส",
    player2A: "ธนภัทร",
    player2B: "เจษฎา",
  },
];

export default function MatchTable() {
  const [filter, setFilter] = useState<
    "ทั้งหมด" | "รอแข่ง" | "กำลังแข่ง" | "แข่งสำเร็จ"
  >("ทั้งหมด");

  const filteredMatches =
    filter === "ทั้งหมด"
      ? mockData
      : mockData.filter((m) => m.status === filter);

  const countLabel =
    filter === "ทั้งหมด"
      ? `${mockData.length} แมตช์ทั้งหมด`
      : `${filteredMatches.length} แมตช์`;

  const renderStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border backdrop-blur-sm";
    if (status === "รอแข่ง")
      return (
        <span
          className={`${base} border-yellow-200 bg-yellow-100/70 text-yellow-800`}
        >
          <Clock size={12} /> {status}
        </span>
      );
    if (status === "กำลังแข่ง")
      return (
        <span
          className={`${base} border-red-200 bg-red-100/70 text-red-700 animate-pulse`}
        >
          <PlayCircle size={12} /> {status}
        </span>
      );
    if (status === "แข่งสำเร็จ")
      return (
        <span
          className={`${base} border-green-200 bg-green-100/70 text-green-700`}
        >
          <CheckCircle size={12} /> {status}
        </span>
      );
  };

  const renderPlayers = (
    type: "single" | "double",
    playerA: string,
    playerB?: string
  ) => {
    return (
      <div className="text-gray-700">
        {type === "double" ? (
          <>
            <Users size={12} className="inline mr-1 text-pink-500" />
            {playerA} / {playerB}
          </>
        ) : (
          <>
            <User size={12} className="inline mr-1 text-amber-600" />
            {playerA}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 w-full">
      {/* 🔹 Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5 px-2">
        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
          <Filter className="text-pink-600" size={18} />
          <span className="font-semibold">ตัวกรองสถานะ</span>
          <span className="text-gray-500 text-xs">({countLabel})</span>
        </div>

        <div className="relative w-48 sm:w-56">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value as
                  | "ทั้งหมด"
                  | "รอแข่ง"
                  | "กำลังแข่ง"
                  | "แข่งสำเร็จ"
              )
            }
            className="w-full appearance-none py-2 px-4 rounded-xl text-sm font-medium text-gray-700
            bg-gradient-to-r from-white/70 to-pink-50 border border-pink-200 shadow-[0_2px_10px_rgba(255,182,193,0.2)]
            focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all cursor-pointer"
          >
            {["ทั้งหมด", "รอแข่ง", "กำลังแข่ง", "แข่งสำเร็จ"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-3 text-pink-500 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {/* ตาราง */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="inline-block min-w-full overflow-hidden rounded-xl border border-pink-100 shadow-lg bg-white/80 backdrop-blur-md">
          <table className="min-w-full text-xs text-center border border-gray-300 border-collapse">
            <thead className="bg-gradient-to-r from-amber-200 via-pink-200 to-rose-200 text-gray-900">
              <tr>
                {[
                  "แมทช์",
                  "ประเภท",
                  "รอบ",
                  "Court",
                  "สถานะ",
                  "เวลาเข้า",
                  "เวลาออก",
                  "เวลาที่ใช้",
                  "กลุ่ม",
                  "ทีม A",
                  "ผู้เล่น A",
                  "VS",
                  "ทีม B",
                  "ผู้เล่น B",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 font-semibold border border-gray-300 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((m, i) => (
                <tr
                  key={m.id}
                  className={`transition-all duration-150 hover:bg-pink-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-amber-50/40"
                  }`}
                >
                  <td className="p-2 border border-gray-300">{m.id}</td>
                  <td className="p-2 border border-gray-300">{m.type}</td>
                  <td className="p-2 border border-gray-300">{m.round}</td>
                  <td className="p-2 border border-gray-300">{m.court}</td>
                  <td className="p-2 border border-gray-300">
                    {renderStatusBadge(m.status)}
                  </td>
                  <td className="p-2 border border-gray-300">{m.timeIn}</td>
                  <td className="p-2 border border-gray-300">{m.timeOut}</td>
                  <td className="p-2 border border-gray-300">{m.duration}</td>
                  <td className="p-2 border border-gray-300">{m.group}</td>
                  <td className="p-2 border border-gray-300 font-medium">
                    {m.team1}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {renderPlayers(m.matchType, m.player1A, m.player1B)}
                  </td>
                  <td className="p-2 border border-gray-300 font-bold text-gray-700">
                    VS
                  </td>
                  <td className="p-2 border border-gray-300 font-medium">
                    {m.team2}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {renderPlayers(m.matchType, m.player2A, m.player2B)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📱 Mobile View */}
      <div className="sm:hidden flex flex-col gap-4 mt-2">
        {filteredMatches.map((m) => (
          <div
            key={m.id}
            className="bg-white/70 backdrop-blur-md border border-pink-100 shadow-md rounded-xl p-3 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-pink-700 text-sm">
                Match #{m.id} ({m.matchType === "single" ? "เดี่ยว" : "คู่"})
              </h3>
              {renderStatusBadge(m.status)}
            </div>

            <p className="text-gray-700 text-xs">
              <span className="font-semibold">Court:</span> {m.court}
            </p>
            <p className="text-gray-700 text-xs mb-2">
              <span className="font-semibold">เวลา:</span> {m.timeIn} - {m.timeOut}
            </p>

            <div className="border-t border-dashed border-gray-300 mt-2 pt-2 text-xs">
              <p className="font-semibold text-gray-800">
                {m.group} | {m.type} ({m.round})
              </p>
              <div className="mt-1">
                {renderPlayers(m.matchType, m.player1A, m.player1B)}
              </div>
              <p className="text-center font-bold text-gray-600 mt-1 mb-1">⚔️ VS ⚔️</p>
              <div>{renderPlayers(m.matchType, m.player2A, m.player2B)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
