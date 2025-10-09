"use client";

import React, { useState } from "react";

interface Match {
  date: string;
  teams: string;
  rank: string;
  type: string;
  score: number;
  price: number; // ราคาต่อลูกแบต
  shuttle: number;
  total: number;
}

export default function HistoryPage() {
  const [matches, setMatches] = useState<Match[]>([
    {
      date: "23-10-2568",
      teams: "muyong vs munao",
      rank: "N",
      type: "คู่",
      score: 140,
      price: 25,
      shuttle: 2,
      total: 50,
    },
    {
      date: "23-10-2568",
      teams: "pig vs banana",
      rank: "P-",
      type: "เดี่ยว",
      score: 130,
      price: 50,
      shuttle: 2,
      total: 100,
    },
  ]);

  // เพิ่มลูกแบต
  const handleAddShuttle = (index: number) => {
    const updated = [...matches];
    updated[index].shuttle += 1;
    updated[index].total = updated[index].price * updated[index].shuttle;
    setMatches(updated);
  };

  // ลดลูกแบต
  const handleRemoveShuttle = (index: number) => {
    const updated = [...matches];
    if (updated[index].shuttle > 0) {
      updated[index].shuttle -= 1;
      updated[index].total = updated[index].price * updated[index].shuttle;
      setMatches(updated);
    }
  };

  // เปลี่ยนราคาต่อลูก
  const handlePriceChange = (index: number, value: string) => {
    const updated = [...matches];
    const newPrice = parseFloat(value) || 0;
    updated[index].price = newPrice;
    updated[index].total = newPrice * updated[index].shuttle;
    setMatches(updated);
  };

  return (
    <main className="min-h-screen bg-[#fafaf8] flex flex-col items-center pt-12 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-200 via-pink-300 to-rose-200 w-[90%] max-w-5xl rounded-t-2xl shadow-md px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          ประวัติการแข่งขัน
        </h1>
     
      </div>

      {/* Table */}
      <div className="w-[90%] max-w-5xl bg-pink-50 border border-pink-200 rounded-b-2xl shadow-sm overflow-hidden">
        <table className="w-full text-center text-sm text-gray-700">
          <thead className="bg-pink-100 text-gray-800">
            <tr>
              <th className="py-3 border">วันที่แข่ง</th>
              <th className="py-3 border">ทีมVSทีม</th>
              <th className="py-3 border">แรงค์</th>
              <th className="py-3 border">ประเภท</th>
              <th className="py-3 border">คะแนน</th>
              <th className="py-3 border">กำหนดราคา</th>
              <th className="py-3 border">ลูกแบต</th>
              <th className="py-3 border">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr
                key={index}
                className={`hover:bg-pink-100 transition ${
                  index % 2 === 0 ? "bg-pink-50" : "bg-pink-100/40"
                }`}
              >
                <td className="py-3 border">{match.date}</td>
                <td className="py-3 border">{match.teams}</td>
                <td className="py-3 border">{match.rank}</td>
                <td className="py-3 border">{match.type}</td>
                <td className="py-3 border">{match.score}</td>

                {/* ราคาต่อลูก */}
                <td className="py-3 border">
                  <input
                    type="number"
                    value={match.price}
                    onChange={(e) =>
                      handlePriceChange(index, e.target.value)
                    }
                    className="w-16 border border-gray-300 rounded px-1 text-center"
                  />{" "}
                  บาท
                </td>

                {/* ลูกแบต */}
                <td className="py-3 border">
                  <div className="flex items-center justify-center gap-2">
                   
                    
                    <button
                      onClick={() => handleAddShuttle(index)}
                      className="w-6 h-6 bg-pink-400 text-white rounded-full hover:bg-pink-500 transition"
                    >
                      +
                    </button>
                    <span className="text-gray-800 w-5 text-center">
                      {match.shuttle}
                    </span>
                     <button
                      onClick={() => handleRemoveShuttle(index)}
                      className="w-6 h-6 bg-rose-300 text-white rounded-full hover:bg-rose-400 transition"
                    >
                      −
                    </button>
                  </div>
                </td>

                {/* ราคารวม */}
                <td className="py-3 border font-medium text-rose-500">
                  {match.total.toLocaleString()} บาท
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
