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
    <div className="h-full w-[1500px] overflow-x-auto overflow-y-hidden bg-[#f9f9f0] flex flex-col items-center py-10 relative scrollbar-none">
      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 32 ทีม ({level})
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
        <div className="flex flex-col justify-between h-[1140px] mt-30">
          {["Smash Warriors", "Clear Fighters", "Fire Drops", "Drop Shot Crew"].map(
            (team, i) => (
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
            )
          )}
        </div>

        {/* 🟪 Column 4 - 4 ทีม */}
        <div className="flex flex-col justify-between h-[770px] mt-80">
          {["Smash Warriors", "Fire Drops"].map((team, i) => (
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
        <div className="flex flex-col justify-center h-[300px] mt-130">
          <div className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1">
            <span className="text-sm font-medium text-gray-800">
              Smash Warriors 🏆
            </span>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          </div>
        </div>
      </div>

      {/* 🔗 เส้นเชื่อมทั้งหมด (คงเดิมทั้งหมด) */}
      <div>
        <Line top={175} left={382} length={20} angle={1} color="#555" />
        <Line top={265} left={382} length={20} angle={1} color="#555" />
        <Line top={174} left={402} length={92} angle={90} color="#555" />
        <Line top={220} left={402} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={355} left={382} length={20} angle={1} color="#555" />
        <Line top={445} left={382} length={20} angle={1} color="#555" />
        <Line top={355} left={402} length={90} angle={90} color="#555" />
        <Line top={400} left={402} length={22} angle={1} color="#555" />
      </div>

      <div>
        <Line top={535} left={382} length={20} angle={1} color="#555" />
        <Line top={630} left={382} length={20} angle={1} color="#555" />
        <Line top={535} left={402} length={97} angle={90} color="#555" />
        <Line top={580} left={402} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={720} left={382} length={20} angle={1} color="#555" />
        <Line top={810} left={382} length={20} angle={1} color="#555" />
        <Line top={720} left={402} length={90} angle={90} color="#555" />
        <Line top={760} left={402} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={900} left={382} length={20} angle={1} color="#555" />
        <Line top={990} left={382} length={20} angle={1} color="#555" />
        <Line top={900} left={402} length={90} angle={90} color="#555" />
        <Line top={945} left={402} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={1080} left={382} length={20} angle={1} color="#555" />
        <Line top={1170} left={382} length={20} angle={1} color="#555" />
        <Line top={1080} left={402} length={90} angle={90} color="#555" />
        <Line top={1125} left={402} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={1260} left={382} length={20} angle={1} color="#555" />
        <Line top={1355} left={382} length={20} angle={1} color="#555" />
        <Line top={1260} left={402} length={95} angle={90} color="#555" />
        <Line top={1305} left={401} length={22} angle={1} color="#555" />
      </div>

      <div>
        <Line top={1445} left={382} length={20} angle={1} color="#555" />
        <Line top={1535} left={382} length={20} angle={1} color="#555" />
        <Line top={1445} left={402} length={90} angle={90} color="#555" />
        <Line top={1485} left={401} length={23} angle={1} color="#555" />
      </div>

      {/* 🪄 เส้นระหว่าง column2-3 */}
      <div>
        <Line top={220} left={614} length={20} angle={1} color="#555" />
        <Line top={400} left={614} length={20} angle={1} color="#555" />
        <Line top={220} left={634} length={181} angle={90} color="#555" />
        <Line top={295} left={634} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={580} left={614} length={20} angle={1} color="#555" />
        <Line top={765} left={614} length={20} angle={1} color="#555" />
        <Line top={580} left={634} length={187} angle={90} color="#555" />
        <Line top={665} left={634} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={945} left={614} length={20} angle={1} color="#555" />
        <Line top={1125} left={614} length={20} angle={1} color="#555" />
        <Line top={945} left={634} length={181} angle={90} color="#555" />
        <Line top={1035} left={634} length={20} angle={1} color="#555" />
      </div>

      <div>
        <Line top={1310} left={614} length={20} angle={1} color="#555" />
        <Line top={1490} left={614} length={20} angle={1} color="#555" />
        <Line top={1310} left={634} length={181} angle={90} color="#555" />
        <Line top={1405} left={634} length={20} angle={1} color="#555" />
      </div>

      {/* 🧵 เส้นระหว่าง column3-4 */}
      <div>
        <Line top={295} left={845} length={20} angle={1} color="#555" />
        <Line top={665} left={845} length={20} angle={1} color="#555" />
        <Line top={295} left={865} length={372} angle={90} color="#555" />
        <Line top={495} left={865} length={22} angle={1} color="#555" />
      </div>

      <div>
        <Line top={1035} left={845} length={20} angle={1} color="#555" />
        <Line top={1405} left={845} length={20} angle={1} color="#555" />
        <Line top={1034} left={865} length={373} angle={90} color="#555" />
        <Line top={1235} left={865} length={22} angle={1} color="#555" />
      </div>

      {/* เส้นสุดท้าย */}
      <div>
        <Line top={495} left={1079} length={20} angle={1} color="#555" />
        <Line top={1235} left={1079} length={20} angle={1} color="#555" />
        <Line top={495} left={1099} length={741} angle={90} color="#555" />
        <Line top={830} left={1099} length={20} angle={1} color="#555" />
      </div>
    </div>
  );
}
