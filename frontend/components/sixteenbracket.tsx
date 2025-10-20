"use client";

import React from "react";
import Link from "next/link";

//  เส้นที่ปรับองศา/ความยาวได้ง่าย
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

export default function SixteenBracket({ level }: SixteenBracketProps) {
  return (
    <div className="h-full w-[1265px] overflow-x-auto bg-[#f9f9f0] flex flex-col items-center py-10 relative scrollbar-hide">
       <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🏸 แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 16 ทีม ({level})
      </h1>
      {/* Header */}
      <div className="flex justify-between w-[80%] mb-6 text-sm text-gray-700 font-medium">
        <div className="w-1/4 text-center">Round of 16</div>
        <div className="w-1/4 text-center">Round of 8</div>
        <div className="w-1/4 text-center">Semi - Finals</div>
        <div className="w-1/4 text-center">Finals</div>
      </div>

      {/* Bracket Container */}
      <div className="flex justify-center gap-10 w-full px-10">
        {/* Column 1 */}
        <div className="flex flex-col justify-between h-[600px]">
          {[
            ["Smash Warriors", true],
            ["Net Masters", false],
            ["Speed Feathers", false],
            ["Sky Smashers", true],
            ["Clear Fighters", true],
            ["Birdie Hunters", false],
            ["Rapid Smash", true],
            ["Golden Shuttle", false],
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

        {/* Column 2 */}
        <div className="flex flex-col justify-between h-[520px] mt-10">
          {[
            ["Smash Warriors", true],
            ["Sky Smashers", false],
            ["Clear Fighters", true],
            ["Rapid Smash", false],
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

        {/* Column 3 */}
        <div className="flex flex-col justify-between h-[360px] mt-30">
          {[
            ["Smash Warriors", true],
            ["Clear Fighters", false],
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

        {/* Column 4 */}
        <div className="flex flex-col justify-center h-[300px] mt-35">
          <div className="flex items-center justify-between w-48 border rounded-md bg-white shadow-sm px-3 py-1">
            <span className="text-sm font-medium text-gray-800">
              Smash Warriors
            </span>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          </div>
        </div>
      </div>

      {/*  เส้นเชื่อมแบบปรับได้ 1*/}
      <div>
        <Line top={175} left={380} length={20} angle={1} color="#555" />
        <Line top={255} left={380} length={20} angle={1} color="#555" />
        <Line top={175} left={400} length={81} angle={90} color="#555" />
        <Line top={215} left={400} length={21} angle={1} color="#555" />
      </div>

      {/*  เส้นเชื่อมแบบปรับได้ 2*/}
      <div>
        <Line top={335} left={380} length={20} angle={1} color="#555" />
        <Line top={420} left={380} length={20} angle={1} color="#555" />
        <Line top={335} left={400} length={86} angle={90} color="#555" />
        <Line top={380} left={400} length={21} angle={1} color="#555" />
      </div>
      
      <div>
        <Line top={500} left={380} length={20} angle={1} color="#555" />
        <Line top={580} left={380} length={20} angle={1} color="#555" />
        <Line top={500} left={400} length={82} angle={90} color="#555" />
        <Line top={540} left={400} length={21} angle={1} color="#555" />
      </div>

      <div>
        <Line top={665} left={380} length={20} angle={1} color="#555" />
        <Line top={745} left={380} length={20} angle={1} color="#555" />
        <Line top={665} left={400} length={81} angle={90} color="#555" />
        <Line top={705} left={400} length={21} angle={1} color="#555" />
      </div>

      {/* เส้นของ column2-3*/}    
      <div>
        <Line top={215} left={613} length={20} angle={1} color="#555" />
        <Line top={380} left={613} length={20} angle={1} color="#555" />
        <Line top={215} left={632} length={165} angle={90} color="#555" />
        <Line top={295} left={630} length={23} angle={1} color="#555" />
      </div>
      
      <div>
        <Line top={540} left={613} length={20} angle={1} color="#555" />
        <Line top={705} left={613} length={20} angle={1} color="#555" />
        <Line top={540} left={632} length={166} angle={90} color="#555" />
        <Line top={625} left={630} length={23} angle={1} color="#555" />
      </div>

      {/* เส้นของ column3-4*/}    
      <div>
        <Line top={295} left={845} length={20} angle={1} color="#555" />
        <Line top={625} left={845} length={20} angle={1} color="#555" />
        <Line top={295} left={865} length={330} angle={90} color="#555" />
        <Line top={450} left={865} length={20} angle={1} color="#555" />
      </div>
      {/* Button Next */}
      {/* <Link
        href="/manage/bracket/lowmatch"
        className="absolute bottom-10 right-10 bg-amber-500 text-white font-medium rounded-md px-6 py-2 hover:bg-amber-600 transition"
      >
        ถัดไป
      </Link> */}

    </div>
  );
}
