"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "../../../../lib/api";
import Photo from "../../../../../components/image";
import { h1 } from "framer-motion/client";
import { error } from "console";
import Swal from "sweetalert2";

interface Tournament {
  id: number;
  title: string;
  date: string;
  image: string;
  canceled: boolean;
  IsOwner : boolean;
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
    const res = await axios.get(`/api/tournament?page=${page}&limit=${limit}`);

    setTournaments(res.data.data || []);

    //  ตั้งจำนวนหน้าทั้งหมดจาก backend
    setTotalPages(res.data.pagination?.totalPages || 1);
  };

  useEffect(() => {
    fetchTournament(currentPage);
  }, [currentPage]);

  const rules = (id: number) => {
    router.push(`/manage/${id}/manage-rules/`);
  };

  
  const handleCancel = async (id: number) => {
  // แจ้งเตือนยืนยันก่อนยกเลิก
  const confirm = await Swal.fire({
    title: "ต้องการยกเลิกรายการจัดแข่งหรือไม่?",
    text: "เมื่อตกลงแล้วจะไม่สามารถย้อนกลับได้",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ตกลง",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#10b981", // สีเขียว (emerald green)
    cancelButtonColor: "#6b7280",
  });

  if (!confirm.isConfirmed) return; // ถ้ากด "ยกเลิก" ให้หยุดตรงนี้

  try {
    await axios.put(`/api/tournament/${id}`);
    fetchTournament(currentPage); // refresh

    // แจ้งเตือนสำเร็จ
    Swal.fire({
      title: "ยกเลิกสำเร็จ!",
      text: "รายการถูกยกเลิกเรียบร้อยแล้ว",
      icon: "success",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#10b981"
    });

  } catch (error: any) {
    console.log(error);

    const message = error.response?.data?.message || "เกิดข้อผิดพลาด";

    Swal.fire({
      title: "ผิดพลาด",
      text: message,
      icon: "error",
      confirmButtonText: "ตกลง",
    });
  }
};



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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-pink-500 drop-shadow-md">
          รายการแข่งขัน
        </h1>
        <button
          onClick={() => router.push("/manage/manage-match")}
          className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:scale-105 hover:brightness-110 transition-all transform"
        >
          จัดแข่ง
        </button>
      </div>

      {/* Tournament Cards */}
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
                onClick={() => rules(t.id)}
                className="text-base sm:text-lg font-semibold text-gray-800 mb-1 group-hover:text-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text transition-colors"
              >
                {t.title}
              </h2>

              <p className="text-gray-500 mb-3 text-sm">
                วันที่ {formatThaiDate(t.date)}
              </p>

              <button
                disabled={t.canceled}
                onClick={t.IsOwner? () => handleCancel(t.id):() => null}
                className={`w-full py-2 rounded-lg font-medium shadow-sm transition-all duration-300 text-sm ${
                  t.IsOwner  ? t.canceled? "bg-gray-400 cursor-not-allowed text-gray-200":"bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 hover:brightness-110 text-white"
                    :"bg-gray-400 cursor-not-allowed text-gray-200"
                }`}
              >
                {t.IsOwner === true? t.canceled?"ยกเลิกสำเร็จ":"ยกเลิกรายการจัดแข่ง":"คุณไม่สามารถยกเลิกได้"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {
        tournaments.length >0 ? 
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
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
                  ? "bg-pink-500"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className={`px-3 py-1.5 rounded-md font-medium text-sm ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600"
            }`}
          >
            ถัดไป
          </button>
        </div>:<h1 className="text-center mt-36 text-gray-500 text-xl">ไม่มีรายการ</h1>
      }

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
