"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // ✅ เพิ่มตรงนี้

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
}

export default function TournamentPage() {
  const router = useRouter(); // ✅ เพิ่มตรงนี้

  const [tournaments, setTournaments] = useState<Tournament[]>([
    { id: 1, title: "BADMINTON TOURNAMENT", date: "วันที่ 30 กันยายน 2568", image: "/images/poster5.jpg", canceled: false },
    { id: 2, title: "BADMINTON COMPETITION 2025", date: "วันที่ 30 กันยายน 2568", image: "/images/poster2.jpg", canceled: false },
    { id: 3, title: "BADMINTON TOURNAMENT", date: "วันที่ 30 กันยายน 2568", image: "/images/poster3.jpg", canceled: true },
    { id: 4, title: "BADMINTON TOURNAMENT", date: "วันที่ 30 กันยายน 2568", image: "/images/poster4.jpg", canceled: false },
    { id: 5, title: "BADMINTON COMPETITION 2025", date: "วันที่ 30 กันยายน 2568", image: "/images/poster2.jpg", canceled: false },
    { id: 6, title: "BADMINTON TOURNAMENT", date: "วันที่ 30 กันยายน 2568", image: "/images/poster3.jpg", canceled: true },
    { id: 7, title: "BADMINTON 2026", date: "วันที่ 15 ตุลาคม 2569", image: "/images/poster4.jpg", canceled: false },
    { id: 8, title: "BADMINTON CUP 2027", date: "วันที่ 10 ธันวาคม 2570", image: "/images/poster5.jpg", canceled: false },
    { id: 9, title: "INTERNATIONAL OPEN 2028", date: "วันที่ 20 มกราคม 2571", image: "/images/poster2.jpg", canceled: false },
  ]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postersPerPage = 6;

  const handleCancel = (id: number) => {
    setTournaments(prev =>
      prev.map(t => (t.id === id ? { ...t, canceled: !t.canceled } : t))
    );
  };

  // Pagination Logic
  const totalPages = Math.ceil(tournaments.length / postersPerPage);
  const startIndex = (currentPage - 1) * postersPerPage;
  const currentTournaments = tournaments.slice(startIndex, startIndex + postersPerPage);

  // ฟังก์ชันเปลี่ยนหน้า พร้อม scroll top บนมือถือ
  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF6] via-[#F9F6EE] to-[#EDEAE3] px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          รายการแข่งขัน
        </h1>
        <button
          onClick={() => router.push("/manage/manage-match")} // ✅ เพิ่ม onclick เพื่อเปลี่ยนหน้า
          className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 hover:brightness-110 transition-all transform"
        >
          จัดแข่ง
        </button>
      </div>

      {/* Tournament Cards */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {currentTournaments.map(t => (
          <motion.div
            key={t.id}
            whileHover={{ y: -10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative bg-white/40 backdrop-blur-md rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.12),0_5px_20px_rgba(0,0,0,0.05)] overflow-hidden group border border-white/30 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:rotate-[1deg]"
          >
            <div
              className="relative w-full aspect-[4/3] bg-gray-100 rounded-t-3xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(t.image)}
            >
              <Image
                src={t.image}
                alt={t.title}
                fill
                quality={100}
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
              />
              {t.canceled && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md backdrop-blur-sm animate-pulse">
                  ยกเลิก
                </div>
              )}
            </div>

            <div className="p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent transition-colors">
                {t.title}
              </h2>
              <p className="text-gray-500 mb-5">{t.date}</p>
              <button
                onClick={() => handleCancel(t.id)}
                className={`w-full py-3 rounded-xl font-medium shadow-md transition-all duration-300 ${
                  t.canceled
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 hover:brightness-110 text-white"
                }`}
              >
                {t.canceled ? "ยกเลิกแล้ว" : "ยกเลิกจัดแข่ง"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Buttons */}
      <div className="flex justify-center items-center gap-3 mt-10">
        <button
          disabled={currentPage === 1}
          onClick={() => goToPage(Math.max(currentPage - 1, 1))}
          className={`px-4 py-2 rounded-lg font-medium ${
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
            className={`px-4 py-2 rounded-lg font-medium border ${
              currentPage === i + 1
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-transparent shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
          className={`px-4 py-2 rounded-lg font-medium ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600"
          }`}
        >
          ถัดไป
        </button>
      </div>

      {/* Modal แสดงรูปใหญ่ */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="modal"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
              <Image
                src={selectedImage}
                alt="Poster Full"
                width={1600}
                height={1000}
                quality={100}
                sizes="100vw"
                className="max-w-[90vw] max-h-[85vh] rounded-3xl shadow-2xl object-contain border border-white/20"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
