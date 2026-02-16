"use client";

import React, { useState } from "react";
import Link from "next/link";

const MatchTable = () => {
  const [scores] = useState({
    totalA: 2,
    totalB: 0,
    set1A: 21,
    set1B: 10,
    set2A: 21,
    set2B: 15,
    set3A: 0,
    set3B: 0,
    set4A: 0,
    set4B: 0,
  });

  return (
    <div
      className="p-1 overflow-x-auto overflow-y-hidden scale-[0.9] origin-top-left w-fit scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <table className="border border-black text-[10px] text-center w-full min-w-[500px]">
        <tbody>
          {/*  แถวผลรวมคะแนน */}
          <tr className="border border-black">
            <td colSpan={5}></td>
            <td className="border border-black w-8 bg-green-400 font-bold text-white">
              {scores.totalA}
            </td>
            <td className="border border-black w-8 font-semibold">
              {scores.totalB}
            </td>
          </tr>

          {/*  ทีมบน */}
          <tr className="border border-black">
            <td
              rowSpan={8}
              className="text-left text-red-600 pl-2 py-[2px] border border-black bg-red-100 font-semibold"
            >
              249
            </td>
            <td className="border border-black w-12 font-semibold bg-yellow-300 py-[2px]">
              N1A
            </td>
            <td className="border border-black text-left px-1 bg-yellow-300 font-semibold truncate max-w-[180px]">
              JPLBYTHITIPONG/MASTERPIECE
            </td>
            <td className="border border-black bg-yellow-300 font-semibold py-[2px]">
              ดลสิทธิ์
            </td>
            <td className="border border-black bg-yellow-300 font-semibold py-[2px]">
              ภาคภูมิ
            </td>
            <td className="border border-black w-8 bg-green-300 font-semibold py-[2px]">
              {scores.set1A}
            </td>
            <td className="border border-black w-8 font-semibold py-[2px]">
              {scores.set1B}
            </td>
          </tr>

          {/*  เซตถัดไป */}
          <tr className="border border-black">
            <td colSpan={4}></td>
            <td className="border border-black w-8 bg-green-300 font-semibold py-[2px]">
              {scores.set2A}
            </td>
            <td className="border border-black w-8 font-semibold py-[2px]">
              {scores.set2B}
            </td>
          </tr>

          {/*  ทีมล่าง */}
          <tr className="border border-black">
            <td className="border border-black font-semibold bg-gray-100 py-[2px]">
              N2B
            </td>
            <td className="border border-black text-left px-1 bg-gray-100 truncate max-w-[180px]">
              ไม่ยอมว่ะLittle Bear
            </td>
            <td className="border border-black bg-gray-100 py-[2px]">
              ชานาญ (เล็ก)
            </td>
            <td className="border border-black bg-gray-100 py-[2px]">
              พงศกร (บิ๊ก)
            </td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {scores.set3A}
            </td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {scores.set3B}
            </td>
          </tr>

          <tr className="border border-black">
            <td colSpan={4}></td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {scores.set3A}
            </td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {scores.set3B}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const Line = ({
  length = 100,
  angle = 0,
  thickness = 2,
  color = "#000",
  top = 0,
  left = 0,
}: {
  length?: number;
  angle?: number;
  thickness?: number;
  color?: string;
  top?: number;
  left?: number;
}) => (
  <div
    className="absolute origin-left"
    style={{
      top,
      left,
      width: `${length}px`,
      height: `${thickness}px`,
      backgroundColor: color,
      transform: `rotate(${angle}deg)`,
      transformOrigin: "left center",
    }}
  />
);

interface ThirtyTwoBracketProps {
  level: string;
}

/* 🏸 แผนผังการแข่งขัน แบบ Compact (1050px Height) */
export default function ThirtyTwoBracketStu({ level }: ThirtyTwoBracketProps) {
  return (
    <div
      className="h-[1200px] w-full overflow-auto bg-[#f9f9f0] flex flex-col items-start py-10 relative custom-scrollbar"
    >
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555; 
        }
      `}</style>

      <div className="w-full flex justify-center mb-10">
        <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center sticky left-0 right-0">
          🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 16 ทีม ({level})
        </h1>
      </div>

      <div className="flex flex-col relative px-10">
        <div className="flex justify-between w-[1600px] mb-6 text-sm text-gray-700 font-medium pl-20">
          <div className="bg-slate-200 px-3 py-1 rounded-full text-slate-700">Round of 16</div>
          <div className="bg-slate-200 px-3 py-1 rounded-full text-slate-700">Quarter Finals</div>
          <div className="bg-slate-200 px-3 py-1 rounded-full text-slate-700">Semi Finals</div>
          <div className="bg-yellow-400 px-4 py-1 rounded-full text-yellow-900 shadow-sm animate-pulse">Final</div>
        </div>

        {/* Bracket Layout - Compact */}
        <div className="flex gap-20 relative">

          {/* Round of 16 (8 Matches) - H 1050 */}
          <div className="flex flex-col justify-between h-[1050px] z-10 w-[350px]">
            {[...Array(8)].map((_, i) => (
              <MatchTable key={i} />
            ))}

            <div className="absolute inset-0 pointer-events-none">
              {/* Lines R16 -> QF */}
              {/* Colors slightly different for variety #666 */}
              <div><Line top={60} left={360} length={20} angle={1} color="#666" /><Line top={191} left={360} length={20} angle={1} color="#666" /><Line top={60} left={380} length={131} angle={90} color="#666" /><Line top={125} left={380} length={60} angle={1} color="#666" /></div>
              <div><Line top={322} left={360} length={20} angle={1} color="#666" /><Line top={453} left={360} length={20} angle={1} color="#666" /><Line top={322} left={380} length={131} angle={90} color="#666" /><Line top={387} left={380} length={60} angle={1} color="#666" /></div>
              <div><Line top={584} left={360} length={20} angle={1} color="#666" /><Line top={715} left={360} length={20} angle={1} color="#666" /><Line top={584} left={380} length={131} angle={90} color="#666" /><Line top={649} left={380} length={60} angle={1} color="#666" /></div>
              <div><Line top={846} left={360} length={20} angle={1} color="#666" /><Line top={977} left={360} length={20} angle={1} color="#666" /><Line top={846} left={380} length={131} angle={90} color="#666" /><Line top={911} left={380} length={60} angle={1} color="#666" /></div>

              {/* Lines QF -> SF */}
              <div><Line top={125} left={790} length={20} angle={1} color="#666" /><Line top={387} left={790} length={20} angle={1} color="#666" /><Line top={125} left={810} length={262} angle={90} color="#666" /><Line top={256} left={810} length={60} angle={1} color="#666" /></div>
              <div><Line top={649} left={790} length={20} angle={1} color="#666" /><Line top={911} left={790} length={20} angle={1} color="#666" /><Line top={649} left={810} length={262} angle={90} color="#666" /><Line top={780} left={810} length={60} angle={1} color="#666" /></div>

              {/* Lines SF -> Final */}
              <div><Line top={256} left={1220} length={20} angle={1} color="#666" /><Line top={780} left={1220} length={20} angle={1} color="#666" /><Line top={256} left={1240} length={524} angle={90} color="#666" /><Line top={518} left={1240} length={60} angle={1} color="#666" /></div>
            </div>
          </div>

          {/* QF (4 Matches) */}
          <div className="flex flex-col justify-between h-[906px] mt-[65px] z-10 w-[350px]">
            {[...Array(4)].map((_, i) => (
              <MatchTable key={i} />
            ))}
          </div>

          {/* SF (2 Matches) */}
          <div className="flex flex-col justify-between h-[644px] mt-[196px] z-10 w-[350px]">
            {[...Array(2)].map((_, i) => (
              <MatchTable key={i} />
            ))}
          </div>

          {/* Final (1 Match) */}
          <div className="flex flex-col justify-center h-[120px] mt-[458px] z-10 w-[350px]">
            <MatchTable />
          </div>
        </div>
      </div>
    </div>
  );
}
