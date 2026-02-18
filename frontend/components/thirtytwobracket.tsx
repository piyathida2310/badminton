"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "../src/lib/api";
import html2canvas from "html2canvas";
import { Download, Save, X, Edit } from "lucide-react"; // Added Shuttle icon if available, else use generic

// --- Types ---
interface Team {
  id?: number; // Added ID for DB linking
  code: string;
  name: string;
  players: string;
}

interface MatchNode {
  id: number;
  dbId?: number; // Added DB ID
  t1?: Team;
  t2?: Team;
  scores?: {
    totalA: number;
    totalB: number;
    set1A: number;
    set1B: number;
    set2A: number;
    set2B: number;
    set3A: number;
    set3B: number;
  };
  shuttlesUsed?: number;
  winnerCode?: string;
}

interface ThirtyTwoBracketProps {
  level: string;
  tournamentId?: number;
  rank?: string;
  ranks?: string[];
  onRankChange?: (rank: string) => void;
  isOrganizer?: boolean;
}

// --- Helper Components ---

// 1. Simplified Match Card
const MatchCard = ({
  matchId,
  match,
  matchNumber,
  onClick,
  isOrganizer,
}: {
  matchId: number;
  match?: MatchNode;
  matchNumber?: number;
  onClick: () => void;
  isOrganizer?: boolean;
}) => {
  const t1 = match?.t1;
  const t2 = match?.t2;
  const scores = match?.scores;

  const hasScore = scores && (scores.totalA > 0 || scores.totalB > 0 || scores.set1A > 0 || scores.set1B > 0);

  // Determine winner for styling
  let winner = null;
  if (scores) {
    let s1Wins = 0, s2Wins = 0;
    if (scores.set1A > scores.set1B) s1Wins++; else if (scores.set1B > scores.set1A) s2Wins++;
    if (scores.set2A > scores.set2B) s1Wins++; else if (scores.set2B > scores.set2A) s2Wins++;
    if (scores.set3A > scores.set3B) s1Wins++; else if (scores.set3B > scores.set3A) s2Wins++;

    if (s1Wins >= 2) winner = 'A';
    else if (s2Wins >= 2) winner = 'B';

    // Fallback to total score if sets are even or empty
    if (!winner && scores.totalA !== undefined && scores.totalB !== undefined) {
      if (scores.totalA > scores.totalB) winner = 'A';
      else if (scores.totalB > scores.totalA) winner = 'B';
    }
  }

  // Helper to extract first name
  const getFirstName = (players?: string) => players ? players.split(" ")[0].split("/")[0] : "-"; // Simple split, customize as needed

  return (
    <div
      onClick={isOrganizer ? onClick : undefined}
      className={`relative w-[300px] rounded-xl shadow-md border overflow-hidden group transition-all 
                 ${isOrganizer ? "hover:shadow-xl hover:scale-105 cursor-pointer" : "cursor-default"}`}
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#cbd5e1", // slate-300
        borderWidth: "1px",
      }}
    >
      {/* Header / Match Info */}
      < div
        className="flex justify-between items-center px-3 py-1 border-b"
        style={{ backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }} // slate-100, slate-200
      >
        <span className="text-[10px] font-bold" style={{ color: "#64748b" }}>Match #{matchNumber}</span>
        {
          match?.shuttlesUsed ? (
            <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: "#475569" }}>
              🏸 {match.shuttlesUsed}
            </span>
          ) : null
        }
      </div >

      <div className="p-2 flex flex-col gap-2"> {/* Increased gap from 1 to 2 */}
        {/* Team A */}
        <div className="flex justify-between items-center p-1 rounded" style={{ backgroundColor: winner === 'A' ? "#fef9c3" : "transparent" }}>
          <div className="flex flex-col flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1"> {/* Added mb-1 */}
              <span className="text-[10px] font-bold px-1 rounded w-8 text-center shrink-0 leading-normal" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>
                {t1?.code || "-"}
              </span>
              <span className="text-[11px] font-semibold truncate leading-normal" style={{ color: "#1e293b" }}>
                {t1?.name || "-"}
              </span>
            </div>
            {/* Adjusted padding and added Line Height */}
            <span className="text-[9px] block pl-10 truncate leading-relaxed" style={{ color: "#64748b", marginTop: "2px" }}>
              {t1?.players || "Waiting..."}
            </span>
          </div>
          {hasScore && (
            <div className="font-bold text-lg shrink-0 leading-none" style={{ color: "#1e293b" }}>
              {scores?.totalA ?? 0}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full" style={{ backgroundColor: "#f1f5f9" }} />

        {/* Team B */}
        <div className="flex justify-between items-center p-1 rounded" style={{ backgroundColor: winner === 'B' ? "#fef9c3" : "transparent" }}>
          <div className="flex flex-col flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1"> {/* Added mb-1 */}
              <span className="text-[10px] font-bold px-1 rounded w-8 text-center shrink-0 leading-normal" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>
                {t2?.code || "-"}
              </span>
              <span className="text-[11px] font-semibold truncate leading-normal" style={{ color: "#1e293b" }}>
                {t2?.name || "-"}
              </span>
            </div>
            <span className="text-[9px] block pl-10 truncate leading-relaxed" style={{ color: "#64748b", marginTop: "2px" }}>
              {t2?.players || "Waiting..."}
            </span>
          </div>
          {hasScore && (
            <div className="font-bold text-lg shrink-0 leading-none" style={{ color: "#1e293b" }}>
              {scores?.totalB ?? 0}
            </div>
          )}
        </div>
      </div>

      {/* Hover Overlay Hint */}
      {
        isOrganizer && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
            <span className="text-xs px-2 py-1 rounded shadow font-medium" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#334155" }}>Click to Edit Score</span>
          </div>
        )
      }
    </div >
  );
};

