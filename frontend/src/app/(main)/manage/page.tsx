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
      image: "/images/poster1.jpg",
      canceled: false,
    },
    {
      id: 2,
      title: "BADMINTON COMPETITION 2025",
      date: "วันที่ 30 กันยายน 2568",
      image: "/images/poster1.jpg",
      canceled: false,
    },
    {
      id: 3,
      title: "BADMINTON TOURNAMENT",
      date: "วันที่ 30 กันยายน 2568",
      image: "/images/poster1.jpg",
      canceled: true,
    },
  ]);

  const handleCancel = (id: number) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, canceled: !t.canceled } : t))
    );
  };

  return (
    <main className="min-h-screen bg-[#FFFDF6] px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800">
          รายการแข่งขัน
        </h1>
        <button className="bg-sky-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-600 shadow-md transition">
          จัดแข่ง
        </button>
      </div>

      {/* Tournament Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="relative">
              <Image
                src={t.image}
                alt={t.title}
                width={400}
                height={250}
                className="w-full h-52 object-cover"
              />
              {/* Ribbon badge */}
              {t.canceled && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  ยกเลิก
                </div>
              )}
            </div>
            <div className="p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {t.title}
              </h2>
              <p className="text-gray-500 mb-4">{t.date}</p>
              <button
                onClick={() => handleCancel(t.id)}
                className={`w-full py-2 rounded-md font-medium text-white transition ${
                  t.canceled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                {t.canceled ? "ยกเลิกแล้ว" : "ยกเลิกจัดแข่ง"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
