"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  BackButton,
  SectionTitle,
  GroupTable,
  GroupInfo,
} from "../../../../../../../../components/groupComponents";
import api from "../../../../../../../lib/api";
import { useLanguage } from "@/contexts/LanguageContext";


export default function GroupStageScoresPage() {
  const params = useSearchParams();
  const groupName = params.get("group") || "Group A";
  const { language, t } = useLanguage();
  const gm = {
    matchTableSuffix: t("groupManage.matchTableSuffix"),
    rankTitle: t("groupManage.rankTitle"),
    rankHeadings: t("groupManage.rankHeadings"),
    matchTitle: t("groupManage.matchTitle"),
    matchHeadings: t("groupManage.matchHeadings"),
    loading: t("groupManage.loading"),
  };

  //  ธีมสีแต่ละกลุ่ม
  const themeMap: Record<string, { from: string; to: string; accent: string }> = {
    "Group A": { from: "#FFF8E1", to: "#FFE7B3", accent: "#F59E0B" },
    "Group B": { from: "#E0F7FF", to: "#BAE6FD", accent: "#0EA5E9" },
    "Group C": { from: "#FFE4EF", to: "#FBCFE8", accent: "#EC4899" },
    "Group D": { from: "#E9FDF3", to: "#A7F3D0", accent: "#10B981" },
  };

  //  Extract Theme Key (รองรับชื่อเช่น "BG Group A")
  const match = groupName.match(/Group [A-D]/);
  const themeKey = match ? match[0] : "Group A";
  const theme = themeMap[themeKey] || { from: "#F3F4F6", to: "#E5E7EB", accent: "#6B7280" };

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ rank: any[][]; matches: any[][] }>({
    rank: [],
    matches: [],
  });

  useEffect(() => {
    const tournamentId = localStorage.getItem("selectedTournamentId");
    if (!tournamentId || !groupName) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/matches/${tournamentId}`, {
          params: { groupName },
        });
        setSelected(res.data);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupName]);

  return (
    <div
      className="min-h-screen py-10 px-4 flex flex-col items-center"
      style={{
        background: `linear-gradient(to bottom right, ${theme.from}, ${theme.to})`,
      }}
    >
      <div className="w-full max-w-6xl bg-white/70 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <BackButton target="/user/group" />

        <SectionTitle text={`${groupName.replace(/P_PLUS/g, "P+").replace(/P_MINUS/g, "P-")}${gm.matchTableSuffix}`} color={theme.accent} />
        <GroupInfo totalTeams={selected.rank.length} />

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold py-10">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {gm.loading}
          </div>
        ) : (
          <>
            <GroupTable
              title={gm.rankTitle}
              headers={gm.rankHeadings}
              rows={selected.rank}
            />

            <GroupTable
              title={gm.matchTitle}
              headers={gm.matchHeadings}
              rows={selected.matches.map((row) => {
                const cleaned = row.slice(0, 13);
                // Clean SET column (index 7) — ลบ ", :" ที่ไม่มีตัวเลขออก
                if (cleaned[7] && typeof cleaned[7] === "string") {
                  cleaned[7] = cleaned[7]
                    .replace(/,\s*:\s*$/, "")   // ลบ ", :" ท้ายสุด
                    .replace(/,\s*\s*:\s*\s*$/g, "") // ลบ ", : " ท้ายสุด
                    .trim();
                }
                return cleaned;
              })}
            />
          </>
        )}
      </div>
    </div>
  );
}
