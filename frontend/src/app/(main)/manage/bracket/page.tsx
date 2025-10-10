"use client";

import { Bracket, Seed, SeedItem, SeedTeam, IRoundProps } from "react-brackets";

export default function TournamentBracket() {
  const teamCount = 12; // 👈 เปลี่ยนจำนวนทีมได้ (12, 24, 32)
  const { upperRounds, lowerRounds } = generateDoubleElimination(teamCount);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-[#F0F4FF] flex flex-col items-center py-10">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-10 text-center drop-shadow-sm">
        🏸 แผนผังการแข่งขันประเภทเดี่ยว {teamCount} ทีม
      </h1>

      {/*  สายบน  */}
      <section className="w-full flex flex-col items-center mb-16">
        <h2 className="text-lg md:text-xl font-semibold text-blue-600 mb-4">
          🏆 สายบน (Upper Bracket)
        </h2>
        <div
          className="flex justify-center w-full max-w-[1200px]"
          style={{
            transform: "scale(0.8)",
            transformOrigin: "top center",
          }}
        >
          <Bracket
            rounds={upperRounds}
            renderSeedComponent={(props) => <CustomSeed {...props} type="upper" />}
            swipeable={false}
          />
        </div>
      </section>

      {/*  สายล่าง  */}
      <section className="w-full flex flex-col items-center">
        <h2 className="text-lg md:text-xl font-semibold text-amber-600 mb-4">
          🔄 สายล่าง (Lower Bracket)
        </h2>
        <div
          className="flex justify-center w-full max-w-[1200px]"
          style={{
            transform: "scale(0.8)",
            transformOrigin: "top center",
          }}
        >
          <Bracket
            rounds={lowerRounds}
            renderSeedComponent={(props) => <CustomSeed {...props} type="lower" />}
            swipeable={false}
          />
        </div>
      </section>

      <button className="mt-12 bg-gradient-to-r from-blue-600 to-amber-400 hover:opacity-90 text-white font-bold px-10 py-2 rounded-full shadow-md transition-all">
        ต่อไป
      </button>
    </main>
  );
}

/* -------------------- Custom Seed Component -------------------- */
function CustomSeed({ seed, breakpoint, type }: any) {
  const { teams } = seed;

  return (
    <Seed mobileBreakpoint={breakpoint}>
      <SeedItem className="bg-transparent border-none shadow-none">
        <div className="flex flex-col space-y-1">
          {teams.map((team: any, idx: number) => {
            const isWinner = team.win;
            const colorScheme =
              type === "upper"
                ? isWinner
                  ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  : "border-blue-300"
                : isWinner
                  ? "border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                  : "border-gray-300";

            return (
              <SeedTeam
                key={idx}
                className={`flex justify-between items-center w-48 px-3 py-1 text-sm md:text-base rounded-full border ${colorScheme} bg-white transition-all duration-200`}
              >
                <span className="text-gray-900 font-semibold truncate">
                  {team.name || "—"}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isWinner ? "bg-amber-400" : "bg-gray-300"
                  }`}
                />
              </SeedTeam>
            );
          })}
        </div>
      </SeedItem>
    </Seed>
  );
}

/*   Mock ทีมสายบน-ล่าง */
function generateDoubleElimination(teamCount: number) {
  const mockNames = [
    "Smash Warriors", "Sky Smashers", "Birdie Blazers",
    "Shuttle Kings", "Clear Fighters", "Feather Force", "Rapid Smash",
    "Golden Shuttle", "Racket Raiders", "Power Drops", "Net Ninjas",
    "Spin Serves", "Ace Hunters", "Court Crushers", "Lightning Birds",
    "Speed Feathers", "Fire Flickers", "Air Smashers", "Drop Dominators",
    "Backhand Bandits", "Rally Riders", "Birdie Breakers", "Net Stormers",
    "Clear Commanders", "Ace Angels", "Shuttle Snipers", "Winged Warriors",
    "Blazing Birds", "Strike Hawks", "Feathered Fury", "Racket Rockets",
  ];

  const teams = Array.from({ length: teamCount }, (_, i) => ({
    name: mockNames[i % mockNames.length],
  }));

  /* ---------------- สายบน ---------------- */
  const upperRounds: IRoundProps[] = [];
  let currentTeams = [...teams];
  let roundNum = 1;

  while (currentTeams.length > 1) {
    const nextRound: any[] = [];
    const seeds = [];

    for (let i = 0; i < currentTeams.length; i += 2) {
      const teamA = currentTeams[i];
      const teamB = currentTeams[i + 1];
      if (!teamB) {
        seeds.push({
          id: i / 2 + 1,
          teams: [{ name: teamA.name, win: true }, { name: "BYE", win: false }],
        });
        nextRound.push(teamA);
      } else {
        const winner = Math.random() > 0.5 ? teamA : teamB;
        seeds.push({
          id: i / 2 + 1,
          teams: [
            { name: teamA.name, win: winner === teamA },
            { name: teamB.name, win: winner === teamB },
          ],
        });
        nextRound.push(winner);
      }
    }

    upperRounds.push({
      title:
        currentTeams.length === 2
          ? "Finals"
          : currentTeams.length === 4
          ? "Semi Finals"
          : `Round ${roundNum}`,
      seeds,
    });

    currentTeams = nextRound;
    roundNum++;
  }

  /* ---------------- สายล่าง ---------------- */
  const lowerTeams = teams.slice(0, Math.ceil(teamCount / 2));
  const lowerRounds: IRoundProps[] = [];
  let lowerCurrent = lowerTeams;
  let lowerRoundNum = 1;

  while (lowerCurrent.length > 1) {
    const next: any[] = [];
    const seeds = [];

    for (let i = 0; i < lowerCurrent.length; i += 2) {
      const teamA = lowerCurrent[i];
      const teamB = lowerCurrent[i + 1];

      if (!teamB) {
        seeds.push({
          id: i / 2 + 1,
          teams: [{ name: teamA.name, win: true }, { name: "BYE", win: false }],
        });
        next.push(teamA);
      } else {
        const winner = Math.random() > 0.5 ? teamA : teamB;
        seeds.push({
          id: i / 2 + 1,
          teams: [
            { name: teamA.name, win: winner === teamA },
            { name: teamB.name, win: winner === teamB },
          ],
        });
        next.push(winner);
      }
    }

    lowerRounds.push({
      title:
        lowerCurrent.length === 2
          ? "Lower Finals"
          : lowerCurrent.length === 4
          ? "Lower Semi Finals"
          : `Lower Round ${lowerRoundNum}`,
      seeds,
    });

    lowerCurrent = next;
    lowerRoundNum++;
  }

  return { upperRounds, lowerRounds };
}
