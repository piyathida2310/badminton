"use client";

import React from "react";

interface Match {
  round: string;
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  winner: string;
}

export default function TournamentTable() {
  const matches: Match[] = [
    { round: "รอบ 16 ทีม", teamA: "Smash Warriors", scoreA: 2, teamB: "Net Masters", scoreB: 0, winner: "Smash Warriors" },
    { round: "รอบ 16 ทีม", teamA: "Speed Feathers", scoreA: 0, teamB: "Sky Smashers", scoreB: 2, winner: "Sky Smashers" },
    { round: "รอบ 16 ทีม", teamA: "Clear Fighters", scoreA: 2, teamB: "Birdie Hunters", scoreB: 1, winner: "Clear Fighters" },
    { round: "รอบ 16 ทีม", teamA: "Rapid Smash", scoreA: 2, teamB: "Golden Shuttle", scoreB: 0, winner: "Rapid Smash" },
    { round: "รอบ 8 ทีม", teamA: "Smash Warriors", scoreA: 2, teamB: "Sky Smashers", scoreB: 1, winner: "Smash Warriors" },
    { round: "รอบ 8 ทีม", teamA: "Clear Fighters", scoreA: 2, teamB: "Rapid Smash", scoreB: 0, winner: "Clear Fighters" },
    { round: "รอบ 4 ทีม", teamA: "Smash Warriors", scoreA: 2, teamB: "Clear Fighters", scoreB: 0, winner: "Smash Warriors" },
  ];

  return (
    <div className="min-h-screen bg-[#2ED3B7]/5 flex flex-col items-center py-10 px-4">
      {/* หัวข้อ */}
      <h1 className="text-2xl md:text-3xl font-bold text-[#194185] mb-6 text-center">
        🏸 แผนผังการแข่งขัน Rank BG ประเภทเดี่ยว
      </h1>

      {/* ตารางการแข่งขัน */}
      <div className="overflow-x-auto w-full max-w-5xl bg-white rounded-xl shadow-lg border border-[#2ED3B7]/20">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#194185]/5">
            <tr className="text-gray-800 text-sm md:text-base font-semibold text-center">
              <th className="p-3 border">รอบ</th>
              <th className="p-3 border">ทีม A</th>
              <th className="p-3 border">คะแนน</th>
              <th className="p-3 border">ทีม B</th>
              <th className="p-3 border">คะแนน</th>
              <th className="p-3 border">ผู้ชนะ</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr
                key={i}
                className="text-sm md:text-base text-gray-700 hover:bg-[#2ED3B7]/5 transition"
              >
                <td className="border p-3 text-center font-medium">{m.round}</td>
                <td className="border p-3">{m.teamA}</td>
                <td className="border p-3 text-center">{m.scoreA}</td>
                <td className="border p-3">{m.teamB}</td>
                <td className="border p-3 text-center">{m.scoreB}</td>
                <td className="border p-3 text-center">
                  <span className="px-3 py-1 bg-[#2ED3B7]/20 text-[#194185] rounded-full text-xs md:text-sm font-semibold">
                    {m.winner}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ปุ่มถัดไป */}
      <button className="mt-8 bg-[#194185] hover:bg-[#2ED3B7] text-white font-medium rounded-md px-6 py-2 shadow transition">
        ถัดไป
      </button>
    </div>
  );
}
