"use client";

import { useState, useEffect } from "react";
import api from "../../../../../../lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
  BG: "from-[#194185]/5 to-white",
  NB: "from-[#2ED3B7]/5 to-white",
  N: "from-[#194185]/10 to-white",
  S: "from-[#2ED3B7]/10 to-white",
  "P+": "from-[#194185]/15 to-white",
  "P-": "from-[#2ED3B7]/15 to-white",
};

export default function UserResultSummaryPage() {
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [tournamentName, setTournamentName] = useState("");
  const [allResults, setAllResults] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "single" | "double">("all");
  const [selectedRank, setSelectedRank] = useState("all");
  const [availableRanks, setAvailableRanks] = useState<string[]>([]);
  const { t } = useLanguage();

  // 1. Get Tournament ID from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem("selectedTournamentId");
    if (savedId) {
      setTournamentId(Number(savedId));
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Data for Selected Tournament
  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId) return;
      setLoading(true);
      try {
        const tRes = await api.get(`/api/tournament/${tournamentId}`);
        const tData = tRes.data.data;
        setTournamentName(tData.title || "รายการแข่งขัน");
        if (tData.rank) {
          if (Array.isArray(tData.rank)) {
            setAvailableRanks(tData.rank);
          } else if (typeof tData.rank === "string") {
            try {
              setAvailableRanks(JSON.parse(tData.rank));
            } catch (e) { }
          }
        }

        // 🏆 1. Try to fetch Persisted Summary Data
        const sRes = await api.get(`/api/summary/${tournamentId}`);
        const summaryData: any[] = sRes.data.data || [];

        if (summaryData.length > 0) {
          const groupedMap = new Map<string, Match[]>();
          summaryData.forEach(item => {
            const reg = item.register;
            if (!reg) return;
            const rankKey = reg.playType || "BG";
            const isLower = item.position >= 4;
            const stageLabel = isLower ? "สายล่าง" : "สายบน";
            const groupKey = `${rankKey}-${stageLabel}`;

            if (!groupedMap.has(groupKey)) groupedMap.set(groupKey, []);

            const posLabel = item.position === 1 || item.position === 4 ? "ชนะเลิศ" :
              item.position === 2 || item.position === 5 ? "รองชนะเลิศอันดับ 1" :
                "รองชนะเลิศอันดับ 2";

            const rankLabel = item.position === 1 || item.position === 4 ? "1st" :
              item.position === 2 || item.position === 5 ? "2nd" :
                "3rd";

            groupedMap.get(groupKey)!.push({
              position: posLabel,
              rank: rankLabel,
              code: `${rankKey}${item.position}`,
              team: reg.teamName || reg.player1Name || "-",
              player1: reg.player1Name || "-",
              player2: reg.player2Name,
              shuttle: String(item.shuttleUsed || 0)
            });
          });

          const sections: SectionData[] = [];
          groupedMap.forEach((matches, groupKey) => {
            const [rankKey, stageLabel] = groupKey.split("-");
            sections.push({
              title: `${rankKey} ${stageLabel}`,
              color: RANK_COLORS[rankKey] || "from-gray-100 to-slate-100",
              type: matches.some(m => m.player2) ? "double" : "single",
              matches: matches
            });
          });
          setAllResults(sections);
          setLoading(false);
          return;
        }

        // 🏆 2. Fallback: Dynamic Calculation from Matches
        const bRes = await api.get(`/api/bracket-matches/${tournamentId}?all=true`);
        const allMatches: any[] = bRes.data.data || [];

        const groupedMap = new Map<string, any[]>();
        allMatches.forEach(m => {
          const ht = m.handType || "BG";
          if (!groupedMap.has(ht)) groupedMap.set(ht, []);
          groupedMap.get(ht)!.push(m);
        });

        const sections: SectionData[] = [];
        groupedMap.forEach((matches, rankKey) => {
          const podiumMatches: Match[] = [];
          const upperMatches = matches.filter(m => m.stage !== 'LOWER');
          if (upperMatches.length === 0) return;

          const maxRound = Math.max(...upperMatches.map(m => m.roundSequence || 0));

          const finalCandidate =
            upperMatches.find(m => m.stage === 'GRAND_FINAL') ||
            upperMatches.find(m => m.roundSequence === maxRound && m.matchSequence === 1);

          if (finalCandidate) {
            const f = finalCandidate;
            const isDone = f.status === "FINISHED" || (f.score1 !== null && f.score2 !== null);
            if (isDone) {
              let winner = null, runnerUp = null;
              if (f.winner) {
                winner = f.winner;
                runnerUp = (f.winnerId == f.player1Id) ? f.player2 : f.player1;
              } else if (f.winnerId) {
                if (f.winnerId == f.player1Id) { winner = f.player1; runnerUp = f.player2; }
                else if (f.winnerId == f.player2Id) { winner = f.player2; runnerUp = f.player1; }
              } else if (f.score1 !== null && f.score2 !== null) {
                if (f.score1 > f.score2) { winner = f.player1; runnerUp = f.player2; }
                else if (f.score2 > f.score1) { winner = f.player2; runnerUp = f.player1; }
              }

              if (winner) {
                podiumMatches.push({
                  position: "ชนะเลิศ", rank: "1st", code: `${rankKey}1ST`,
                  team: winner.teamName || winner.player1Name || "-",
                  player1: winner.player1Name || "-", player2: winner.player2Name,
                  shuttle: String(f.shuttle || 0)
                });
              }
              if (runnerUp) {
                podiumMatches.push({
                  position: "รองชนะเลิศอันดับ 1", rank: "2nd", code: `${rankKey}2ND`,
                  team: runnerUp.teamName || runnerUp.player1Name || "-",
                  player1: runnerUp.player1Name || "-", player2: runnerUp.player2Name,
                  shuttle: String(f.shuttle || 0)
                });
              }
            }
          }

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
                  position: `รองชนะเลิศอันดับ 2`, rank: "3rd", code: `${rankKey}3RD`,
                  team: loser.teamName || loser.player1Name || "-",
                  player1: loser.player1Name || "-", player2: loser.player2Name,
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
        });

        setAllResults(sections);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  let filteredResults = allResults;
  if (filterType !== "all") filteredResults = filteredResults.filter(s => s.type === filterType);
  if (selectedRank !== "all") filteredResults = filteredResults.filter(s => s.title.startsWith(selectedRank));

  const totalShuttles = filteredResults.reduce((sum, section) => {
    return sum + section.matches.reduce((acc, m) => acc + (parseInt(m.shuttle || "0") || 0), 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#194185] font-bold animate-pulse text-xl">{t('results.loading')}</p>
      </div>
    );
  }

  if (!tournamentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 font-bold text-xl">{t('results.selectFirst')}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2ED3B7]/10 via-white to-white px-4 sm:px-8 md:px-16 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#194185] tracking-tight drop-shadow-md">
          🏆 {t('results.pageTitle')}
        </h1>

        <div className="mt-4 text-gray-700 leading-relaxed space-y-1">

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="filter-type" className="font-medium text-gray-800">{t('results.type')}</label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ED3B7] bg-white/80 backdrop-blur-sm"
              >
                <option value="all">{t('results.all')}</option>
                <option value="double">{t('results.double')}</option>
                <option value="single">{t('results.single')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="rank-filter" className="font-medium text-gray-800">{t('results.rankType')}</label>
              <select
                id="rank-filter"
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ED3B7] bg-white/80 backdrop-blur-sm"
              >
                <option value="all">ทั้งหมด</option>
                {availableRanks.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[#194185] font-semibold mt-2">
            {t('results.totalShuttle')}: {totalShuttles} ลูก
          </p>
        </div>
      </div>

      {filteredResults.length > 0 ? (
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
        <div className="flex flex-col items-center justify-center py-10 mt-10">
          <img
            src="/images/sum.png"
            alt="No Results Data"
            className="w-64 h-64 md:w-80 md:h-80 object-contain"
          />
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
    <section className={`rounded-2xl shadow-xl border border-[#194185]/10 bg-gradient-to-b ${color} overflow-hidden`}>
      <div className="bg-[#194185] py-3 border-b border-[#194185]/20">
        <h2 className="text-center text-xl font-bold text-white tracking-wide drop-shadow-sm">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-[#194185]/5 text-[#194185] font-bold">
            <tr className="border-b border-[#194185]/10">
              <th className="p-3 border-r border-[#194185]/10">ตำแหน่ง</th>
              <th className="p-3 border-r border-[#194185]/10">ลำดับ</th>
              <th className="p-3 border-r border-[#194185]/10">ชื่อทีม</th>
              <th className="p-3 border-r border-[#194185]/10">ผู้เล่น 1</th>
              {hasDouble && <th className="p-3 border-r border-[#194185]/10">ผู้เล่น 2</th>}
              <th className="p-3">ลูกใช้</th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.map((m, i) => (
              <tr
                key={i}
                className={`border-t border-[#194185]/10 transition ${i % 2 === 0 ? "bg-white/80" : "bg-[#2ED3B7]/5"
                  } hover:bg-[#2ED3B7]/10`}
              >
                <td className="p-3 border-r border-[#194185]/10 font-bold text-[#194185]">{m.position}</td>
                <td className="p-3 border-r border-[#194185]/10 italic">{m.rank}</td>
                <td className="p-3 border-r border-[#194185]/10 text-[#194185] font-medium">{m.team}</td>
                <td className="p-3 border-r border-[#194185]/10">{m.player1}</td>
                {hasDouble && <td className="p-3 border-r border-[#194185]/10">{m.player2 || "-"}</td>}
                <td className="p-3">{m.shuttle || "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
