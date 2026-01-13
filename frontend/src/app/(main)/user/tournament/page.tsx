"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "../../../../lib/api";
import Photo from "../../../../../components/image";

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
  currentPlayers: number;
  maxPlayers: number;
}

export default function TournamentPage() {
  const router = useRouter();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  //  Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const [totalPages, setTotalPages] = useState(1);

  //  โหลดข้อมูลจาก backend แบบมี pagination
  const fetchTournament = async (page = 1) => {
    try {
      const res = await axios.get(`/api/tournament?page=${page}&limit=${limit}`);
      setTournaments(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch tournaments", error);
    }
  };

  useEffect(() => {
    fetchTournament(currentPage);
  }, [currentPage]);

  function formatThaiDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF6] via-[#F9F6EE] to-[#EDEAE3] px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-center items-center mb-10 gap-4">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          รายการแข่งขัน
        </h1>
      </div>

      {/* Tournament Cards */}
      {tournaments.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">ยังไม่มีข้อมูลการแข่งขัน</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative bg-white/30 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden group border border-white/20 transition-all duration-300 hover:shadow-lg hover:rotate-[0.5deg]"
              >
                <div
                  className="relative w-full aspect-[4/3] bg-gray-100 rounded-t-2xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(t.image)}
                >
                  <Photo
                    src={t.image}
                    alt={t.title}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {t.canceled && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm animate-pulse">
                      ยกเลิก
                    </div>
                  )}
                </div>

                <div className="p-4 text-center">
                  <h2
                    onClick={() => router.push(`/user/tournament/${t.id}`)}
                    className="text-base sm:text-lg font-semibold text-gray-800 mb-1 group-hover:text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text transition-colors cursor-pointer"
                  >
                    {t.title}
                  </h2>

                  <p className="text-gray-500 mb-3 text-sm">
                    วันที่ {formatThaiDate(t.date)}
                  </p>

                  {(() => {
                    const isFull = (t.currentPlayers || 0) >= (t.maxPlayers || 0);
                    const isDisabled = t.canceled || isFull;

                    return (
                      <button
                        onClick={() => !isDisabled && router.push(`/user/tournament/${t.id}`)}
                        disabled={isDisabled}
                        className={`w-full py-2 rounded-lg font-medium text-sm shadow-sm transition-all ${isDisabled
                          ? "bg-gray-400 cursor-not-allowed text-gray-200"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 hover:brightness-110 text-white"
                          }`}
                      >
                        {t.canceled
                          ? "ไม่สามารถเข้าร่วมได้"
                          : isFull
                            ? "เต็มจำนวน"
                            : "เข้าร่วมการแข่งขัน"}
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(Math.max(currentPage - 1, 1))}
              className={`px-3 py-1.5 rounded-md font-medium text-sm ${currentPage === 1
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
                className={`px-3 py-1.5 rounded-md font-medium text-sm border ${currentPage === i + 1
                  ? "bg-pink-500"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
              className={`px-3 py-1.5 rounded-md font-medium text-sm ${currentPage === totalPages
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
              <Photo
                src={selectedImage}
                alt="Poster Full"
                className="w-[90vw] h-[85vh] rounded-3xl shadow-2xl object-contain border border-white/20"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
