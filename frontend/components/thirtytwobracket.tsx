"use client";

import React from "react";
import Link from "next/link";

// 🔧 เส้นเชื่อมแบบปรับองศา/ความยาวได้
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

export default function ThirtyTwoBracket({ level }: SixteenBracketProps) {

  return (
    <div className="h-full w-[1500px] overflow-x-scroll bg-[#f9f9f0] flex flex-col items-center py-10 relative overflow-hidden">
      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 32 ทีม ({ level })
      </h1>

      {/* Header */}
      <div className="flex justify-between w-[90%] mb-6 text-sm text-gray-700 font-medium">
        <div className="w-1/5 text-center">Round of 32</div>
        <div className="w-1/5 text-center">Round of 16</div>
        <div className="w-1/5 text-center">Quarter Finals</div>
        <div className="w-1/5 text-center">Semi Finals</div>
        <div className="w-1/5 text-center">Final</div>
      </div>

      {/* 🎯 Bracket Container */}
      <div className="flex justify-center gap-10 w-full px-10">
        {/* 🟩 Column 1 - 32 ทีม */}
        <div className="flex flex-col justify-between h-[1390px]">
          {[
            "Smash Warriors",
            "Net Masters",
            "Speed Feathers",
            "Sky Smashers",
            "Clear Fighters",
            "Birdie Hunters",
            "Rapid Smash",
            "Golden Shuttle",
            "Fire Drops",
            "Wing Force",
            "Swift Racquets",
            "Thunder Birdies",
            "Drop Shot Crew",
            "Feather Flyers",
            "Spin Smashers",
            "Net Ninjas",
          ].map((team, i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">{team}</span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  i % 2 === 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟨 Column 2 - 16 ทีม */}
        <div className="flex flex-col justify-between h-[1300px] mt-11">
          {[
            "Smash Warriors",
            "Speed Feathers",
            "Clear Fighters",
            "Rapid Smash",
            "Fire Drops",
            "Swift Racquets",
            "Drop Shot Crew",
            "Spin Smashers",
          ].map((team, i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">{team}</span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  i % 2 === 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟧 Column 3 - 8 ทีม */}
        <div className="flex flex-col justify-between h-[850px] mt-20">
          {[
            "Smash Warriors",
            "Clear Fighters",
            "Fire Drops",
            "Drop Shot Crew",
          ].map((team, i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">{team}</span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  i % 2 === 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟪 Column 4 - 4 ทีม */}
        <div className="flex flex-col justify-between h-[500px] mt-40">
          {[
            "Smash Warriors",
            "Fire Drops",
          ].map((team, i) => (
            <div
              key={i}
              className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1"
            >
              <span className="text-sm font-medium text-gray-800">{team}</span>
              <div
                className={`w-4 h-4 rounded-sm ${
                  i % 2 === 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* 🟥 Column 5 - แชมป์ */}
        <div className="flex flex-col justify-center h-[300px] mt-60">
          <div className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1">
            <span className="text-sm font-medium text-gray-800">
              Smash Warriors 🏆
            </span>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          </div>
        </div>
      </div>

            {/* 🧩 เส้นเชื่อม (Round of 24 → 12) */}
      <div>
        <Line top={175} left={380} length={20} angle={1} color="#555" />
        <Line top={265} left={380} length={20} angle={1} color="#555" />
        <Line top={174} left={400} length={90} angle={90} color="#555" />
        <Line top={220} left={400} length={25} angle={1} color="#555" />
      </div>

      <div>
        <Line top={355} left={380} length={20} angle={1} color="#555" />
        <Line top={445} left={380} length={20} angle={1} color="#555" />
        <Line top={355} left={400} length={90} angle={90} color="#555" />
        <Line top={400} left={400} length={22} angle={1} color="#555" />
      </div>

      <div>
        <Line top={540} left={380} length={20} angle={1} color="#555" />
        <Line top={630} left={380} length={20} angle={1} color="#555" />
        <Line top={540} left={400} length={80} angle={90} color="#555" />
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

      {/* 🪄 เส้นระหว่าง column2-3 */}
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

      {/* 🧵 เส้นระหว่าง column3-4 */}
      <div>
        <Line top={290} left={921} length={20} angle={1} color="#555" />
        <Line top={885} left={921} length={20} angle={1} color="#555" />
        <Line top={290} left={940} length={595} angle={90} color="#555" />
        <Line top={585} left={940} length={62} angle={1} color="#555" />
      </div>


      {/* 🎀 ปุ่มถัดไป */}
      <Link
        href="/manage/bracket/lowmatch"
        className="absolute bottom-10 right-10 bg-amber-500 text-white font-medium rounded-md px-6 py-2 hover:bg-amber-600 transition"
      >
        ถัดไป
      </Link>
    </div>
  );
}
