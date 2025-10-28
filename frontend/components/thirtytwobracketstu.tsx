"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ✅ ตารางการแข่งขันเต็ม (นำมาจากของเดิมที่ให้มา) */
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
          {/* 🔸 แถวผลรวมคะแนน */}
          <tr className="border border-black">
            <td colSpan={5}></td>
            <td className="border border-black w-8 bg-green-400 font-bold text-white">
              {scores.totalA}
            </td>
            <td className="border border-black w-8 font-semibold">
              {scores.totalB}
            </td>
          </tr>

          {/* 🔸 ทีมบน */}
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

          {/* 🔸 เซตถัดไป */}
          <tr className="border border-black">
            <td colSpan={4}></td>
            <td className="border border-black w-8 bg-green-300 font-semibold py-[2px]">
              {scores.set2A}
            </td>
            <td className="border border-black w-8 font-semibold py-[2px]">
              {scores.set2B}
            </td>
          </tr>

          {/* 🔸 ทีมล่าง */}
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

/* 🔧 เส้นเชื่อม */
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

/* 🏸 หน้าหลักของแผนผัง 32 ทีม */
export default function ThirtyTwoBracketStu({ level }: ThirtyTwoBracketProps) {
  return (
    <div
      className="h-[2200px] w-[1800px] overflow-x-auto overflow-y-hidden  bg-[#f9f9f0] flex flex-col items-center py-10 relative scrollbar-none"
      style={{
        scrollbarWidth: "none", // ✅ ซ่อน scrollbar (Firefox)
        msOverflowStyle: "none", // ✅ ซ่อน scrollbar (Edge)
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 32 ทีม ({level})
      </h1>

      <div className="min-w-[3600px] flex justify-evenly  mb-6 text-sm text-gray-700 font-medium relative ">
        <div className="text-center absolute left-[1100px] ">Round of 32</div>
        <div className="text-center absolute left-[1650px]  ">Round of 16</div>
        <div className="text-center absolute left-[2200px]  ">
          Quarter Finals
        </div>
        <div className="text-center absolute right-[750px]  ">Semi Finals</div>
        <div className="text-center absolute right-48 ">Final</div>
      </div>

      {/* Bracket Layout */}
      <div className="flex justify-center gap-5 w-full px-10 ml-[1000px]">
        <div className="flex flex-col justify-between h-[1990px]">
          {[...Array(16)].map((_, i) => (
            <MatchTable key={i} />
          ))}

          <div>
            <Line top={200} left={545} length={20} angle={1} color="#555" />
            <Line top={300} left={545} length={20} angle={1} color="#555" />
            <Line top={200} left={565} length={100} angle={90} color="#555" />
            <Line top={250} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={430} left={545} length={20} angle={1} color="#555" />
            <Line top={535} left={545} length={20} angle={1} color="#555" />
            <Line top={430} left={565} length={105} angle={90} color="#555" />
            <Line top={480} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={660} left={545} length={20} angle={1} color="#555" />
            <Line top={775} left={545} length={20} angle={1} color="#555" />
            <Line top={660} left={565} length={117} angle={90} color="#555" />
            <Line top={720} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={900} left={545} length={20} angle={1} color="#555" />
            <Line top={1000} left={545} length={20} angle={1} color="#555" />
            <Line top={900} left={565} length={101} angle={90} color="#555" />
            <Line top={955} left={565} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1140} left={545} length={20} angle={1} color="#555" />
            <Line top={1240} left={545} length={20} angle={1} color="#555" />
            <Line top={1140} left={565} length={102} angle={90} color="#555" />
            <Line top={1190} left={565} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1370} left={545} length={20} angle={1} color="#555" />
            <Line top={1470} left={545} length={20} angle={1} color="#555" />
            <Line top={1370} left={565} length={102} angle={90} color="#555" />
            <Line top={1425} left={565} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1610} left={545} length={20} angle={1} color="#555" />
            <Line top={1710} left={545} length={20} angle={1} color="#555" />
            <Line top={1610} left={565} length={102} angle={90} color="#555" />
            <Line top={1660} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={1850} left={545} length={20} angle={1} color="#555" />
            <Line top={1950} left={545} length={20} angle={1} color="#555" />
            <Line top={1850} left={565} length={101} angle={90} color="#555" />
            <Line top={1900} left={565} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[2280px] mt-15">
          {[...Array(8)].map((_, i) => (
            <MatchTable key={i} />
          ))}
          <div>
            <Line top={270} left={1072} length={20} angle={1} color="#555" />
            <Line top={500} left={1072} length={20} angle={1} color="#555" />
            <Line top={270} left={1092} length={230} angle={90} color="#555" />
            <Line top={370} left={1092} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={730} left={1072} length={20} angle={1} color="#555" />
            <Line top={950} left={1072} length={20} angle={1} color="#555" />
            <Line top={730} left={1092} length={221} angle={90} color="#555" />
            <Line top={835} left={1092} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1200} left={1072} length={20} angle={1} color="#555" />
            <Line top={1430} left={1072} length={20} angle={1} color="#555" />
            <Line top={1200} left={1092} length={230} angle={90} color="#555" />
            <Line top={1310} left={1092} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1660} left={1072} length={20} angle={1} color="#555" />
            <Line top={1890} left={1072} length={20} angle={1} color="#555" />
            <Line top={1660} left={1092} length={230} angle={90} color="#555" />
            <Line top={1765} left={1092} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[2220px] mt-45">
          {[...Array(4)].map((_, i) => (
            <MatchTable key={i} />
          ))}

          <div>
            <Line top={370} left={1600} length={20} angle={1} color="#555" />
            <Line top={820} left={1600} length={20} angle={1} color="#555" />
            <Line top={370} left={1620} length={451} angle={90} color="#555" />
            <Line top={580} left={1620} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1300} left={1600} length={20} angle={1} color="#555" />
            <Line top={1750} left={1600} length={20} angle={1} color="#555" />
            <Line top={1300} left={1620} length={450} angle={90} color="#555" />
            <Line top={1530} left={1620} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[1900px] mt-97">
          {[...Array(2)].map((_, i) => (
            <MatchTable key={i} />
          ))}

          <div>
            <Line top={580} left={2128} length={20} angle={1} color="#555" />
            <Line top={1520} left={2128} length={20} angle={1} color="#555" />
            <Line top={580} left={2148} length={942} angle={90} color="#555" />
            <Line top={1000} left={2148} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-center h-[850px] mt-110">
          <MatchTable />
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
          overflow-x: hidden !important;
        }
        div::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
