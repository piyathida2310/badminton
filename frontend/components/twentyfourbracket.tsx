"use client";

import React from "react";
import Link from "next/link";

// 🔧 เส้นที่ปรับองศา/ความยาวได้ง่าย
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
}) => {
  return (
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
};

interface SixteenBracketProps {
  level: string;
}

export default function TwentyFourBracket({ level }: SixteenBracketProps) {
  return (
    // 🧩 เพิ่มส่วนนี้เท่านั้น: overflow-x-scroll → overflow-x-auto + custom scrollbar-hide
    <div className="h-full w-[1380px] overflow-x-auto bg-[#f9f9f0] flex flex-col items-center py-10 relative scrollbar-hide">
      <style jsx>{`
        /* ซ่อน scrollbar แนวนอน */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE และ Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 24 ทีม ({level})
      </h1>

      {/* Header */}
      <div className="flex justify-between w-[85%] mb-6 text-sm text-gray-700 font-medium">
        <div className="w-1/4 text-center">Round of 24</div>
        <div className="w-1/4 text-center">Round of 12</div>
        <div className="w-1/4 text-center">Semi - Finals</div>
        <div className="w-1/4 text-center">Finals</div>
      </div>

      {/* 🎯 Bracket Container */}
      <div className="flex justify-center gap-20 w-full px-10">
        {/* 🟩 Column 1 - 24 ทีม */}
        <div className="flex flex-col justify-between h-[850px]">
          {[
            ["Smash Warriors", true],
            ["Net Masters", false],
            ["Speed Feathers", true],
            ["Sky Smashers", false],
            ["Clear Fighters", true],
            ["Birdie Hunters", false],
            ["Rapid Smash", true],
            ["Golden Shuttle", false],
            ["Fire Drops", true],
            ["Wing Force", false],
            ["Swift Racquets", true],
            ["Thunder Birdies", false],
          ].map(([team, win], i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">
                {team as string}
              </span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  win ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟨 Column 2 - 12 ทีมที่ชนะ */}
        <div className="flex flex-col justify-between h-[772px] mt-10">
          {[
            ["Smash Warriors", true],
            ["Speed Feathers", false],
            ["Clear Fighters", true],
            ["Rapid Smash", false],
            ["Fire Drops", true],
            ["Swift Racquets", false],
          ].map(([team, win], i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">
                {team as string}
              </span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  win ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟧 Column 3 - รอบรอง */}
        <div className="flex flex-col justify-between h-[625px] mt-29">
          {[
            ["Smash Warriors", true],
            ["Clear Fighters", false],
            ["Fire Drops", true],
          ].map(([team, win], i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">
                {team as string}
              </span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  win ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟥 Column 4 - รอบชิง */}
        <div className="flex flex-col justify-center h-[610px] mt-30">
          <div className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1">
            <span className="text-sm font-medium text-gray-800">
              Smash Warriors
            </span>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          </div>
        </div>
      </div>

      {/* 🔗 เส้นเชื่อมต่าง ๆ */}
      <div>
        <Line top={175} left={380} length={20} angle={1} color="#555" />
        <Line top={250} left={380} length={20} angle={1} color="#555" />
        <Line top={174} left={400} length={78} angle={90} color="#555" />
        <Line top={215} left={400} length={60} angle={1} color="#555" />
      </div>

      <div>
        <Line top={325} left={380} length={20} angle={1} color="#555" />
        <Line top={400} left={380} length={20} angle={1} color="#555" />
        <Line top={325} left={400} length={77} angle={90} color="#555" />
        <Line top={365} left={400} length={60} angle={1} color="#555" />
      </div>

      <div>
        <Line top={473} left={380} length={20} angle={1} color="#555" />
        <Line top={550} left={380} length={20} angle={1} color="#555" />
        <Line top={473} left={400} length={80} angle={90} color="#555" />
        <Line top={510} left={400} length={60} angle={1} color="#555" />
      </div>

      <div>
        <Line top={620} left={380} length={20} angle={1} color="#555" />
        <Line top={695} left={380} length={20} angle={1} color="#555" />
        <Line top={620} left={400} length={77} angle={90} color="#555" />
        <Line top={660} left={400} length={60} angle={1} color="#555" />
      </div>
      <div>
        <Line top={770} left={380} length={20} angle={1} color="#555" />
        <Line top={845} left={380} length={20} angle={1} color="#555" />
        <Line top={770} left={400} length={77} angle={90} color="#555" />
        <Line top={805} left={400} length={60} angle={1} color="#555" />
      </div>
      <div>
        <Line top={920} left={380} length={20} angle={1} color="#555" />
        <Line top={995} left={380} length={20} angle={1} color="#555" />
        <Line top={920} left={400} length={77} angle={90} color="#555" />
        <Line top={955} left={400} length={60} angle={1} color="#555" />
      </div>

      {/* 🪄 ระหว่าง column2-3 */}
      <div>
        <Line top={215} left={650} length={20} angle={1} color="#555" />
        <Line top={365} left={650} length={20} angle={1} color="#555" />
        <Line top={215} left={670} length={150} angle={90} color="#555" />
        <Line top={290} left={670} length={60} angle={1} color="#555" />
      </div>

      <div>
        <Line top={510} left={650} length={20} angle={1} color="#555" />
        <Line top={660} left={650} length={20} angle={1} color="#555" />
        <Line top={510} left={670} length={150} angle={90} color="#555" />
        <Line top={585} left={670} length={60} angle={1} color="#555" />
      </div>

      <div>
        <Line top={810} left={650} length={20} angle={1} color="#555" />
        <Line top={955} left={650} length={20} angle={1} color="#555" />
        <Line top={810} left={670} length={145} angle={90} color="#555" />
        <Line top={885} left={670} length={60} angle={1} color="#555" />
      </div>

      {/* 🧵 ระหว่าง column3-4 */}
      <div>
        <Line top={290} left={921} length={20} angle={1} color="#555" />
        <Line top={885} left={921} length={20} angle={1} color="#555" />
        <Line top={290} left={940} length={595} angle={90} color="#555" />
        <Line top={585} left={940} length={62} angle={1} color="#555" />
      </div>
    </div>
  );
}
