"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
}

export default function TournamentPage() {
  const router = useRouter();

  // 🧩 mock data จำนวนมากไว้ทดสอบ pagination
  const [tournaments] = useState<Tournament[]>([
    { id: 1, title: "BADMINTON TOURNAMENT 2025", date: "วันที่ 30 กันยายน 2568", image: "/images/poster5.jpg", canceled: false },
    { id: 2, title: "BADMINTON CUP 2025", date: "วันที่ 5 ตุลาคม 2568", image: "/images/poster2.jpg", canceled: false },
    { id: 3, title: "SMASH BATTLE 2025", date: "วันที่ 10 พฤศจิกายน 2568", image: "/images/poster3.jpg", canceled: false },
    { id: 4, title: "NET KING CHALLENGE", date: "วันที่ 15 ธันวาคม 2568", image: "/images/poster4.jpg", canceled: false },
    { id: 5, title: "DROP SHOT LEAGUE", date: "วันที่ 20 ธันวาคม 2568", image: "/images/poster5.jpg", canceled: true },
    { id: 6, title: "POWER DRIVE OPEN", date: "วันที่ 10 มกราคม 2569", image: "/images/poster2.jpg", canceled: false },
    { id: 7, title: "SHUTTLE CUP", date: "วันที่ 22 กุมภาพันธ์ 2569", image: "/images/poster3.jpg", canceled: false },
    { id: 8, title: "NET MASTER CHAMPIONSHIP", date: "วันที่ 15 มีนาคม 2569", image: "/images/poster4.jpg", canceled: false },
    { id: 9, title: "RISING STAR SERIES", date: "วันที่ 10 เมษายน 2569", image: "/images/poster5.jpg", canceled: false },
    { id: 10, title: "BADMINTON OPEN 2026", date: "วันที่ 1 พฤษภาคม 2569", image: "/images/poster2.jpg", canceled: false },
    { id: 11, title: "SUMMER CUP 2026", date: "วันที่ 30 มิถุนายน 2569", image: "/images/poster3.jpg", canceled: true },
    { id: 12, title: "SKY SMASH INVITATIONAL", date: "วันที่ 15 กรกฎาคม 2569", image: "/images/poster4.jpg", canceled: false },
    { id: 13, title: "INTERNATIONAL OPEN 2026", date: "วันที่ 10 สิงหาคม 2569", image: "/images/poster5.jpg", canceled: false },
    { id: 14, title: "FUTURE STAR TOURNAMENT", date: "วันที่ 20 กันยายน 2569", image: "/images/poster2.jpg", canceled: false },
    { id: 15, title: "KING OF COURT 2026", date: "วันที่ 30 ตุลาคม 2569", image: "/images/poster3.jpg", canceled: false },
  ]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 🔹 Pagination settings
  const [currentPage, setCurrentPage] = useState(1);
  const postersPerPage = 6;

  const totalPages = Math.ceil(tournaments.length / postersPerPage);
  const startIndex = (currentPage - 1) * postersPerPage;
  const currentTournaments = tournaments.slice(startIndex, startIndex + postersPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF6] via-[#F9F6EE] to-[#EDEAE3] px-6 py-10">
      <h1 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        รายการแข่งขัน
      </h1>

      {/* ตรวจสอบว่ามีข้อมูลไหม */}
      {tournaments.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">ยังไม่มีข้อมูลการแข่งขัน</p>
      ) : (
        <>
          {/* 🏸 แสดงรายการการแข่งขัน */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {currentTournaments.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative bg-white/40 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden group border border-white/20"
              >
                <div
                  className="relative w-full aspect-[4/3] cursor-pointer"
                  onClick={() => setSelectedImage(t.image)}
                >
                  <Image
                    src={t.image}
                    alt={t.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {t.canceled && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                      ยกเลิก
                    </div>
                  )}
                </div>

                <div className="p-4 text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">{t.title}</h2>
                  <p className="text-gray-500 mb-3 text-sm">{t.date}</p>

                  <button
                    onClick={() => router.push(`/user/tournament/${t.id}`)}
                    disabled={t.canceled}
                    className={`w-full py-2 rounded-lg font-medium text-sm shadow-sm transition-all ${
                      t.canceled
                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 hover:brightness-110 text-white"
                    }`}
                  >
                    {t.canceled ? "ไม่สามารถเข้าร่วมได้" : "เข้าร่วมการแข่งขัน"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/*  Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(Math.max(currentPage - 1, 1))}
              className={`px-3 py-1.5 rounded-md font-medium text-sm ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600"
              }`}
            >
              ก่อนหน้า
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1.5 rounded-md font-medium text-sm border ${
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-transparent shadow"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
              className={`px-3 py-1.5 rounded-md font-medium text-sm ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600"
              }`}
            >
              ถัดไป
            </button>
          </div>
        </>
      )}

      {/* Modal แสดงรูปใหญ่ */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <Image
              src={selectedImage}
              alt="Poster Full"
              width={1200}
              height={800}
              className="max-w-[90vw] max-h-[85vh] rounded-3xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
