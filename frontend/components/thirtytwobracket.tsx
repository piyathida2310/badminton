"use client";

import React, { useState } from "react";
import Link from "next/link";


const MatchTable = () => {
  const [scores, setScores] = useState({
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

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) setScores((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log(" คะแนนที่บันทึกแล้ว:", scores);
    alert(" บันทึกคะแนนเรียบร้อย!");
  };

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

      {/* ปุ่มแก้ไข/บันทึก */}
      <div className="flex justify-end mb-1">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="text-[10px] bg-green-500 text-white px-2 py-[2px] rounded hover:bg-green-600 transition"
          >
            บันทึก
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] bg-blue-500 text-white px-2 py-[2px] rounded hover:bg-blue-600 transition"
          >
            แก้ไขคะแนน
          </button>
        )}
      </div>

      <table className="border border-black text-[10px] text-center w-full min-w-[500px]">
        <tbody>
          {/* แถวผลรวมคะแนน */}
          <tr className="border border-black">
            <td colSpan={5}></td>
            <td className="border border-black w-8 bg-green-400 font-bold text-white">
              {isEditing ? (
                <input
                  name="totalA"
                  value={scores.totalA}
                  onChange={handleChange}
                  className="w-full bg-green-300 text-center"
                />
              ) : (
                scores.totalA
              )}
            </td>
            <td className="border border-black w-8 font-semibold">
              {isEditing ? (
                <input
                  name="totalB"
                  value={scores.totalB}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.totalB
              )}
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
              {isEditing ? (
                <input
                  name="set1A"
                  value={scores.set1A}
                  onChange={handleChange}
                  className="w-full bg-green-200 text-center"
                />
              ) : (
                scores.set1A
              )}
            </td>
            <td className="border border-black w-8 font-semibold py-[2px]">
              {isEditing ? (
                <input
                  name="set1B"
                  value={scores.set1B}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.set1B
              )}
            </td>
          </tr>

          {/*  เซตถัดไป */}
          <tr className="border border-black">
            <td colSpan={4}></td>
            <td className="border border-black w-8 bg-green-300 font-semibold py-[2px]">
              {isEditing ? (
                <input
                  name="set2A"
                  value={scores.set2A}
                  onChange={handleChange}
                  className="w-full bg-green-200 text-center"
                />
              ) : (
                scores.set2A
              )}
            </td>
            <td className="border border-black w-8 font-semibold py-[2px]">
              {isEditing ? (
                <input
                  name="set2B"
                  value={scores.set2B}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.set2B
              )}
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
              {isEditing ? (
                <input
                  name="set3A"
                  value={scores.set3A}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.set3A
              )}
            </td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {isEditing ? (
                <input
                  name="set3B"
                  value={scores.set3B}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.set3B
              )}
            </td>
          </tr>

          <tr className="border border-black">
            <td colSpan={4}></td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {isEditing ? (
                <input
                  name="set4A"
                  value={scores.set3A}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.set3A
              )}
            </td>
            <td className="border border-black w-8 font-semibold bg-white py-[2px]">
              {isEditing ? (
                <input
                  name="set4B"
                  value={scores.set3B}
                  onChange={handleChange}
                  className="w-full text-center"
                />
              ) : (
                scores.set3B
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/*  เส้นเชื่อม */
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
export default function ThirtyTwoBracket({ level }: ThirtyTwoBracketProps) {
  return (
    <div
      className="h-[2200px] w-[1800px] overflow-x-auto overflow-y-hidden  bg-[#f9f9f0] flex flex-col items-center py-10 relative scrollbar-none"
      style={{
        scrollbarWidth: "none", // ซ่อน scrollbar (Firefox)
        msOverflowStyle: "none", // ซ่อน scrollbar (Edge)
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
            <Line top={220} left={545} length={20} angle={1} color="#555" />
            <Line top={325} left={545} length={20} angle={1} color="#555" />
            <Line top={220} left={565} length={107} angle={90} color="#555" />
            <Line top={270} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={460} left={545} length={20} angle={1} color="#555" />
            <Line top={575} left={545} length={20} angle={1} color="#555" />
            <Line top={460} left={565} length={116} angle={90} color="#555" />
            <Line top={520} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={710} left={545} length={20} angle={1} color="#555" />
            <Line top={825} left={545} length={20} angle={1} color="#555" />
            <Line top={710} left={565} length={117} angle={90} color="#555" />
            <Line top={770} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={960} left={545} length={20} angle={1} color="#555" />
            <Line top={1080} left={545} length={20} angle={1} color="#555" />
            <Line top={960} left={565} length={122} angle={90} color="#555" />
            <Line top={1020} left={565} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1210} left={545} length={20} angle={1} color="#555" />
            <Line top={1310} left={545} length={20} angle={1} color="#555" />
            <Line top={1210} left={565} length={102} angle={90} color="#555" />
            <Line top={1270} left={565} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1460} left={545} length={20} angle={1} color="#555" />
            <Line top={1560} left={545} length={20} angle={1} color="#555" />
            <Line top={1460} left={565} length={102} angle={90} color="#555" />
            <Line top={1520} left={565} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1710} left={545} length={20} angle={1} color="#555" />
            <Line top={1810} left={545} length={20} angle={1} color="#555" />
            <Line top={1710} left={565} length={102} angle={90} color="#555" />
            <Line top={1760} left={565} length={60} angle={1} color="#555" />
          </div>
          <div>
            <Line top={1950} left={545} length={20} angle={1} color="#555" />
            <Line top={2060} left={545} length={20} angle={1} color="#555" />
            <Line top={1950} left={565} length={110} angle={90} color="#555" />
            <Line top={2010} left={565} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[2350px] mt-15">
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
            <Line top={770} left={1072} length={20} angle={1} color="#555" />
            <Line top={990} left={1072} length={20} angle={1} color="#555" />
            <Line top={770} left={1092} length={221} angle={90} color="#555" />
            <Line top={885} left={1092} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1250} left={1072} length={20} angle={1} color="#555" />
            <Line top={1480} left={1072} length={20} angle={1} color="#555" />
            <Line top={1250} left={1092} length={230} angle={90} color="#555" />
            <Line top={1370} left={1092} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1760} left={1072} length={20} angle={1} color="#555" />
            <Line top={2000} left={1072} length={20} angle={1} color="#555" />
            <Line top={1760} left={1092} length={241} angle={90} color="#555" />
            <Line top={1875} left={1092} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[2430px] mt-40">
          {[...Array(4)].map((_, i) => (
            <MatchTable key={i} />
          ))}

          <div>
            <Line top={370} left={1600} length={20} angle={1} color="#555" />
            <Line top={870} left={1600} length={20} angle={1} color="#555" />
            <Line top={370} left={1620} length={501} angle={90} color="#555" />
            <Line top={610} left={1620} length={60} angle={1} color="#555" />
          </div>

          <div>
            <Line top={1400} left={1600} length={20} angle={1} color="#555" />
            <Line top={1890} left={1600} length={20} angle={1} color="#555" />
            <Line top={1400} left={1620} length={492} angle={90} color="#555" />
            <Line top={1660} left={1620} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-between h-[2100px] mt-100">
          {[...Array(2)].map((_, i) => (
            <MatchTable key={i} />
          ))}

          <div>
            <Line top={600} left={2128} length={20} angle={1} color="#555" />
            <Line top={1650} left={2128} length={20} angle={1} color="#555" />
            <Line top={600} left={2148} length={1051} angle={90} color="#555" />
            <Line top={1100} left={2148} length={60} angle={1} color="#555" />
          </div>
        </div>

        <div className="flex flex-col justify-center h-[850px] mt-130">
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
