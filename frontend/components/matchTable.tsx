"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  ChevronDown,
  Filter,
  User,
  Users,
  XCircle,
  Loader2,
} from "lucide-react";
import api from "../src/lib/api";
import { useLanguage } from "../src/contexts/LanguageContext";

interface Match {
  id: number;
  court: string;
  status: "รอแข่ง" | "กำลังแข่ง" | "แข่งสำเร็จ" | "ยกเลิก";
  matchType: "single" | "double";
  timeIn: string;
  timeOut: string;
  duration: string;
  type: string;
  round: string;
  group: string;
  team1: string;
  player1A: string;
  player1B?: string;
  vsGroup: string;
  team2: string;
  player2A: string;
  player2B?: string;
  score?: string;
  stage?: string;
  shuttle?: number;
  displayId?: string;
}

interface MatchTableProps {
  tournamentId: string | number;
}

export default function MatchTable({ tournamentId }: MatchTableProps) {
  const { t } = useLanguage();
  const mh = {
    loadFailed: t("matchHistory.loadFailed"),
    allMatchNum: t("matchHistory.allMatchNum"),
    matchNum: t("matchHistory.matchNum"),
    filterWait: t("matchHistory.filterWait"),
    filterPlaying: t("matchHistory.filterPlaying"),
    filterDone: t("matchHistory.filterDone"),
    filterCancel: t("matchHistory.filterCancel"),
    loading: t("matchHistory.loading"),
    noMatches: t("matchHistory.noMatches"),
    filterTitle: t("matchHistory.filterTitle"),
    filterAll: t("matchHistory.filterAll"),
    colMatch: t("matchHistory.colMatch"),
    colCategory: t("matchHistory.colCategory"),
    colRound: t("matchHistory.colRound"),
    colStatus: t("matchHistory.colStatus"),
    colTime: t("matchHistory.colTime"),
    colGroup: t("matchHistory.colGroup"),
    colTeamA: t("matchHistory.colTeamA"),
    colPlayerA: t("matchHistory.colPlayerA"),
    colScore: t("matchHistory.colScore"),
    colTeamB: t("matchHistory.colTeamB"),
    colPlayerB: t("matchHistory.colPlayerB"),
    colShuttle: t("matchHistory.colShuttle"),
    mobSingle: t("matchHistory.mobSingle"),
    mobDouble: t("matchHistory.mobDouble"),
    mobCategory: t("matchHistory.mobCategory"),
    mobTime: t("matchHistory.mobTime"),
    mobScore: t("matchHistory.mobScore"),
    mobTeam: t("matchHistory.mobTeam"),
  };

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<
    "ทั้งหมด" | "รอแข่ง" | "กำลังแข่ง" | "แข่งสำเร็จ"
  >("ทั้งหมด");

  useEffect(() => {
    const fetchMatches = async () => {
      if (!tournamentId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/match-history/${tournamentId}`);
        const data: Match[] = res.data.data || [];
        setMatches(data);
      } catch (err: any) {
        console.error("Failed to fetch match history:", err);
        setError(mh.loadFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [tournamentId]);

  const filteredMatches =
    filter === "ทั้งหมด"
      ? matches
      : matches.filter((m) => m.status === filter);

  const countLabel =
    filter === "ทั้งหมด"
      ? `${matches.length} ${mh.allMatchNum}`
      : `${filteredMatches.length} ${mh.matchNum}`;

  const renderStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border backdrop-blur-sm";
    
    let label = status;
    if (status === "รอแข่ง") label = mh.filterWait;
    if (status === "กำลังแข่ง") label = mh.filterPlaying;
    if (status === "แข่งสำเร็จ") label = mh.filterDone;
    if (status === "ยกเลิก") label = mh.filterCancel;

    if (status === "รอแข่ง")
      return (
        <span
          className={`${base} border-yellow-200 bg-yellow-100/70 text-yellow-800`}
        >
          <Clock size={12} /> {label}
        </span>
      );
    if (status === "กำลังแข่ง")
      return (
        <span
          className={`${base} border-red-200 bg-red-100/70 text-red-700 animate-pulse`}
        >
          <PlayCircle size={12} /> {label}
        </span>
      );
    if (status === "แข่งสำเร็จ")
      return (
        <span
          className={`${base} border-green-200 bg-green-100/70 text-green-700`}
        >
          <CheckCircle size={12} /> {label}
        </span>
      );
    if (status === "ยกเลิก")
      return (
        <span
          className={`${base} border-gray-200 bg-gray-100/70 text-gray-600`}
        >
          <XCircle size={12} /> {label}
        </span>
      );
  };

  const renderPlayers = (
    type: "single" | "double",
    playerA: string,
    playerB?: string
  ) => {
    return (
      <div className="text-gray-700">
        {type === "double" ? (
          <>
            <Users size={12} className="inline mr-1 text-pink-500" />
            {playerA} / {playerB || "-"}
          </>
        ) : (
          <>
            <User size={12} className="inline mr-1 text-amber-600" />
            {playerA}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-pink-500" />
        <p className="text-sm font-medium">{mh.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="font-medium">{mh.noMatches}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      {/*  Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5 px-2">
        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
          <Filter className="text-pink-600" size={18} />
          <span className="font-semibold">{mh.filterTitle}</span>
          <span className="text-gray-500 text-xs">({countLabel})</span>
        </div>

        <div className="relative w-48 sm:w-56">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value as
                | "ทั้งหมด"
                | "รอแข่ง"
                | "กำลังแข่ง"
                | "แข่งสำเร็จ"
              )
            }
            className="w-full appearance-none py-2 px-4 rounded-xl text-sm font-medium text-gray-700
            bg-gradient-to-r from-white/70 to-pink-50 border border-pink-200 shadow-[0_2px_10px_rgba(255,182,193,0.2)]
            focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all cursor-pointer"
          >
            {["ทั้งหมด", "รอแข่ง", "กำลังแข่ง", "แข่งสำเร็จ"].map((item) => {
              let label = item;
              if (item === "ทั้งหมด") label = mh.filterAll;
              if (item === "รอแข่ง") label = mh.filterWait;
              if (item === "กำลังแข่ง") label = mh.filterPlaying;
              if (item === "แข่งสำเร็จ") label = mh.filterDone;
              return (
                <option key={item} value={item}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown
            className="absolute right-3 top-3 text-pink-500 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {/* ตาราง */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="inline-block min-w-full overflow-hidden rounded-xl border border-pink-100 shadow-lg bg-white/80 backdrop-blur-md">
          <table className="min-w-full text-xs text-center border border-gray-300 border-collapse">
            <thead className="bg-gradient-to-r from-amber-200 via-pink-200 to-rose-200 text-gray-900">
              <tr>
                {[
                  mh.colMatch,
                  mh.colCategory,
                  mh.colRound,
                  mh.colStatus,
                  mh.colTime,
                  mh.colGroup,
                  mh.colTeamA,
                  mh.colPlayerA,
                  mh.colScore,
                  mh.colTeamB,
                  mh.colPlayerB,
                  mh.colShuttle,
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 font-semibold border border-gray-300 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((m, i) => (
                <tr
                  key={`${m.stage}-${m.id}`}
                  className={`transition-all duration-150 hover:bg-pink-50 ${i % 2 === 0 ? "bg-white" : "bg-amber-50/40"
                    }`}
                >
                  <td className="p-2 border border-gray-300 font-bold text-pink-700 whitespace-nowrap">
                    {m.displayId || m.id}
                  </td>
                  <td className="p-2 border border-gray-300">{m.type}</td>
                  <td className="p-2 border border-gray-300">{m.round}</td>
                  <td className="p-2 border border-gray-300">
                    {renderStatusBadge(m.status)}
                  </td>
                  <td className="p-2 border border-gray-300">{m.timeIn}</td>
                  <td className="p-2 border border-gray-300">
                    {m.group.replace(/P_PLUS/g, "P+").replace(/P_MINUS/g, "P-")}
                  </td>
                  <td className="p-2 border border-gray-300 font-medium">
                    {m.team1}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {renderPlayers(m.matchType, m.player1A, m.player1B)}
                  </td>
                  <td className="p-2 border border-gray-300 font-bold text-gray-700">
                    {m.score || "-"}
                  </td>
                  <td className="p-2 border border-gray-300 font-medium">
                    {m.team2}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {renderPlayers(m.matchType, m.player2A, m.player2B)}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {m.shuttle !== undefined && m.shuttle !== null ? m.shuttle : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*  Mobile View */}
      <div className="sm:hidden flex flex-col gap-4 mt-2">
        {filteredMatches.map((m) => (
          <div
            key={`${m.stage}-${m.id}`}
            className="bg-white/70 backdrop-blur-md border border-pink-100 shadow-md rounded-xl p-3 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-pink-700 text-sm">
                {m.displayId || `Match #${m.id}`} ({m.matchType === "single" ? mh.mobSingle : mh.mobDouble})
              </h3>
              {renderStatusBadge(m.status)}
            </div>

            <p className="text-gray-700 text-xs">
              <span className="font-semibold">{mh.mobCategory} </span> {m.type}
            </p>
            <p className="text-gray-700 text-xs">
              <span className="font-semibold">{mh.mobTime} </span> {m.timeIn}
            </p>
            {m.score && m.score !== "-" && (
              <p className="text-gray-700 text-xs">
                <span className="font-semibold">{mh.mobScore} </span> {m.score}
              </p>
            )}

            <div className="border-t border-dashed border-gray-300 mt-2 pt-2 text-xs">
              <p className="font-semibold text-gray-800">
                {m.group !== "-" ? `${m.group.replace(/P_PLUS/g, "P+").replace(/P_MINUS/g, "P-")} | ` : ""}{m.type} ({m.round})
              </p>
              <div className="mt-1">
                <p className="text-gray-500 text-[10px] mb-0.5">{mh.mobTeam} {m.team1}</p>
                {renderPlayers(m.matchType, m.player1A, m.player1B)}
              </div>
              <p className="text-center font-bold text-gray-600 mt-1 mb-1">⚔️ VS ⚔️</p>
              <div>
                <p className="text-gray-500 text-[10px] mb-0.5">{mh.mobTeam} {m.team2}</p>
                {renderPlayers(m.matchType, m.player2A, m.player2B)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
