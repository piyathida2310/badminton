"use client";
import React, { useState } from "react";

interface Player {
  team: string;
  name: string;
  rank: string;
  type: string;
  videoUrl: string;
  slipUrl: string;
  status: string;
  paymentStatus: string;
  score?: number;
}

export default function RegisterStatusPage() {
  const [players, setPlayers] = useState<Player[]>([
    {
      team: "ส้มตำปูปลาร้า",
      name: "นางสาวปิยธิดา อันชม",
      rank: "N",
      type: "คู่",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slipUrl:
        "https://i.pinimg.com/736x/0c/49/4d/0c494db03ae6c6871c1f3ebe8709e891.jpg",
      status: "รอตรวจสอบ",
      paymentStatus: "รอตรวจสอบ",
    },
    {
      team: "ส้มตำปูปลาร้า",
      name: "นางสาวสุขหทัย พลยะเรศ",
      rank: "N",
      type: "คู่",
      videoUrl: "https://www.w3schools.com/html/movie.mp4",
      slipUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ1eDkqjkIl6b_O5YOPmbQiShWUXc_aVbx1j3m8APERMf0BakgEA9NCTk6HuUWdHdp_iE&usqp=CAU",
      status: "รอตรวจสอบ",
      paymentStatus: "รอตรวจสอบ",
    },
    {
      team: "มะเดี่ยว",
      name: "นางสาวใจดี อวยพร",
      rank: "BG",
      type: "เดี่ยว",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      slipUrl:
        "https://i.pinimg.com/236x/a0/d4/3b/a0d43b32aa058b89ce717765a957e044.jpg",
      status: "รอตรวจสอบ",
      paymentStatus: "รอตรวจสอบ",
    },
  ]);

  const [modalVideo, setModalVideo] = useState<string | null>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [videoScore, setVideoScore] = useState<number>(0);
  // เพิ่ม state สำหรับกรองแรงค์และประเภท
  const [selectedRank, setSelectedRank] = useState<string>("ทั้งหมด");
  const [selectedType, setSelectedType] = useState<string>("ทั้งหมด");

  // เมื่อกดปุ่ม “ยืนยัน” หรือ “ยกเลิก”
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

  // ตกลงคะแนนวิดีโอ
  const handleConfirmScore = () => {
    if (modalIndex !== null) {
      const updated = [...players];
      updated[modalIndex].score = videoScore;
      setPlayers(updated);
      setModalVideo(null);
      setVideoScore(0);
      setModalIndex(null);
    }
  };

  // กรองข้อมูลตามแรงค์และประเภทที่เลือก
  const filteredPlayers = players.filter(
    (p) =>
      (selectedRank === "ทั้งหมด" || p.rank === selectedRank) &&
      (selectedType === "ทั้งหมด" || p.type === selectedType)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
      <h1
  className=" text-[36px] font-extrabold text-[#2e2d2d] mb-8 text-center"
>
   สถานะการสมัคร 
</h1>










        {/* แถบกรองแรงค์และประเภท */}
        <div className="mt-4 mb-6 flex flex-wrap items-center justify-start gap-3 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">แรงค์</span>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="px-3 py-2 rounded-lg bg-pink-50 border border-pink-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="BG">BG</option>
              <option value="NB">NB</option>
              <option value="N">N</option>
              <option value="S">S</option>
              <option value="P-">P-</option>
              <option value="P+">P+</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">ประเภท</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="เดี่ยว">เดี่ยว</option>
              <option value="คู่">คู่</option>
            </select>
          </div>
        </div>

        {/* -------- ตารางแสดงสถานะการสมัคร -------- */}
<div className="overflow-x-auto">
  {Object.entries(
    filteredPlayers.reduce((acc: Record<string, Player[]>, p) => {
      if (!acc[p.team]) acc[p.team] = [];
      acc[p.team].push(p);
      return acc;
    }, {})
  ).map(([teamName, members]) => (
    <div
      key={teamName}
      className="mb-10 border-4 border-pink-200 rounded-2xl overflow-hidden shadow-lg"
    >
      {/* 🩷 หัวทีม */}
      <h2 className="text-xl font-bold text-center bg-gradient-to-r from-pink-200 to-amber-100 py-3 text-gray-800">
        ทีม {teamName}
      </h2>

      <table className="w-full border-collapse text-sm md:text-base">
        <thead className="bg-gradient-to-r from-pink-100 to-amber-100 text-slate-700">
          <tr>
            <th className="border p-2">ชื่อ-นามสกุล</th>
            <th className="border p-2">แรงค์</th>
            <th className="border p-2">ประเภท</th>
            <th className="border p-2">วิดีโอ</th>
            <th className="border p-2">คะแนน</th>
            <th className="border p-2">สถานะ</th>
            <th className="border p-2">รูปภาพการชำระเงิน</th>
            <th className="border p-2">สถานะการชำระเงิน</th>
          </tr>
        </thead>
        <tbody>
          {members.map((p, i) => (
            <tr
              key={i}
              className="even:bg-rose-50 odd:bg-pink-50 hover:bg-pink-100 transition-all text-center"
            >
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.rank}</td>
              <td className="border p-2">{p.type}</td>

              {/* ปุ่มดูวิดีโอ */}
              <td className="border p-2">
                <button
                  onClick={() => {
                    setModalVideo(p.videoUrl);
                    setModalIndex(players.indexOf(p));
                  }}
                  className="px-3 py-1 bg-pink-400 text-white rounded-lg hover:bg-pink-500"
                >
                  ดูวิดีโอ
                </button>
              </td>

              {/* คะแนน */}
              <td className="border p-2 text-pink-700 font-semibold">
                {p.score ? `${p.score} / 10` : "-"}
              </td>

              {/* สถานะ */}
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
                        handleStatusChange(players.indexOf(p), "status", "ยืนยัน")
                      }
                      className={`px-3 py-1 rounded-lg ${
                        p.status === "ผ่าน"
                          ? "bg-green-500 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      ยืนยัน
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(players.indexOf(p), "status", "ยกเลิก")
                      }
                      className={`px-3 py-1 rounded-lg ${
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

              {/* รูป slip */}
              <td className="border p-2">
                <button
                  onClick={() => setModalImage(p.slipUrl)}
                  className="px-3 py-1 bg-[#c874d6] text-white rounded-lg hover:bg-gray-500"
                >
                  ดูรูปภาพ
                </button>
              </td>

              {/* สถานะการชำระเงิน */}
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
                        handleStatusChange(players.indexOf(p), "payment", "ยืนยัน")
                      }
                      className={`px-3 py-1 rounded-lg ${
                        p.paymentStatus === "สำเร็จ"
                          ? "bg-green-500 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      ยืนยัน
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(players.indexOf(p), "payment", "ยกเลิก")
                      }
                      className={`px-3 py-1 rounded-lg ${
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
          ))}
        </tbody>
      </table>
         </div>
  ))}
</div>
      </div>
      

      {/* Modal วิดีโอ */}
      {modalVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl p-4 w-[90%] md:w-[600px] shadow-xl">
            {/* ปุ่มปิด */}
            <button
              onClick={() => {
                setModalVideo(null);
                setVideoScore(0);
                setModalIndex(null);
              }}
              className="absolute -top-4 -right-4 z-50 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
            <video
              src={modalVideo}
              controls
              className="rounded-lg w-full mb-4"
            />
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
              {videoScore > 0 && (
                <p className="mt-3 text-pink-600 font-medium">
                  คุณให้คะแนน: {videoScore} / 10
                </p>
              )}
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
