"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/api";
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
  const [tournaments, setTournaments] = useState<{ id: number; title: string }[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [allResults, setAllResults] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "single" | "double">("all");
  const [selectedRank, setSelectedRank] = useState("all");
  const [availableRanks, setAvailableRanks] = useState<string[]>([]);
  const { t } = useLanguage();

  // 1. Fetch Tournament List
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/tournament?limit=100");
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
        const tRes = await api.get(`/tournament/${currentId}`);
        const tData = tRes.data.data;
        setTournamentName(tData.title || "รายการแข่งขัน");
        if (tData.rank) setAvailableRanks(tData.rank);

        // 🏆 1. Try to fetch Persisted Summary Data (Faster & Persistent)
        const sRes = await api.get(`/summary/${currentId}`);
        const summaryData: any[] = sRes.data.data || [];

        if (summaryData.length > 0) {
          console.log(`[Results Summary] Found ${summaryData.length} persisted records.`);

          const groupedMap = new Map<string, Match[]>();
          summaryData.forEach(item => {
            const reg = item.register;
            if (!reg) return;
            const rankKey = reg.playType || "BG";
            const isLower = item.position >= 4;
            const stageLabel = isLower ? "สายล่าง" : "สายบน";
            const groupKey = `${rankKey}-${stageLabel}`;

            if (!groupedMap.has(groupKey)) groupedMap.set(groupKey, []);

            // Adjust position label for Lower bracket
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

        // 🏆 2. Fallback: Dynamic Calculation from Matches (For existing data or pending results)
        console.log("[Results Summary] No persisted summary found. Falling back to dynamic calculation.");
        const bRes = await api.get(`/bracket-matches/${currentId}?all=true`);
        const allMatches: any[] = bRes.data.data || [];

        const groupedMap = new Map<string, any[]>();
        allMatches.forEach(m => {
          const ht = m.handType || "BG";
          if (!groupedMap.has(ht)) groupedMap.set(ht, []);
          groupedMap.get(ht)!.push(m);
        });

        const sections: SectionData[] = [];
        groupedMap.forEach((matches, rankKey) => {
          // --- UPPER BRACKET ---
          const upperMatches = matches.filter(m => m.stage !== 'LOWER');
          if (upperMatches.length > 0) {
            const podiumMatches: Match[] = [];
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
                title: `${rankKey} สายบน`,
                color: RANK_COLORS[rankKey] || "from-gray-100 to-slate-100",
                type: podiumMatches.some(m => m.player2) ? "double" : "single",
                matches: podiumMatches
              });
            }
          }

          // --- LOWER BRACKET ---
          const lowerMatches = matches.filter(m => m.stage === 'LOWER');
          if (lowerMatches.length > 0) {
            const podiumMatchesLower: Match[] = [];
            const maxLowerRound = Math.max(...lowerMatches.map(m => m.roundSequence || 0));

            const lowerFinal = lowerMatches.find(m => m.roundSequence === maxLowerRound && m.matchSequence === 1);

            if (lowerFinal) {
              const f = lowerFinal;
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
                  podiumMatchesLower.push({
                    position: "ชนะเลิศ", rank: "1st", code: `${rankKey}1ST`,
                    team: winner.teamName || winner.player1Name || "-",
                    player1: winner.player1Name || "-", player2: winner.player2Name,
                    shuttle: String(f.shuttle || 0)
                  });
                }
                if (runnerUp) {
                  podiumMatchesLower.push({
                    position: "รองชนะเลิศอันดับ 1", rank: "2nd", code: `${rankKey}2ND`,
                    team: runnerUp.teamName || runnerUp.player1Name || "-",
                    player1: runnerUp.player1Name || "-", player2: runnerUp.player2Name,
                    shuttle: String(f.shuttle || 0)
                  });
                }
              }
            }

            const semiLowerRound = Math.max(1, maxLowerRound - 1);
            const semiLowerMatches = lowerMatches.filter(m => m.roundSequence === semiLowerRound);
            semiLowerMatches.forEach((sm) => {
              const isSemiDone = sm.status === "FINISHED" || (sm.score1 !== null && sm.score2 !== null);
              if (isSemiDone) {
                let loser = null;
                if (sm.winnerId) {
                  loser = sm.winnerId == sm.player1Id ? sm.player2 : (sm.winnerId == sm.player2Id ? sm.player1 : null);
                } else if (sm.score1 !== null && sm.score2 !== null) {
                  loser = sm.score1 > sm.score2 ? sm.player2 : sm.player1;
                }
                if (loser) {
                  podiumMatchesLower.push({
                    position: `รองชนะเลิศอันดับ 2`, rank: "3rd", code: `${rankKey}3RD`,
                    team: loser.teamName || loser.player1Name || "-",
                    player1: loser.player1Name || "-", player2: loser.player2Name,
                    shuttle: String(sm.shuttle || 0)
                  });
                }
              }
            });

            if (podiumMatchesLower.length > 0) {
              sections.push({
                title: `${rankKey} สายล่าง`,
                color: RANK_COLORS[rankKey] || "from-gray-100 to-slate-100",
                type: podiumMatchesLower.some(m => m.player2) ? "double" : "single",
                matches: podiumMatchesLower
              });
            }
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
      <div className="min-h-screen flex items-center justify-center bg-[#2ED3B7]/5">
        <p className="text-[#194185] font-bold animate-pulse text-xl">{t('results.loading')}</p>
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
              <label htmlFor="competition-event" className="font-medium text-[#194185]">{t('manage.pageTitle')}:</label>
              <select
                id="competition-event"
                value={currentId}
                onChange={(e) => handleTournamentChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ED3B7] bg-white/80 backdrop-blur-sm"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="filter-type" className="font-medium text-[#194185]">{t('results.type')}</label>
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
              <label htmlFor="rank-filter" className="font-medium text-[#194185]">{t('results.rankType')}</label>
              <select
                id="rank-filter"
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ED3B7] bg-white/80 backdrop-blur-sm"
              >
                <option value="all">{t('results.all')}</option>
                {availableRanks.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[#2ED3B7] font-bold mt-2">
            {t('results.totalShuttle')}: {totalShuttles} ลูก
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 font-bold text-[#2ED3B7] animate-pulse">กำลังโหลดผลการแข่งขัน...</div>
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
  const { t } = useLanguage();
  const hasDouble = matches.some((m) => m.player2);

  const sortedMatches = [...matches].sort((a, b) => {
    const order = { "1st": 1, "2nd": 2, "3rd": 3 };
    return (order[a.rank as keyof typeof order] || 99) - (order[b.rank as keyof typeof order] || 99);
  });

  return (
    <section className={`rounded-2xl shadow-xl border border-[#2ED3B7]/20 bg-white overflow-hidden`}>
      <div className="bg-[#194185] py-3">
        <h2 className="text-center text-xl font-bold text-white tracking-wide">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-[#2ED3B7]/10 text-[#194185]">
            <tr className="border-b border-[#2ED3B7]/20">
              <th className="p-3 border-r border-[#2ED3B7]/20">{t('results.position')}</th>
              <th className="p-3 border-r border-[#2ED3B7]/20">{t('results.order')}</th>
              <th className="p-3 border-r border-[#2ED3B7]/20">{t('results.teamName')}</th>
              <th className="p-3 border-r border-[#2ED3B7]/20">{t('results.player1')}</th>
              {hasDouble && <th className="p-3 border-r border-[#2ED3B7]/20">{t('results.player2')}</th>}
              <th className="p-3">{t('results.shuttleUsed')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.map((m, i) => (
              <tr
                key={i}
                className={`border-t border-[#2ED3B7]/20 transition ${i % 2 === 0 ? "bg-white" : "bg-[#2ED3B7]/5"
                  } hover:bg-[#2ED3B7]/10`}
              >
                <td className="p-3 border-r border-[#2ED3B7]/20 font-bold text-[#194185]">{m.position}</td>
                <td className="p-3 border-r border-[#2ED3B7]/20 italic">{m.rank}</td>
                <td className="p-3 border-r border-[#2ED3B7]/20 text-[#194185] font-medium">{m.team}</td>
                <td className="p-3 border-r border-[#2ED3B7]/20">{m.player1}</td>
                {hasDouble && <td className="p-3 border-r border-[#2ED3B7]/20">{m.player2 || "-"}</td>}
                <td className="p-3">{m.shuttle || "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