// 2. Score Entry Modal
const ScoreModal = ({
  isOpen,
  onClose,
  match,
  matchNumber,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  match?: MatchNode;
  matchNumber?: number;
  onSave: (matchId: number, scores: any, shuttles: number) => void;
}) => {
  const [scores, setScores] = useState({
    totalA: 0, totalB: 0,
    set1A: 0, set1B: 0,
    set2A: 0, set2B: 0,
    set3A: 0, set3B: 0,
  });
  const [shuttles, setShuttles] = useState(0);

  useEffect(() => {
    if (isOpen && match) {
      setScores({
        totalA: match.scores?.totalA ?? 0,
        totalB: match.scores?.totalB ?? 0,
        set1A: match.scores?.set1A ?? 0,
        set1B: match.scores?.set1B ?? 0,
        set2A: match.scores?.set2A ?? 0,
        set2B: match.scores?.set2B ?? 0,
        set3A: match.scores?.set3A ?? 0,
        set3B: match.scores?.set3B ?? 0,
      });
      setShuttles(match.shuttlesUsed ?? 0);
    }
  }, [isOpen, match]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value || /^\d*$/.test(value)) {
      setScores((prev) => ({ ...prev, [name]: value === "" ? 0 : parseInt(value) }));
    }
  };

  const handleSave = () => {
    if (match) {
      onSave(match.id, scores, shuttles);
      onClose();
    }
  };

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Match #{matchNumber} Scoreboard
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Teams Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-center w-1/3">
              <div className="font-bold text-center text-slate-800 text-sm">{match.t1?.name || "Team A"}</div>
              <div className="text-xs text-slate-500 text-center">{match.t1?.code}</div>
            </div>
            <div className="font-black text-2xl text-slate-300">VS</div>
            <div className="flex flex-col items-center w-1/3">
              <div className="font-bold text-center text-slate-800 text-sm">{match.t2?.name || "Team B"}</div>
              <div className="text-xs text-slate-500 text-center">{match.t2?.code}</div>
            </div>
          </div>

          {/* Score Inputs Table */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2 mb-2 text-center text-xs font-semibold text-slate-500">
              <div></div>
              <div>Set 1</div>
              <div>Set 2</div>
              <div>Set 3</div>
            </div>

            {/* Team A Row */}
            <div className="grid grid-cols-4 gap-2 mb-2 items-center">
              <div className="text-right font-bold text-slate-700 text-sm pr-2">Team A</div>
              <input name="set1A" value={scores.set1A} onChange={handleChange} className="border rounded px-2 py-1 text-center bg-slate-50 focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
              <input name="set2A" value={scores.set2A} onChange={handleChange} className="border rounded px-2 py-1 text-center bg-slate-50 focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
              <input name="set3A" value={scores.set3A} onChange={handleChange} className="border rounded px-2 py-1 text-center bg-slate-50 focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
            </div>

            {/* Team B Row */}
            <div className="grid grid-cols-4 gap-2 mb-4 items-center">
              <div className="text-right font-bold text-slate-700 text-sm pr-2">Team B</div>
              <input name="set1B" value={scores.set1B} onChange={handleChange} className="border rounded px-2 py-1 text-center bg-slate-50 focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
              <input name="set2B" value={scores.set2B} onChange={handleChange} className="border rounded px-2 py-1 text-center bg-slate-50 focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
              <input name="set3B" value={scores.set3B} onChange={handleChange} className="border rounded px-2 py-1 text-center bg-slate-50 focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Total Score & Shuttles */}
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Set Score (Total)</label>
                <div className="flex items-center gap-2">
                  <input name="totalA" value={scores.totalA} onChange={handleChange} className="w-12 border rounded px-2 py-1 text-center font-bold text-blue-600 bg-blue-50" />
                  <span>:</span>
                  <input name="totalB" value={scores.totalB} onChange={handleChange} className="w-12 border rounded px-2 py-1 text-center font-bold text-blue-600 bg-blue-50" />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Shuttles Used (ลูกขนไก่)</label>
                <input
                  type="number"
                  value={shuttles}
                  onChange={(e) => setShuttles(Number(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-center bg-yellow-50 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
              Save Result
            </button>
          </div>
        </div>



      </div>
    </div>
  );
};


// 3. Line Component (unchanged)
const Line = ({
  length = 100,
  angle = 0,
  thickness = 2,
  color = "#64748b",
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

/* 🏸 Tournament Bracket - Main Component */
export default function ThirtyTwoBracket({ level, tournamentId, rank, ranks, onRankChange, isOrganizer }: ThirtyTwoBracketProps) {
  const [matches, setMatches] = useState<MatchNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSmallBracket, setIsSmallBracket] = useState(false);
  const bracketRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchNode | undefined>(undefined);
  const [lowerMatches, setLowerMatches] = useState<any[]>([]);
  const [showLowerBracket, setShowLowerBracket] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    // 8 + 4 + 2 + 1 = 15 matches total
    const initMatches: MatchNode[] = [];
    for (let i = 0; i < 15; i++) {
      initMatches.push({ id: i });
    }
    setMatches(initMatches);
  }, []);

  useEffect(() => {
    if (!tournamentId) return;

    const loadData = async () => {
      setLoading(true);

      // ✅ 1. ล้างข้อมูลเก่าออกก่อนเริ่มดึงใหม่ เพื่อป้องกันข้อมูลมือเดิมค้าง
      const freshMatches: MatchNode[] = [];
      for (let i = 0; i < 15; i++) freshMatches.push({ id: i });
      setMatches(freshMatches);

      try {
        // ✅ 2. Fetch Tournament Info and Bracket Matches (ส่ง rank ไปด้วย)
        const [tournamentRes, bracketRes] = await Promise.all([
          api.get(`/api/tournament/${tournamentId}`),
          api.get(`/api/bracket-matches/${tournamentId}`, { params: { handType: rank } })
        ]);

        const tournament = tournamentRes.data.data;
        const allDbMatches: any[] = bracketRes.data.data || [];

        console.log(`[Bracket DEBUG] Loading Rank: ${rank}, Matches Found: ${allDbMatches.length}`);
        if (allDbMatches.length > 0) {
          console.log(`[Bracket DEBUG] First Match HandType in DB: ${allDbMatches[0].handType}`);
        }

        // ✅ Determine Size & Type (ทำก่อน Early Return เพื่อให้ Layout ถูกต้อง)
        const isSmall = (tournament?.maxPlayers || 32) <= 16;
        setIsSmallBracket(isSmall);

        // ✅ เราจะไม่ Early Return แล้ว เพื่อให้ระบบทำกระบวนการดึงทีมต่อ 
        // ถ้าไม่มีแมตช์ใน DB มันจะโชว์เป็น "รอผล" ตามโครงสร้างสายปกติ

        // Filter Top/Bottom Bracket
        // User Request: If no lower bracket, don't show it.
        // We split the matches here.
        const dbMatches = allDbMatches.filter((m: any) => m.stage === 'UPPER' || m.stage === 'GRAND_FINAL');
        const lowerDbMatches = allDbMatches.filter((m: any) => m.stage === 'LOWER');
        setLowerMatches(lowerDbMatches);


        // User Logic Final:
        // isLowerBracket == true -> Show Lower Bracket
        // isLowerBracket == false -> Hide Lower Bracket
        // Robust check for string "false" or boolean false
        const rawLower = tournament?.isLowerBracket;
        const showLower = rawLower === true || rawLower === "true";
        setShowLowerBracket(showLower);
        setDebugInfo(`isLowerBracket in DB: ${JSON.stringify(rawLower)} (${typeof rawLower}) ShowLower: ${showLower}`);
        console.log("Debug Bracket: isLowerBracket=", rawLower, "ShowLower=", showLower);

        // 2. Fetch Group Ranks to build Lookup Map
        const teamLookup = new Map<number, Team>();
        const qualifiedTeams: Team[] = [];
        const lowerQualifiedTeams: Team[] = [];

        if (tournament && tournament.groups) {
          // ✅ Revert: ดึงทุกกลุ่มตามปกติ (ป้องกันเคส registers ไม่โผล่มาในก้อนแรก)
          const groups = tournament.groups;

          const rankPromises = groups.map((g: any) =>
            api.get(`/api/matches/${tournamentId}`, { params: { groupName: g.name } })
              .then(r => ({ groupName: g.name, ranks: r.data.rank, isFinished: r.data.isFinished, handType: r.data.handType }))
              // Received isFinished from backend
              .catch(e => ({ groupName: g.name, ranks: [], handType: "" }))
          );

          const results = await Promise.all(rankPromises);
          // ✅ ใช้ natural sort เพื่อให้เรียง G1, G2, G10 ได้ถูกต้อง (แทนที่จะเป็น G1, G10, G2)
          results.sort((a, b) => a.groupName.localeCompare(b.groupName, undefined, { numeric: true, sensitivity: 'base' }));

          // ✅ Reset lookup and qualified lists to ensure a fresh build
          teamLookup.clear();
          qualifiedTeams.length = 0;
          lowerQualifiedTeams.length = 0;

          results.forEach((res: any) => {
            const allRanks = res.ranks || [];
            const isFinished = res.isFinished === true;

            // ✅ ตรวจสอบประเภทมืออย่างเข้มงวด
            const groupRank = res.handType || "";
            const isTargetRank = (groupRank === rank) || (groupRank === "" && rank === "BG");

            // ✅ Stable Indexing: ทุกกลุ่มต้อง Push 2 ช่องเสมอ (เพื่อให้ Index ของ G1, G2, G3... นิ่ง)
            if (isFinished && allRanks.length > 0 && isTargetRank) {
              const t1: Team = { id: Number(allRanks[0][8]), code: allRanks[0][0], name: allRanks[0][2], players: allRanks[0][3] };
              teamLookup.set(t1.id!, t1);
              qualifiedTeams.push(t1);

              if (allRanks.length > 1) {
                const t2: Team = { id: Number(allRanks[1][8]), code: allRanks[1][0], name: allRanks[1][2], players: allRanks[1][3] };
                teamLookup.set(t2.id!, t2);
                qualifiedTeams.push(t2);
              } else {
                qualifiedTeams.push({ code: "BYE", name: "รอผล", players: "-" });
              }
            } else {
              // ถ้าไม่ใช่ Target Rank หรือยังไม่เสร็จ ให้ใส่ Placeholder ไว้เพื่อไม่ให้ Index เลื่อน
              qualifiedTeams.push({ code: "BYE", name: "รอผล", players: "-" });
              qualifiedTeams.push({ code: "BYE", name: "รอผล", players: "-" });
            }

            // Lower bracket seeding (Stable Indexing)
            if (isFinished && allRanks.length > 2 && isTargetRank) {
              const t3: Team = { id: Number(allRanks[2][8]), code: allRanks[2][0], name: allRanks[2][2], players: allRanks[2][3] };
              teamLookup.set(t3.id!, t3);
              lowerQualifiedTeams.push(t3);

              if (allRanks.length > 3) {
                const t4: Team = { id: Number(allRanks[3][8]), code: allRanks[3][0], name: allRanks[3][2], players: allRanks[3][3] };
                teamLookup.set(t4.id!, t4);
                lowerQualifiedTeams.push(t4);
              } else {
                lowerQualifiedTeams.push({ code: "BYE", name: "รอผล", players: "-" });
              }
            } else {
              lowerQualifiedTeams.push({ code: "BYE", name: "รอผล", players: "-" });
              lowerQualifiedTeams.push({ code: "BYE", name: "รอผล", players: "-" });
            }
          });
        }

        // 3. Map DB Matches to Local State (ใช้ freshMatches เริ่มต้น)
        setMatches(() => {
          const newMatches = [...freshMatches];

          // Helper to map Round/Seq to Index
          const getIndex = (r: number, s: number) => {
            if (r === 1) return s - 1; // 0-7
            if (r === 2) return 8 + (s - 1); // 8-11
            if (r === 3) return 12 + (s - 1); // 12-13
            if (r === 4) return 14; // 14
            return -1;
          };

          // Update from DB
          // FIX: If level is Lower, use lowerDbMatches. Otherwise use Upper.
          const targetMatches = (level === "ล่าง" || level === "Lower") ? lowerDbMatches : dbMatches;

          targetMatches.forEach(dbm => {
            const idx = getIndex(dbm.roundSequence, dbm.matchSequence);
            if (idx !== -1 && idx < newMatches.length) {
              const m = newMatches[idx];
              m.dbId = dbm.id;
              m.shuttlesUsed = dbm.shuttle || 0;

              // Map Players
              if (dbm.player1Id) m.t1 = teamLookup.get(dbm.player1Id) || { code: "-", name: dbm.player1?.teamName || dbm.player1?.player1Name || "-", players: "-" };
              if (dbm.player2Id) m.t2 = teamLookup.get(dbm.player2Id) || { code: "-", name: dbm.player2?.teamName || dbm.player2?.player1Name || "-", players: "-" };

              // Map Scores
              if (dbm.score1 !== null && dbm.score2 !== null) {
                // Parse sets if available string "21:10, 21:12"
                // Simple parsing or default
                const scoreObj = {
                  totalA: dbm.score1, totalB: dbm.score2,
                  set1A: 0, set1B: 0, set2A: 0, set2B: 0, set3A: 0, set3B: 0
                };
                if (dbm.sets) {
                  const parts = dbm.sets.split(",").map((s: string) => s.trim());
                  if (parts[0]) { const [a, b] = parts[0].split(/[:\-]/); scoreObj.set1A = Number(a); scoreObj.set1B = Number(b); }
                  if (parts[1]) { const [a, b] = parts[1].split(/[:\-]/); scoreObj.set2A = Number(a); scoreObj.set2B = Number(b); }
                  if (parts[2]) { const [a, b] = parts[2].split(/[:\-]/); scoreObj.set3A = Number(a); scoreObj.set3B = Number(b); }
                }
                m.scores = scoreObj;
              }
            }
          });

          return newMatches;
        });

        // 4. Initial Population & Persistence (Upper)
        const targetRound = isSmall ? 2 : 1;
        const targetDbMatches = dbMatches.filter((m: any) => m.roundSequence === targetRound).sort((a: any, b: any) => a.matchSequence - b.matchSequence);
        const matchCount = isSmall ? 4 : 8;

        // ONLY seed Upper if level is "บน" or equivalent
        if ((level === "บน" || level === "Main" || !level) && qualifiedTeams.length > 0 && targetDbMatches.length > 0) {
          const updates = [];
          const half = matchCount / 2;

          for (let i = 0; i < matchCount; i++) {
            const dbm = targetDbMatches[i];
            const hasScore = (dbm?.score1 !== null || dbm?.score2 !== null) || dbm?.status === 'FINISHED';

            if (dbm && !hasScore) {
              // ✅ Correct Cross-Group Seeding (Winner G1 vs Runner-up G2)
              // Group Pair (GP): Match 1&2 use G1&G2, Match 3&4 use G3&G4
              const gp = Math.floor(i / 2);
              let t1Idx, t2Idx;

              if (i % 2 === 0) {
                // Match A of pair: Winner G1 vs Runner-up G2
                t1Idx = (gp * 2) * 2;       // G(2n+1) R1
                t2Idx = (gp * 2 + 1) * 2 + 1; // G(2n+2) R2
              } else {
                // Match B of pair: Winner G2 vs Runner-up G1
                t1Idx = (gp * 2 + 1) * 2;     // G(2n+2) R1
                t2Idx = (gp * 2) * 2 + 1;     // G(2n+1) R2
              }

              const t1 = qualifiedTeams[t1Idx] || null;
              const t2 = qualifiedTeams[t2Idx] || null;
              const newP1 = t1?.id; const newP2 = t2?.id;

              if (dbm.player1Id !== newP1 || dbm.player2Id !== newP2) {
                updates.push(api.put(`/api/bracket-matches/${dbm.id}`, { player1Id: newP1, player2Id: newP2 }));
                setMatches(prev => {
                  const nm = [...prev];
                  const stateIdx = (isSmall ? 8 : 0) + i;
                  if (nm[stateIdx]) {
                    nm[stateIdx].t1 = t1 || { code: "-", name: "-", players: "-" };
                    nm[stateIdx].t2 = t2 || { code: "-", name: "-", players: "-" };
                  }
                  return nm;
                });
              }
            }
          }
          if (updates.length > 0) await Promise.all(updates);
        }

        // 5. Initial Population & Persistence (Lower)
        // ONLY seed Lower if level is "ล่าง"
        if ((level === "ล่าง" || level === "Lower") && showLower && lowerQualifiedTeams.length > 0 && lowerDbMatches.length > 0) {
          const updates = [];
          const targetLowerRound = isSmall ? 2 : 1;
          const targetLowerMatches = lowerDbMatches.filter((m: any) => m.roundSequence === targetLowerRound).sort((a: any, b: any) => a.matchSequence - b.matchSequence);
          const lowerMatchCount = isSmall ? 4 : 8;
          const half = lowerMatchCount / 2;

          for (let i = 0; i < lowerMatchCount; i++) {
            const dbm = targetLowerMatches[i];
            const hasScore = (dbm?.score1 !== null || dbm?.score2 !== null) || dbm?.status === 'FINISHED';

            if (dbm && !hasScore) {
              // ✅ Correct Lower Cross-Group Seeding (Rank 3 G1 vs Rank 4 G2)
              const gp = Math.floor(i / 2);
              let t1Idx, t2Idx;

              if (i % 2 === 0) {
                t1Idx = (gp * 2) * 2;       // G(2n+1) R3
                t2Idx = (gp * 2 + 1) * 2 + 1; // G(2n+2) R4
              } else {
                t1Idx = (gp * 2 + 1) * 2;     // G(2n+2) R3
                t2Idx = (gp * 2) * 2 + 1;     // G(2n+1) R4
              }

              const t1 = lowerQualifiedTeams[t1Idx] || null;
              const t2 = lowerQualifiedTeams[t2Idx] || null;
              const newP1 = t1?.id; const newP2 = t2?.id;

              if (dbm.player1Id !== newP1 || dbm.player2Id !== newP2) {
                updates.push(api.put(`/api/bracket-matches/${dbm.id}`, { player1Id: newP1, player2Id: newP2 }));
                setMatches(prev => {
                  const nm = [...prev];
                  const stateIdx = (isSmall ? 8 : 0) + i;
                  if (nm[stateIdx]) {
                    nm[stateIdx].t1 = t1 || { code: "-", name: "-", players: "-" };
                    nm[stateIdx].t2 = t2 || { code: "-", name: "-", players: "-" };
                  }
                  return nm;
                });
              }
            }
          }
          if (updates.length > 0) await Promise.all(updates);
        }
      } catch (e) {
        console.error("Error fetching bracket data:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tournamentId, rank]);


  const handleMatchClick = (match: MatchNode) => {
    if (!isOrganizer) return;
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleScoreUpdate = async (matchId: number, scores: any, shuttles: number) => {
    // 1. Update Local State for Immediate Feedback
    setMatches(prev => {
      const newMatches = [...prev];
      const match = newMatches[matchId];
      match.scores = scores;
      match.shuttlesUsed = shuttles;

      // Winner Logic (Local)
      let s1Wins = 0, s2Wins = 0;
      if (scores.set1A > scores.set1B) s1Wins++; else if (scores.set1B > scores.set1A) s2Wins++;
      if (scores.set2A > scores.set2B) s1Wins++; else if (scores.set2B > scores.set2A) s2Wins++;
      if (scores.set3A > scores.set3B) s1Wins++; else if (scores.set3B > scores.set3A) s2Wins++;

      let winner: Team | undefined;
      if (s1Wins >= 2) winner = match.t1;
      else if (s2Wins >= 2) winner = match.t2;

      if (!winner && scores.totalA && scores.totalB) {
        if (scores.totalA > scores.totalB) winner = match.t1;
        else if (scores.totalB > scores.totalA) winner = match.t2;
      }

      if (winner) {
        let nextMatchId = -1;
        let isSlot1 = false;

        // Advance logic (16 teams)
        if (matchId < 8) {
          nextMatchId = 8 + Math.floor(matchId / 2);
          isSlot1 = (matchId % 2) === 0;
        } else if (matchId < 12) {
          nextMatchId = 12 + Math.floor((matchId - 8) / 2);
          isSlot1 = ((matchId - 8) % 2) === 0;
        } else if (matchId < 14) {
          nextMatchId = 14;
          isSlot1 = ((matchId - 12) % 2) === 0;
        }

        if (nextMatchId !== -1) {
          const nextMatch = newMatches[nextMatchId];
          if (isSlot1) nextMatch.t1 = winner;
          else nextMatch.t2 = winner;
        }
      }
      return newMatches;
    });

    // 2. Persist to Database
    const currentMatch = matches[matchId];
    if (currentMatch && currentMatch.dbId) {
      try {
        const setsStr = `${scores.set1A}:${scores.set1B}, ${scores.set2A}:${scores.set2B}, ${scores.set3A}:${scores.set3B}`;
        await api.put(`/api/bracket-matches/${currentMatch.dbId}`, {
          score1: scores.totalA,
          score2: scores.totalB,
          sets: setsStr,
          shuttle: shuttles
        });
        console.log("Score saved to DB");
      } catch (error) {
        console.error("Failed to save score DB:", error);
        alert("Warning: Score saved locally but failed to sync with server.");
      }
    } else {
      console.warn("Match missing DB ID, cannot save.");
    }
  };

  const handleDownload = async () => {
    if (bracketRef.current) {
      try {
        const canvas = await html2canvas(bracketRef.current, {
          scale: 3, // Higher quality
          backgroundColor: "#f9f9f0",
          useCORS: true,
          width: bracketRef.current.scrollWidth,
          height: bracketRef.current.scrollHeight,
          windowWidth: bracketRef.current.scrollWidth + 100, // Reduce responsiveness issues
          windowHeight: bracketRef.current.scrollHeight + 100,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `bracket-${level}-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
      } catch (err) {
        console.error("Download failed", err);
        alert("Cannot download image");
      }
    }
  };

  // --- Drag to Scroll Logic ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll-fast factor
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // If this is the "Lower" bracket instance:
  // 1. If disabled (!showLowerBracket), hide it.
  // 2. If enabled BUT empty (and not loading), hide it too (Smart Hide).
  if (level === "ล่าง" || level === "Lower") {
    if (!showLowerBracket) return null;
    if (!loading && lowerMatches.length === 0) return null;
  }

  return (
    <div className="relative flex flex-col items-center">

      <ScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatch}
        matchNumber={selectedMatch ? selectedMatch.id + 1 : 0}
        onSave={handleScoreUpdate}
      />



      {/* Scrollable Container (Viewport) */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="h-[1200px] w-full overflow-auto flex flex-col items-start py-10 relative custom-scrollbar cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: "#f9f9f0" }}
      >
        <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

      `}</style>

        {/* Captured Area Container */}
        <div ref={bracketRef} className={`w-fit p-10 ${isSmallBracket ? 'min-w-[1100px]' : 'min-w-[1500px]'}`} style={{ backgroundColor: "#f9f9f0" }}>



          <div className="w-full flex justify-center mb-10">
            {/* Header */}
            <h1 className="text-3xl font-black uppercase tracking-widest mb-8 drop-shadow-sm flex flex-wrap justify-center items-center gap-4" style={{ color: "#1e3a8a" }}>
              <div className="flex items-center gap-3">
                <span>🏸</span> TOURNAMENT BRACKET - {level}
              </div>

              {/* Inline Rank Selector + Download Button */}
              <div className="flex items-center gap-4">
                {ranks && ranks.length > 0 && (
                  <div className="relative inline-block group">
                    <select
                      value={rank}
                      onChange={(e) => onRankChange && onRankChange(e.target.value)}
                      className="appearance-none font-bold text-xl py-1 pl-4 pr-10 rounded-full cursor-pointer focus:outline-none transition-all shadow-sm"
                      style={{
                        backgroundColor: "#fef3c7", // amber-100
                        borderColor: "#fbbf24", // amber-400
                        borderWidth: "2px",
                        color: "#b45309", // amber-700
                      }}
                    >
                      {ranks.map(r => (
                        <option key={r} value={r}>
                          ประเภทมือ {r === "P_PLUS" ? "P+" : r === "P_MINUS" ? "P-" : r}
                        </option>
                      ))}
                    </select>
                    {/* Custom Arrow for select */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{ color: "#d97706" }}>
                      <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                )}

                {/* Static Download Button - Placed after Rank Selector */}
                <button
                  onClick={handleDownload}
                  data-html2canvas-ignore="true"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold shadow-md transition-all text-sm active:scale-95"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </h1>
          </div>

          {loading && <div className="absolute top-28 left-10 font-semibold px-4 py-2 rounded-full shadow z-50" style={{ backgroundColor: "#ffffff", color: "#2563eb" }}>Loading Tournament Data...</div>}



          {/* UPPER BRACKET SECTION (Show for BOTH Upper and Lower levels now) */}
          {/* If level="ล่าง", we are showing Lower Bracket data in this same structure */}
          {(level === "บน" || level === "Main" || level === "ล่าง" || level === "Lower" || !level) && (
            <div className="flex flex-col relative px-20"> {/* Added left padding for better visual center */}
              <div className="flex gap-16 mb-6 text-base font-bold uppercase tracking-widest pl-10" style={{ color: "#64748b" }}>
                {!isSmallBracket && <div className="px-3 py-1 rounded-full text-center w-[300px]" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Round of 16</div>}
                <div className="px-3 py-1 rounded-full text-center w-[300px]" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Quarter Finals</div>
                <div className="px-3 py-1 rounded-full text-center w-[300px]" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Semi Finals</div>
                <div className="px-4 py-1 rounded-full text-center w-[300px] shadow-sm animate-pulse" style={{ backgroundColor: "#facc15", color: "#713f12" }}>🏆 Final</div>
              </div>

              {/* Bracket Layout - Compact */}
              <div className="flex gap-16 relative"> {/* Reduced gap from 20 to 16 for new card size */}

                {/* Round of 16 (8 Matches) */}
                {!isSmallBracket && (
                  <div className="flex flex-col justify-between h-[1050px] w-[300px] z-10">
                    {matches.slice(0, 8).map((m, i) => (
                      <MatchCard key={m.id} matchId={m.id} matchNumber={m.id + 1} match={m} onClick={() => handleMatchClick(m)} isOrganizer={isOrganizer} />
                    ))}

                    {/* LINES - Recalculated for Card Width 300px */}
                    <div className="absolute inset-0 pointer-events-none -z-10">
                      {/* R16 -> QF */}
                      {/* Box Height ~100px? Adjusted logic. 
                            If 1050 / 8 = ~131px spacing.
                            Center of box 1 ~65px. 
                        */}
                      <div style={{ position: 'relative', top: '-25px' }}> {/* Micro adjustment for alignment */}
                        {/* Group 1 */}
                        <div><Line top={55} left={300} length={32} angle={0} /><Line top={186} left={300} length={32} angle={0} /><Line top={55} left={332} length={131} angle={90} /><Line top={120} left={332} length={32} angle={0} /></div>
                        {/* Group 2 */}
                        <div><Line top={317} left={300} length={32} angle={0} /><Line top={448} left={300} length={32} angle={0} /><Line top={317} left={332} length={131} angle={90} /><Line top={382} left={332} length={32} angle={0} /></div>
                        {/* Group 3 */}
                        <div><Line top={579} left={300} length={32} angle={0} /><Line top={710} left={300} length={32} angle={0} /><Line top={579} left={332} length={131} angle={90} /><Line top={644} left={332} length={32} angle={0} /></div>
                        {/* Group 4 */}
                        <div><Line top={841} left={300} length={32} angle={0} /><Line top={972} left={300} length={32} angle={0} /><Line top={841} left={332} length={131} angle={90} /><Line top={906} left={332} length={32} angle={0} /></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* QF (4 Matches) */}
                <div
                  className="flex flex-col justify-between h-[906px] w-[300px] z-10"
                  style={{ marginTop: isSmallBracket ? '0px' : '65px' }}
                >
                  {matches.slice(8, 12).map((m, i) => (
                    <MatchCard key={m.id} matchId={m.id} matchNumber={m.id + 1} match={m} onClick={() => handleMatchClick(m)} isOrganizer={isOrganizer} />
                  ))}
                  <div className="absolute inset-0 pointer-events-none -z-10" style={{ transform: isSmallBracket ? 'translateX(-364px)' : 'none' }}>
                    <div style={{ position: 'relative', top: '-25px' }}>
                      {/* QF -> SF */}
                      <div><Line top={120} left={664} length={32} angle={0} /><Line top={382} left={664} length={32} angle={0} /><Line top={120} left={696} length={262} angle={90} /><Line top={251} left={696} length={32} angle={0} /></div>
                      <div><Line top={644} left={664} length={32} angle={0} /><Line top={906} left={664} length={32} angle={0} /><Line top={644} left={696} length={262} angle={90} /><Line top={775} left={696} length={32} angle={0} /></div>
                    </div>
                  </div>
                </div>

                {/* SF (2 Matches) */}
                <div
                  className="flex flex-col justify-between h-[644px] w-[300px] z-10"
                  style={{ marginTop: isSmallBracket ? '131px' : '196px' }}
                >
                  {matches.slice(12, 14).map((m, i) => (
                    <MatchCard key={m.id} matchId={m.id} matchNumber={m.id + 1} match={m} onClick={() => handleMatchClick(m)} isOrganizer={isOrganizer} />
                  ))}
                  <div className="absolute inset-0 pointer-events-none -z-10" style={{ transform: isSmallBracket ? 'translateX(-364px)' : 'none' }}>
                    <div style={{ position: 'relative', top: '-25px' }}>
                      {/* SF -> Final */}
                      <div><Line top={251} left={1028} length={32} angle={0} /><Line top={775} left={1028} length={32} angle={0} /><Line top={251} left={1060} length={524} angle={90} /><Line top={513} left={1060} length={32} angle={0} /></div>
                    </div>
                  </div>
                </div>

                {/* Final (1 Match) */}
                <div
                  className="flex flex-col justify-center h-[150px] w-[300px] z-10"
                  style={{ marginTop: isSmallBracket ? '378px' : '443px' }}
                >
                  {matches.slice(14, 15).map((m, i) => (
                    <MatchCard key={m.id} matchId={m.id} matchNumber={m.id + 1} match={m} onClick={() => handleMatchClick(m)} isOrganizer={isOrganizer} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div >

      {/* Lower Bracket Placeholder (Hidden if empty) */}
      {/* Lower Bracket Placeholder (Hidden if disabled) */}
      {/* Lower Bracket Placeholder (Hidden if empty OR if we are showing the full Lower Bracket view) */}
      {/* If level="ล่าง", we are already showing the bracket above, so hide this placeholder */}
      {
        (showLowerBracket && (level === "Main" || !level)) && (
          <div className="mt-20 w-full text-center p-10 bg-gray-100 rounded-xl border border-dashed border-gray-400">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">สายล่าง (Lower Bracket)</h2>
            {lowerMatches.length > 0 ? (
              <p className="text-gray-500">Found {lowerMatches.length} matches in Lower Bracket. (Visualization Coming Soon)</p>
            ) : (
              <p className="text-gray-400 italic">No matches in Lower Bracket yet.</p>
            )}
          </div>
        )
      }
    </div >
  );
}
