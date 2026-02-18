"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/api";

/* โครงสร้างข้อมูล */
interface Match {
  position: string;
  rank: string;
  code: string;
  team: string;
  player1: string;
  player2?: string;
  shuttle?: string;
}

interface SectionData {
  title: string;
  color: string;
  type: "single" | "double";
  matches: Match[];
}

const RANK_COLORS: Record<string, string> = {
  BG: "from-purple-100 to-pink-100",
  NB: "from-pink-100 to-rose-100",
  N: "from-orange-100 to-pink-100",
  S: "from-sky-100 to-indigo-100",
  "P+": "from-green-100 to-emerald-100",
  "P-": "from-amber-100 to-yellow-100",
};

export default function ResultSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const initialTournamentId = Number(unwrappedParams.id);

  const [currentId, setCurrentId] = useState(initialTournamentId);
  const [tournaments, setTournaments] = useState<{ id: number; name: string }[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [allResults, setAllResults] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "single" | "double">("all");
  const [selectedRank, setSelectedRank] = useState("all");
  const [availableRanks, setAvailableRanks] = useState<string[]>([]);

  // 1. Fetch Tournament List
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/api/tournament");
        setTournaments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch tournaments", err);
      }
    };
    fetchTournaments();
  }, []);

  // 2. Fetch Data for Selected Tournament
  useEffect(() => {
    const fetchData = async () => {
      if (!currentId) return;
      setLoading(true);
      try {
        const tRes = await api.get(`/api/tournament/${currentId}`);
        const tData = tRes.data.data;
        setTournamentName(tData.name || "รายการแข่งขัน");
        if (tData.rank) setAvailableRanks(tData.rank);

        // Fetch ALL matches across all ranks
        const bRes = await api.get(`/api/bracket-matches/${currentId}?all=true`);
        const allMatches: any[] = bRes.data.data || [];
        console.log(`[Results DEBUG] Tournament ID: ${currentId}, Matches Count: ${allMatches.length}`);

        const groupedMap = new Map<string, any[]>();
        allMatches.forEach(m => {
          const ht = m.handType || "BG";
          if (!groupedMap.has(ht)) groupedMap.set(ht, []);
          groupedMap.get(ht)!.push(m);
        });

        const sections: SectionData[] = [];

        groupedMap.forEach((matches, rankKey) => {
          console.group(`[Results DEBUG] Processing Rank: ${rankKey}`);
          const podiumMatches: Match[] = [];

          // 🏆 สำคัญมาก: ต้องแยกสายบน (UPPER/GRAND_FINAL) ออกจากสายล่าง (LOWER) 
          // เพราะเลขรอบ (RoundSequence) อาจจะซ้ำกันได้ครับ
          const upperMatches = matches.filter(m => m.stage !== 'LOWER');

          if (upperMatches.length === 0) {
            console.warn(`No upper matches found for ${rankKey}`);
            console.groupEnd();
            return;
          }

          const maxRound = Math.max(...upperMatches.map(m => m.roundSequence || 0));
          console.log(`Max Upper Round detected: ${maxRound}`);

          // 🏆 1. หาแมตช์รอบชิง (Final) ในสายบน/Grand Final เท่านั้น
          const finalCandidate =
            upperMatches.find(m => m.stage === 'GRAND_FINAL') ||
            upperMatches.find(m => m.roundSequence === maxRound && m.matchSequence === 1);

          if (finalCandidate) {
            const f = finalCandidate;
            console.log(`Found Final candidate: ID=${f.id}, Stage=${f.stage}, Score=${f.score1}-${f.score2}`, f);

            // ตรวจสอบว่าแมตช์ต้องจบแล้ว (Status เป็น FINISHED หรือมีคะแนนลงไว้ทั้งสองฝั่ง)
            const isDone = f.status === "FINISHED" || (f.score1 !== null && f.score2 !== null);

            if (isDone) {
              let winner = null, runnerUp = null;

              // 1. ลองดึงจาก winner object โดยตรง (Backend ส่งมาให้แล้ว)
              if (f.winner) {
                winner = f.winner;
                runnerUp = (f.winnerId == f.player1Id) ? f.player2 : f.player1;
                console.log("Winner identified from winner object");
              }
              // 2. ถ้า winner object ไม่มี ลองดึงจาก winnerId
              else if (f.winnerId) {
                if (f.winnerId == f.player1Id) {
                  winner = f.player1; runnerUp = f.player2;
                } else if (f.winnerId == f.player2Id) {
                  winner = f.player2; runnerUp = f.player1;
                }
                console.log("Winner identified from winnerId");
              }
              // 3. ถ้าไม่มีทั้งคู่ ลองคำนวณจากคะแนน (Visual Consensus)
              else if (f.score1 !== null && f.score2 !== null) {
                if (f.score1 > f.score2) {
                  winner = f.player1; runnerUp = f.player2;
                } else if (f.score2 > f.score1) {
                  winner = f.player2; runnerUp = f.player1;
                }
                console.log("Winner identified from Score fallback");
              }

              if (winner) {
                podiumMatches.push({
                  position: "ชนะเลิศ",
                  rank: "1st",
                  code: `${rankKey}1ST`,
                  team: winner.teamName || winner.player1Name || "-",
                  player1: winner.player1Name || "-",
                  player2: winner.player2Name,
                  shuttle: String(f.shuttle || 0)
                });
              }

              if (runnerUp) {
                podiumMatches.push({
                  position: "รองชนะเลิศอันดับ 1",
                  rank: "2nd",
                  code: `${rankKey}2ND`,
                  team: runnerUp.teamName || runnerUp.player1Name || "-",
                  player1: runnerUp.player1Name || "-",
                  player2: runnerUp.player2Name,
                  shuttle: String(f.shuttle || 0)
                });
              }
            } else {
              console.log("Final candidate found but not done yet (No score or not FINISHED)");
            }
          }

          // 🏆 2. หาแมตช์รองชนะเลิศอันดับ 2 (3rd Place)
          // คือผู้แพ้จากรอบรองชนะเลิศ (Semi-Final) ในสายบน
          const semiRound = Math.max(1, maxRound - 1);
          const semis = upperMatches.filter(m => m.roundSequence === semiRound);

          semis.forEach((sm) => {
            const isSemiDone = sm.status === "FINISHED" || (sm.score1 !== null && sm.score2 !== null);
            if (isSemiDone) {
              let loser = null;
              if (sm.winnerId) {
                loser = sm.winnerId == sm.player1Id ? sm.player2 : (sm.winnerId == sm.player2Id ? sm.player1 : null);
              } else if (sm.score1 !== null && sm.score2 !== null) {
                loser = sm.score1 > sm.score2 ? sm.player2 : sm.player1;
              }

              if (loser) {
                podiumMatches.push({
                  position: `รองชนะเลิศอันดับ 2`,
                  rank: "3rd",
                  code: `${rankKey}3RD`,
                  team: loser.teamName || loser.player1Name || "-",
                  player1: loser.player1Name || "-",
                  player2: loser.player2Name,
                  shuttle: String(sm.shuttle || 0)
                });
              }
            }
          });

          if (podiumMatches.length > 0) {
            sections.push({
              title: `${rankKey} สรุปผลการแข่งขัน`,
              color: RANK_COLORS[rankKey] || "from-gray-100 to-slate-100",
              type: podiumMatches.some(m => m.player2) ? "double" : "single",
              matches: podiumMatches
            });
          }
          console.groupEnd();
        });

        setAllResults(sections);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentId]);

  let filteredResults = allResults;
  if (filterType !== "all") filteredResults = filteredResults.filter(s => s.type === filterType);
  if (selectedRank !== "all") filteredResults = filteredResults.filter(s => s.title.startsWith(selectedRank));

  const totalShuttles = filteredResults.reduce((sum, section) => {
    return sum + section.matches.reduce((acc, m) => acc + (parseInt(m.shuttle || "0") || 0), 0);
  }, 0);

  const handleTournamentChange = (id: number) => {
    setCurrentId(id);
    router.push(`/manage/${id}/results-competition`);
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-pink-500 font-bold animate-pulse text-xl">กำลังดึงข้อมูล...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 px-4 sm:px-8 md:px-16 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-pink-500 tracking-tight drop-shadow-md">
          🏆 สรุปผลการแข่งขัน
        </h1>

        <div className="mt-4 text-gray-700 leading-relaxed space-y-1">
          <p className="font-semibold text-lg text-gray-800">{tournamentName}</p>
          <p>รายการแข่งขันแบดมินตัน</p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="competition-event" className="font-medium text-gray-800">รายการแข่งขัน:</label>
              <select
                id="competition-event"
                value={currentId}
                onChange={(e) => handleTournamentChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="filter-type" className="font-medium text-gray-800">ประเภท:</label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="double">ประเภทคู่</option>
                <option value="single">ประเภทเดี่ยว</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="rank-filter" className="font-medium text-gray-800">มือ:</label>
              <select
                id="rank-filter"
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">ทั้งหมด</option>
                {availableRanks.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-pink-600 font-semibold mt-2">
            สรุปลูกที่ใช้รวมทั้งหมด: {totalShuttles} ลูก
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 font-bold text-pink-400 animate-pulse">กำลังโหลดผลการแข่งขัน...</div>
      ) : filteredResults.length > 0 ? (
        <div className="space-y-14">
          {filteredResults.map((section, index) => (
            <Section
              key={`${section.title}-${index}`}
              title={section.title}
              color={section.color}
              matches={section.matches}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-10 p-10 bg-white/50 rounded-2xl border border-dashed border-gray-300">
          <p>📅 ยังไม่มีผลการแข่งขันที่สรุปได้ในขณะนี้</p>
          <p className="text-sm mt-2">ต้องกรอกคะแนนในรอบรองชนะเลิศหรือรอบชิงชนะเลิศ เพื่อให้อันดับแสดงผลครับ</p>
        </div>
      )}
    </main>
  );
}

function Section({ title, color, matches }: { title: string; color: string; matches: Match[] }) {
  const hasDouble = matches.some((m) => m.player2);

  const sortedMatches = [...matches].sort((a, b) => {
    const order = { "1st": 1, "2nd": 2, "3rd": 3 };
    return (order[a.rank as keyof typeof order] || 99) - (order[b.rank as keyof typeof order] || 99);
  });

  return (
    <section className={`rounded-2xl shadow-xl border border-pink-100 bg-gradient-to-b ${color} overflow-hidden`}>
      <div className="bg-gradient-to-r from-pink-200 via-pink-100 to-rose-100 py-3 border-b border-pink-200">
        <h2 className="text-center text-xl font-bold text-pink-600 tracking-wide drop-shadow-sm">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-gradient-to-r from-pink-100 via-rose-50 to-purple-50">
            <tr className="border-b border-pink-200">
              <th className="p-3 border-r border-pink-200">ตำแหน่ง</th>
              <th className="p-3 border-r border-pink-200">ลำดับ</th>
              <th className="p-3 border-r border-pink-200">ชื่อทีม</th>
              <th className="p-3 border-r border-pink-200">ผู้เล่น 1</th>
              {hasDouble && <th className="p-3 border-r border-pink-200">ผู้เล่น 2</th>}
              <th className="p-3">ลูกใช้</th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.map((m, i) => (
              <tr
                key={i}
                className={`border-t border-pink-100 transition ${i % 2 === 0 ? "bg-white/80" : "bg-pink-50/70"
                  } hover:bg-rose-100/70`}
              >
                <td className="p-3 border-r border-pink-100 font-bold text-pink-600">{m.position}</td>
                <td className="p-3 border-r border-pink-100 italic">{m.rank}</td>
                <td className="p-3 border-r border-pink-100 text-rose-700 font-medium">{m.team}</td>
                <td className="p-3 border-r border-pink-100">{m.player1}</td>
                {hasDouble && <td className="p-3 border-r border-pink-100">{m.player2 || "-"}</td>}
                <td className="p-3">{m.shuttle || "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
