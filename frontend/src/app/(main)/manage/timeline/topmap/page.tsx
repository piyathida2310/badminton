"use client";

import { Bracket, Seed, SeedItem, SeedTeam, IRoundProps } from "react-brackets";

export default function TournamentBracket() {
  // ข้อมูลรอบการแข่งขัน
  const rounds: IRoundProps[] = [
    {
      title: "Round of 16",
      seeds: [
        { id: 1, teams: [{ name: "Smash Warriors", win: true }, { name: "Net Masters", win: false }] },
        { id: 2, teams: [{ name: "Speed Feathers", win: false }, { name: "Sky Smashers", win: true }] },
        { id: 3, teams: [{ name: "Clear Fighters", win: true }, { name: "Birdie Hunters", win: false }] },
        { id: 4, teams: [{ name: "Rapid Smash", win: true }, { name: "Golden Shuttle", win: false }] },
      ],
    },
    {
      title: "Quarter Finals",
      seeds: [
        { id: 5, teams: [{ name: "Smash Warriors", win: true }, { name: "Sky Smashers", win: false }] },
        { id: 6, teams: [{ name: "Clear Fighters", win: true }, { name: "Rapid Smash", win: false }] },
      ],
    },
    {
      title: "Semi Finals",
      seeds: [
        { id: 7, teams: [{ name: "Smash Warriors", win: true }, { name: "Clear Fighters", win: false }] },
      ],
    },
    {
      title: "Finals",
      seeds: [
        { id: 8, teams: [{ name: "Smash Warriors", win: true }, { name: "" }] },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#f9faf4] flex flex-col items-center py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-10 text-center">
        แผนผังการแข่งขัน Rank BG ประเภท เดี่ยว 16 ทีม (บน)
      </h1>

      {/* Container ที่จัดให้อยู่ตรงกลางจริง ๆ */}
      <div className="w-full flex justify-center">
        <div className="overflow-x-auto flex justify-center w-full max-w-[1100px] px-4">
          <div className="flex justify-center w-full">
            <Bracket
              rounds={rounds}
              renderSeedComponent={CustomSeed}
              swipeable={false}
            />
          </div>
        </div>
      </div>

      <button className="mt-10 bg-[#e5a100] hover:bg-[#d98c00] text-white font-semibold px-10 py-2 rounded shadow-md">
        ต่อไป
      </button>
    </main>
  );
}

/* -------------------- Custom Seed Component -------------------- */
function CustomSeed({ seed, breakpoint }: any) {
  const { teams } = seed;
  return (
    <Seed mobileBreakpoint={breakpoint}>
      <SeedItem className="bg-transparent border-none shadow-none">
        <div className="flex flex-col space-y-1">
          {teams.map((team: any, idx: number) => (
            <SeedTeam
              key={idx}
              className={`flex justify-between items-center w-48 px-3 py-1 text-sm rounded-full shadow-sm border ${
                team.win
                  ? "border-green-400 bg-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              <span>{team.name || "—"}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  team.win ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </SeedTeam>
          ))}
        </div>
      </SeedItem>
    </Seed>
  );
}
