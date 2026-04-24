"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  BackButton,
  SectionTitle,
  GroupTable,
  GroupInfo,
} from "../../../../../../../components/groupComponents";
import { GroupTableEditable } from "../../../../../../../components/groupTableEditable";
import api from "../../../../../../lib/api";
import Swal from "sweetalert2"; //  เพิ่มแค่นี้เพื่อใช้แจ้งเตือน
import { useLanguage } from "@/contexts/LanguageContext";


export default function GroupStageScoresPage() {
  const params = useSearchParams();
  const groupName = params.get("group") || "Group A";
  const { id } = useParams();
  const { language, t } = useLanguage();
  const gm = {
    matchTableSuffix: t("groupManage.matchTableSuffix"),
    rankTitle: t("groupManage.rankTitle"),
    rankHeadings: t("groupManage.rankHeadings"),
    matchTitle: t("groupManage.matchTitle"),
    matchHeadings: t("groupManage.matchHeadings"),
    saveSuccess: t("groupManage.saveSuccess"),
    saveError: t("groupManage.saveError"),
    ok: t("groupManage.ok"),
  };

  //  ธีมสีแต่ละกลุ่ม
  const themeMap: Record<string, { from: string; to: string; accent: string }> = {
    "Group A": { from: "#ffffff", to: "rgba(25, 65, 133, 0.08)", accent: "#194185" },
    "Group B": { from: "#ffffff", to: "rgba(46, 211, 183, 0.12)", accent: "#2ED3B7" },
    "Group C": { from: "#ffffff", to: "rgba(25, 65, 133, 0.15)", accent: "#194185" },
    "Group D": { from: "#ffffff", to: "rgba(46, 211, 183, 0.2)", accent: "#2ED3B7" },
  };

  //  Extract Theme Key (รองรับชื่อเช่น "BG Group A")
  const match = groupName.match(/Group [A-D]/);
  const themeKey = match ? match[0] : "Group A";
  const theme = themeMap[themeKey] || { from: "#ffffff", to: "rgba(25, 65, 133, 0.05)", accent: "#194185" };

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ rank: any[][]; matches: any[][] }>({
    rank: [],
    matches: [],
  });
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const res = await api.get(`/api/tournament/${id}`);
        
        if (res.data.data) {
          setIsOrganizer(res.data.data.isOrganizer || false);
        }
      } catch (err) {
        console.error("Error checking organizer status:", err);
      }
    };
    if (id) fetchTournamentData();
  }, [id]);

  const fetchData = async () => {
    if (!id || !groupName) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/matches/${id}`, {
        params: { groupName },
      });
      setSelected(res.data);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, groupName]);

  const handleSave = async (updatedMatches: any[][]) => {
    if (!isOrganizer) return; 

    try {
      const promises = updatedMatches.map(async (row) => {
        const matchId = row[13];
        if (!matchId) return;

        const setScore = row[7] as string; 
        const shuttle = row[12];           

        const timeStr = row[0] as string;

        
        let totalS1 = 0;
        let totalS2 = 0;
        let hasValidScore = false;

        const setStrings = setScore.split(",");
        setStrings.forEach(s => {
          const parts = s.split(":").map(v => v.trim());
          const val1 = parseInt(parts[0]);
          const val2 = parseInt(parts[1]);

          if (!isNaN(val1)) { totalS1 += val1; hasValidScore = true; }
          if (!isNaN(val2)) { totalS2 += val2; hasValidScore = true; }
        });

        let s1 = hasValidScore ? totalS1 : undefined;
        let s2 = hasValidScore ? totalS2 : undefined;

       
        await api.put(`/api/group-matches/${matchId}`, {
          score1: s1,
          score2: s2,
          shuttle: shuttle,
          time: timeStr,
          sets: setScore
        });
      });

      await Promise.all(promises);
      await fetchData(); 

      //  เปลี่ยนจาก alert เป็น Swal (แจ้งเตือนสำเร็จ)
      Swal.fire({
        icon: "success",
        title: gm.saveSuccess,
        confirmButtonText: gm.ok,
        confirmButtonColor: "#194185",
      });
    } catch (e) {
      console.error("Save error:", e);

      //  เปลี่ยนจาก alert เป็น Swal (แจ้งเตือนผิดพลาด)
      Swal.fire({
        icon: "error",
        title: gm.saveError,
        confirmButtonText: gm.ok,
        confirmButtonColor: "#194185",
      });
    }
  };

  return (
    <div
      className="min-h-screen py-10 px-4 flex flex-col items-center"
      style={{
        background: `linear-gradient(to bottom right, ${theme.from}, ${theme.to})`,
      }}
    >
      <div className="w-full max-w-6xl bg-white/70 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <BackButton target={`/manage/${id}/group`} />

        <SectionTitle text={`${groupName.replace(/P_PLUS/g, "P+").replace(/P_MINUS/g, "P-")}${gm.matchTableSuffix}`} color={theme.accent} />
        <GroupInfo totalTeams={selected.rank.length} />

        <GroupTable
          title={gm.rankTitle}
          headers={gm.rankHeadings}
          rows={selected.rank}
        />

        <GroupTableEditable
          title={gm.matchTitle}
          headers={gm.matchHeadings}
          rows={selected.matches}
          onSave={handleSave}
          isAdmin={isOrganizer}
        />
      </div>
    </div>
  );
}
