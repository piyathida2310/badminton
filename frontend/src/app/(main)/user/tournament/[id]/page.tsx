"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "../../../../../lib/api";
import Photo from "../../../../../../components/image";

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
}

export default function TournamentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  //  Rules fixed as requested
  const fixedRules = [
    "ผู้เข้าร่วมต้องสวมชุดกีฬาและรองเท้าที่เหมาะสม",
    "ห้ามใช้อุปกรณ์ช่วยเล่นที่ผิดกติกา",
    "แพ้คัดออกทันที (Knockout system)",
    "การตัดสินของกรรมการถือเป็นที่สิ้นสุด",
    "ผู้สมัครต้องมาถึงก่อนเวลาแข่งขันอย่างน้อย 30 นาที"
  ];

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await axios.get(`/api/tournament/${id}`);
        setTournament(res.data.data);
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
        <p className="text-gray-600 mb-6">{formatThaiDate(tournament.date)}</p>

        <h2 className="text-lg font-semibold mb-3 text-pink-600">🏸 กติกาการแข่งขัน</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          {fixedRules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>

        <button
          onClick={() => router.push(`/user/tournament/${id}/signup`)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium text-lg shadow hover:scale-105 transition-all"
        >
          สมัครเข้าร่วมการแข่งขัน
        </button>
      </div>
    </main>
  );
}