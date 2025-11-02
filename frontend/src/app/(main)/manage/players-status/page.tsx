"use client";
import React, { useState } from "react";

interface Player {
  team: string;
  names: string[];
  rank: string;
  type: string;
  videoUrl: string;
  slipUrl: string;
  status: string;
  paymentStatus: string;
  score?: number;
  comment?: string;
}

export default function RegisterStatusPage() {
  const [players, setPlayers] = useState<Player[]>([
    {
      team: "ส้มตำปูปลาร้า",
      names: ["นางสาวปิยธิดา อันชม", "นางสาวสุขหทัย พลยะเรศ"],
      rank: "N",
      type: "คู่",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slipUrl:
        "https://i.pinimg.com/736x/0c/49/4d/0c494db03ae6c6871c1f3ebe8709e891.jpg",
      status: "รอตรวจสอบ",
      paymentStatus: "รอตรวจสอบ",
    },
    {
      team: "มะเดี่ยว",
      names: ["นางสาวใจดี อวยพร"],
      rank: "BG",
      type: "เดี่ยว",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      slipUrl:
        "https://i.pinimg.com/236x/a0/d4/3b/a0d43b32aa058b89ce717765a957e044.jpg",
      status: "รอตรวจสอบ",
      paymentStatus: "รอตรวจสอบ",
    },
  ]);

  const [selectedRank, setSelectedRank] = useState("BG");
  const [selectedType, setSelectedType] = useState("เดี่ยว");
  const [modalVideo, setModalVideo] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );
  const [videoScore, setVideoScore] = useState<number>(0);

  const handleStatusChange = (
    index: number,
    type: "status" | "payment",
    value: string
  ) => {
    const updated = [...players];
    if (type === "status") {
      updated[index].status = value === "ยืนยัน" ? "ผ่าน" : "ไม่ผ่าน";
    } else {
      updated[index].paymentStatus =
        value === "ยืนยัน" ? "สำเร็จ" : "ไม่สำเร็จ";
    }
    setPlayers(updated);
  };

  const handleConfirmScore = () => {
    if (selectedPlayerIndex !== null) {
      const updated = [...players];
      updated[selectedPlayerIndex].score = videoScore;
      setPlayers(updated);
      setModalVideo(null);
      setSelectedPlayerIndex(null);
      setVideoScore(0);
    }
  };

  const handleCommentChange = (index: number, value: string) => {
    const updated = [...players];
    updated[index].comment = value;
    setPlayers(updated);
  };

  const filteredPlayers = players.filter(
    (p) =>
      (selectedRank === p.rank || !selectedRank) &&
      (selectedType === p.type || !selectedType)
  );

  const groupedPlayers = filteredPlayers.reduce(
    (acc: Record<string, Player[]>, player) => {
      if (!acc[player.team]) acc[player.team] = [];
      acc[player.team].push(player);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8F3] via-[#DDEDFC] to-[#F9F9FF] py-10 px-4 sm:px-6 text-[#2F3E46]">
      <h1 className="text-center text-3xl sm:text-4xl font-bold mb-10 text-[#1E293B] drop-shadow-sm">
        สถานะการสมัคร
      </h1>

      {/* Filter */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">แรงค์</label>
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-teal-400"
          >
            {["BG", "NB", "N", "S", "P-", "P+"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">ประเภท</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-sky-400"
          >
            {["เดี่ยว", "คู่"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ตารางทีม */}
      <div className="max-w-6xl mx-auto space-y-10">
        {Object.entries(groupedPlayers).map(([teamName, members]) => (
          <div
            key={teamName}
            className="rounded-2xl shadow-lg border border-slate-200 bg-gradient-to-br from-[#FFFFFF] to-[#E6F3F9] backdrop-blur-sm"
          >
            {/* หัวทีม */}
            <div className="relative rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#5CD6C0] to-[#6BA8F8]" />
              <div className="relative py-3 text-center text-base sm:text-lg font-semibold text-white tracking-wide z-10">
                ทีม {teamName}
              </div>
            </div>

            <div className="overflow-x-auto rounded-b-2xl">
              <table className="w-full border-collapse text-sm md:text-base text-center min-w-[600px]">
                <thead className="bg-[#E9F5FF] text-[#334155] font-semibold">
                  <tr>
                    <th className="border p-2">ชื่อ–นามสกุล</th>
                    <th className="border p-2">แรงค์</th>
                    <th className="border p-2">ประเภท</th>
                    <th className="border p-2">วิดีโอ</th>
                    <th className="border p-2">คะแนน</th>
                    <th className="border p-2">คอมเมนต์</th>
                    <th className="border p-2">สถานะ</th>
                    <th className="border p-2">รูปภาพการชำระเงิน</th>
                    <th className="border p-2">สถานะการชำระเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((p, i) => {
                    const globalIndex = players.findIndex(
                      (pl) => pl.team === teamName && pl.names[0] === p.names[0]
                    );
                    return (
                      <tr
                        key={i}
                        className="even:bg-slate-50 odd:bg-[#F8FAFF] hover:bg-[#E9F5FF] transition-all"
                      >
                        <td className="border p-2">
                          {p.names.map((n, idx) => (
                            <div key={idx} className="leading-relaxed">
                              {n}
                            </div>
                          ))}
                        </td>
                        <td className="border p-2">{p.rank}</td>
                        <td className="border p-2">{p.type}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => {
                              setModalVideo(p.videoUrl);
                              setSelectedPlayerIndex(globalIndex);
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-md hover:opacity-90 shadow-sm"
                          >
                            ดูวิดีโอ
                          </button>
                        </td>
                        <td className="border p-2 text-pink-700 font-semibold">
                          {p.score ? `${p.score} / 10` : "-"}
                        </td>
                        <td className="border p-2">
                          <textarea
                            value={p.comment || ""}
                            onChange={(e) =>
                              handleCommentChange(globalIndex, e.target.value)
                            }
                            placeholder="เพิ่มความคิดเห็น..."
                            className="w-full h-24 p-2 rounded-xl border border-slate-300 bg-slate-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none shadow-sm"
                          />
                        </td>
                        <td className="border p-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`text-sm font-semibold ${
                                p.status === "ผ่าน"
                                  ? "text-green-600"
                                  : p.status === "ไม่ผ่าน"
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {p.status}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleStatusChange(globalIndex, "status", "ยืนยัน")
                                }
                                className={`px-3 py-1 rounded-lg shadow-sm ${
                                  p.status === "ผ่าน"
                                    ? "bg-green-500 text-white"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                ยืนยัน
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(globalIndex, "status", "ยกเลิก")
                                }
                                className={`px-3 py-1 rounded-lg shadow-sm ${
                                  p.status === "ไม่ผ่าน"
                                    ? "bg-red-500 text-white"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => setModalImage(p.slipUrl)}
                            className="px-3 py-1 bg-gradient-to-r from-[#a882f5] to-[#c874d6] text-white rounded-md hover:opacity-90 shadow-sm"
                          >
                            ดูรูปภาพ
                          </button>
                        </td>
                        <td className="border p-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`text-sm font-semibold ${
                                p.paymentStatus === "สำเร็จ"
                                  ? "text-green-600"
                                  : p.paymentStatus === "ไม่สำเร็จ"
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {p.paymentStatus}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleStatusChange(globalIndex, "payment", "ยืนยัน")
                                }
                                className={`px-3 py-1 rounded-lg shadow-sm ${
                                  p.paymentStatus === "สำเร็จ"
                                    ? "bg-green-500 text-white"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                ยืนยัน
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(globalIndex, "payment", "ยกเลิก")
                                }
                                className={`px-3 py-1 rounded-lg shadow-sm ${
                                  p.paymentStatus === "ไม่สำเร็จ"
                                    ? "bg-red-500 text-white"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Modal วิดีโอ */}
      {modalVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl p-4 w-[90%] md:w-[600px] shadow-xl">
            <button
              onClick={() => {
                setModalVideo(null);
                setSelectedPlayerIndex(null);
                setVideoScore(0);
              }}
              className="absolute -top-4 -right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
            <video src={modalVideo} controls className="rounded-lg w-full mb-4" />
            <div className="text-center">
              <p className="mb-2 font-semibold text-pink-700">
                ให้คะแนนวิดีโอ (1–10)
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[...Array(10)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setVideoScore(idx + 1)}
                    className={`w-8 h-8 rounded-full border ${
                      videoScore === idx + 1
                        ? "bg-pink-500 text-white"
                        : "bg-white hover:bg-pink-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={handleConfirmScore}
                disabled={videoScore === 0}
                className={`mt-4 px-6 py-2 rounded-lg text-white font-semibold transition-all ${
                  videoScore > 0
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal รูปภาพ */}
      {modalImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-xl relative max-w-[90%] md:max-w-lg">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 right-2 bg-gray-400 text-white rounded-full px-3 py-1"
            >
              ✕
            </button>
            <img
              src={modalImage}
              alt="slip"
              className="rounded-lg w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
