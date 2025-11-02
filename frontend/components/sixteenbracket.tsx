"use client";

import React, { useState } from "react";
import Link from "next/link";

/*  ตารางการแข่งขัน */
const MatchTable = () => {
  //  state เก็บคะแนนในแต่ละช่อง
  const [scores, setScores] = useState({
    totalA: 2,
    totalB: 0,
    set1A: 21,
    set1B: 0,
    set2A: 21,
    set2B: 0,
    set3A: 0,
    set3B: 0,
    set4A: 0,
    set4B: 0,
  });

  //  ตรวจว่าอยู่ในโหมดแก้ไขไหม
  const [isEditing, setIsEditing] = useState(false);

  // เมื่อแก้ไข input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setScores((prev) => ({ ...prev, [name]: value }));
    }
  };

  //  เมื่อกดบันทึก
  const handleSave = () => {
    setIsEditing(false);
    console.log(" คะแนนที่บันทึกแล้ว:", scores);
    alert(" บันทึกคะแนนเรียบร้อย!");
  };

  return (
    <div
      className="p-1 scale-[1.0] origin-top-left w-fit"
      
    >
      

      {/* ปุ่ม toggle แก้ไข / บันทึก */}
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
          {/*  แถวผลรวมคะแนน */}
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

/*  หน้าหลักของแผนผัง */
interface SixteenBracketProps {
  level: string;
}

export default function SixteenBracket({ level }: SixteenBracketProps) {
  return (
    <div
      className="h-[1200px] w-full overflow-x-auto overflow-y-hidden bg-[#f9f9f0] flex flex-col items-start py-10 relative"
      
    >
      

      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center w-full">
        🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 16 ทีม ({level})
      </h1>

      <div className="flex justify-start gap-[60px] px-[68px] mb-6 text-sm text-gray-700 font-medium">
        <div className="w-[500px] text-center">Round of 16</div>
        <div className="w-[500px] text-center">Round of 8</div>
        <div className="w-[500px] text-center">Semi - Finals</div>
        <div className="w-[500px] text-center">Finals</div>
      </div>

      <div className="flex flex-row justify-start gap-12 px-10">
        {/*  โครงสร้าง bracket เดิมทั้งหมดของน้องผักกาดยังเหมือนเดิม */}
        <div className="flex flex-col justify-between h-[1000px]">
          {[...Array(8)].map((_, i) => (
            <MatchTable key={i} />
          ))}
          <div>
            <div>
              <Line top={260} left={545} length={20} angle={1} color="#555" />
              <Line top={325} left={545} length={20} angle={1} color="#555" />
              <Line top={260} left={565} length={67} angle={90} color="#555" />
              <Line top={295} left={565} length={35} angle={1} color="#555" />
            </div>
            <div>
              <Line top={510} left={545} length={20} angle={1} color="#555" />
              <Line top={575} left={545} length={20} angle={1} color="#555" />
              <Line top={510} left={565} length={66} angle={90} color="#555" />
              <Line top={540} left={565} length={35} angle={1} color="#555" />
            </div>
            <div>
              <Line top={760} left={545} length={20} angle={1} color="#555" />
              <Line top={825} left={545} length={20} angle={1} color="#555" />
              <Line top={760} left={565} length={68} angle={90} color="#555" />
              <Line top={795} left={565} length={35} angle={1} color="#555" />
            </div>
            <div>
              <Line top={1010} left={545} length={20} angle={1} color="#555" />
              <Line top={1080} left={545} length={20} angle={1} color="#555" />
              <Line top={1010} left={565} length={71} angle={90} color="#555" />
              <Line top={1040} left={565} length={35} angle={1} color="#555" />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col justify-between h-[1110px] mt-15">
          {[...Array(4)].map((_, i) => (
            <MatchTable key={i} />
          ))}
          <div>
            <Line top={320} left={1100} length={20} angle={1} color="#555" />
            <Line top={520} left={1100} length={20} angle={1} color="#555" />
            <Line top={320} left={1120} length={201} angle={90} color="#555" />
            <Line top={425} left={1120} length={35} angle={1} color="#555" />
          </div>
          <div>
            <Line top={810} left={1100} length={20} angle={1} color="#555" />
            <Line top={1005} left={1100} length={20} angle={1} color="#555" />
            <Line top={810} left={1120} length={197} angle={90} color="#555" />
            <Line top={905} left={1120} length={35} angle={1} color="#555" />
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col justify-between h-[610px] mt-45">
          {[...Array(2)].map((_, i) => (
            <MatchTable key={i} />
          ))}
        </div>

        <div>
          <Line top={440} left={1655} length={20} angle={1} color="#555" />
          <Line top={865} left={1655} length={20} angle={1} color="#555" />
          <Line top={440} left={1675} length={428} angle={90} color="#555" />
          <Line top={610} left={1675} length={100} angle={1} color="#555" />
        </div>

        {/* Column 4 */}
        <div className="flex flex-col justify-center h-[550px] mt-40">
          <MatchTable />
        </div>
      </div>

      
    </div>
  );
}
