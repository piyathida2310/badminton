"use client";

import Image from "next/image";
import { useState } from "react";

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
}

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 1,
      title: "BADMINTON TOURNAMENT",
      date: "วันที่ 30 กันยายน 2568",
      image: "/images/badminton1.jpg",
      canceled: false,
    },
    {
      id: 2,
      title: "BADMINTON COMPETITION 2025",
      date: "วันที่ 30 กันยายน 2568",
      image: "/images/badminton2.jpg",
      canceled: false,
    },
    {
      id: 3,
      title: "BADMINTON TOURNAMENT",
      date: "วันที่ 30 กันยายน 2568",
      image: "/images/badminton3.jpg",
      canceled: true,
    },
  ]);

  const handleCancel = (id: number) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, canceled: !t.canceled } : t
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#FFFDF6] px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">รายการแข่ง</h1>
        <button className="bg-sky-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-sky-600 transition">
          จัดแข่ง
        </button>
      </div>

      {/* Tournament Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <Image
              src={t.image}
              alt={t.title}
              width={400}
              height={250}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-center">
              <p className="text-gray-700 mb-3">{t.date}</p>
              <button
                onClick={() => handleCancel(t.id)}
                className={`w-full py-2 rounded-md font-medium text-white ${
                  t.canceled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                {t.canceled ? "ยกเลิกจัดแข่ง" : "ยกเลิกจัดแข่ง"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
