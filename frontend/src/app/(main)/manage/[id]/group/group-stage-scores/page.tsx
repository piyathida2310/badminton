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

export default function GroupStageScoresPage() {
  const params = useSearchParams();
  const groupName = params.get("group") || "Group A";
  const { id } = useParams();

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
        const matchId = row[13];
        if (!matchId) return;

        const setScore = row[7] as string; // Index 7 is Set String
        const shuttle = row[12];           // Index 12 is Shuttle

        const timeStr = row[0] as string;

        // Parse & Sum scores from all sets
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

        const roundNameStr = row[1] as string;

        await api.put(`/api/group-matches/${matchId}`, {
          score1: s1,
          score2: s2,
          shuttle: shuttle,
          time: timeStr,
          sets: setScore
        });
      });

      await Promise.all(promises);
      await fetchData(); // Refresh data to update rankings

      //  เปลี่ยนจาก alert เป็น Swal (แจ้งเตือนสำเร็จ)
      Swal.fire({
        icon: "success",
        title: "บันทึกเรียบร้อย",
        confirmButtonText: "ตกลง",
      });
    } catch (e) {
      console.error("Save error:", e);

      //  เปลี่ยนจาก alert เป็น Swal (แจ้งเตือนผิดพลาด)
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึก",
        confirmButtonText: "ตกลง",
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

        <SectionTitle text={`${groupName} - ตารางการแข่งขัน`} color={theme.accent} />
        <GroupInfo totalTeams={selected.rank.length} />

        <GroupTable
          title="อันดับคะแนนกลุ่ม"
          headers={["Rank", "Team", "__MERGE__", "ผู้เล่น", "คะแนนรวม", "ได้", "เสีย", "ผลต่าง"]}
          rows={selected.rank}
        />

        <GroupTableEditable
          title="ตารางการแข่งขันแต่ละรอบ"
          headers={["เวลา", "รอบ", "แมตช์", "ทีม", "__MERGE__", "ผู้เล่น", "P", "SET", "P", "ทีม", "__MERGE__", "ผู้เล่น", "ลูกแบต"]}
          rows={selected.matches}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
