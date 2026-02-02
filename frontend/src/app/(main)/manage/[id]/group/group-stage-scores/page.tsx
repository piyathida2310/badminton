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

export default function GroupStageScoresPage() {
  const params = useSearchParams();
  const groupName = params.get("group") || "Group A";
  const { id } = useParams();

  // 🎨 ธีมสีแต่ละกลุ่ม
  const themeMap: Record<string, { from: string; to: string; accent: string }> = {
    "Group A": { from: "#FFF8E1", to: "#FFE7B3", accent: "#F59E0B" },
    "Group B": { from: "#E0F7FF", to: "#BAE6FD", accent: "#0EA5E9" },
    "Group C": { from: "#FFE4EF", to: "#FBCFE8", accent: "#EC4899" },
    "Group D": { from: "#E9FDF3", to: "#A7F3D0", accent: "#10B981" },
  };

  const theme = themeMap[groupName] || { from: "#F3F4F6", to: "#E5E7EB", accent: "#6B7280" };

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ rank: any[][]; matches: any[][] }>({
    rank: [],
    matches: [],
  });

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
    try {
      const promises = updatedMatches.map(async (row) => {
        const matchId = row[2];
        if (!matchId) return;

        const setScore = row[6] as string; // "18 : 21"
        const shuttle = row[10];

        const timeStr = row[0] as string; // "09:30"

        // Parse scores
        const parts = setScore.split(":").map((s) => s.trim());
        let s1 = parts[0] && parts[0] !== "" ? parseInt(parts[0]) : undefined;
        let s2 = parts[1] && parts[1] !== "" ? parseInt(parts[1]) : undefined;

        // Ensure valid numbers if provided
        if (s1 !== undefined && isNaN(s1)) s1 = undefined;
        if (s2 !== undefined && isNaN(s2)) s2 = undefined;

        const roundNameStr = row[1] as string; // "R1"

        await api.put(`/api/matches/${matchId}`, {
          score1: s1,
          score2: s2,
          shuttle: shuttle,
          time: timeStr,
          roundName: roundNameStr
        });
      });

      await Promise.all(promises);
      await fetchData(); // Refresh data to update rankings
      alert("บันทึกเรียบร้อย");
    } catch (e) {
      console.error("Save error:", e);
      alert("เกิดข้อผิดพลาดในการบันทึก");
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

        <SectionTitle text={`${groupName} - ตารางการแข่งขัน`} color={theme.accent} />
        <GroupInfo />

        <GroupTable
          title="อันดับคะแนนกลุ่ม"
          headers={["Rank", "Team", "ผู้เล่น", "คะแนนรวม", "ได้", "เสีย", "ผลต่าง"]}
          rows={selected.rank}
        />

        <GroupTableEditable
          title="ตารางการแข่งขันแต่ละรอบ"
          headers={["เวลา", "รอบ", "แมตช์", "ทีม", "ผู้เล่น", "P", "SET", "P", "ทีม", "ผู้เล่น", "ลูกแบต"]}
          rows={selected.matches}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
