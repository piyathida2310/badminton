"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "../../../../../lib/api";
import Photo from "../../../../../../components/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
  maxPlayers: number;
  currentPlayers: number;
  rank: string[]; // ✅ Available ranks in this tournament
  registrationStats: Record<string, number>; // ✅ Count per rank
}

export default function TournamentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  //  Rules fixed as requested
  const fixedRules = [
    t('tournamentDetail.rule1') || "ผู้เข้าร่วมต้องสวมชุดกีฬาและรองเท้าที่เหมาะสม",
    t('tournamentDetail.rule2') || "ห้ามใช้อุปกรณ์ช่วยเล่นที่ผิดกติกา",
    t('tournamentDetail.rule3') || "แพ้คัดออกทันที (Knockout system)",
    t('tournamentDetail.rule4') || "การตัดสินของกรรมการถือเป็นที่สิ้นสุด",
    t('tournamentDetail.rule5') || "ผู้สมัครต้องมาถึงก่อนเวลาแข่งขันอย่างน้อย 30 นาที"
  ];

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await axios.get(`/api/tournament/${id}`);
        // Ensure rank is array if valid JSON string or already array
        const data = res.data.data;
        if (typeof data.rank === "string") {
          try {
            data.rank = JSON.parse(data.rank);
          } catch (e) { }
        }
        setTournament(data);
      } catch (error) {
        console.error("Failed to fetch tournament", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTournament();
    }
  }, [id]);

  function formatThaiDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // ✅ คำนวณว่าเต็ม "ทุกรุ่น" หรือยัง
  const ranks = tournament?.rank && Array.isArray(tournament.rank) ? tournament.rank : [];
  const isAllFull = ranks.length > 0
    ? ranks.every(r => (tournament?.registrationStats?.[r] || 0) >= (tournament?.maxPlayers || 0))
    : (tournament?.currentPlayers || 0) >= (tournament?.maxPlayers || 0);

  const isDisabled = tournament?.canceled || isAllFull;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center">Tournament not found</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF6] via-[#F9F6EE] to-[#EDEAE3] px-6 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-all"
      >
        ⬅ ย้อนกลับ
      </button>

      <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-lg p-6">
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4">
          <Photo
            src={tournament.image}
            alt={tournament.title}
            className="object-cover w-full h-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{tournament.title}</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <p className="text-gray-600">{formatThaiDate(tournament.date)}</p>
          <div className="text-sm text-gray-500 font-medium">
            <span className="mr-2">{t('manage.participants')}:</span>
            {ranks.length > 0 ? (
              ranks.map((r, i) => {
                const count = tournament.registrationStats?.[r] || 0;
                const max = tournament.maxPlayers;
                const isFull = count >= max;
                // ✅ แปลงชื่อให้สวยงาม (P_PLUS -> P+, P_MINUS -> P-)
                const label = r === "P_PLUS" ? "P+" : r === "P_MINUS" ? "P-" : r;
                return (
                  <span key={r} className={`mr-3 ${isFull ? "text-red-500 font-bold" : ""}`}>
                    {label}: {count}/{max}
                    {i < ranks.length - 1 ? "," : ""}
                  </span>
                );
              })
            ) : (
              <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
            )}
          </div>
        </div>

        {/* ❌ ลบส่วน Card ตารางออก (ตามที่ขอให้เอาแบบบรรทัดเดียว) */}

        <h2 className="text-lg font-semibold mb-3 text-pink-600">🏸 {t('tournamentDetail.rulesTitle')}</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          {fixedRules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>

        <button
          onClick={() => !isDisabled && router.push(`/user/tournament/${id}/signup`)}
          disabled={isDisabled}
          className={`w-full text-white py-3 rounded-xl font-medium text-lg shadow transition-all ${isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105"
            }`}
        >
          {tournament.canceled
            ? t('tournament.canceled')
            : isAllFull
              ? t('tournament.full')
              : t('tournament.join')}
        </button>
      </div>
    </main>
  );
}