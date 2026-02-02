"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "../../../../../../lib/api";
import Swal from "sweetalert2";

interface Tournament {
  id: number;
  name: string;
  playType: string;
  rank: string[];
  maxPlayers: number;
  currentPlayers: number;
}

export default function RegisterPage() {
  const { id } = useParams();
  const router = useRouter();

  const [mode, setMode] = useState<"single" | "double">("single");
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);

  const [formData, setFormData] = useState({
    teamName: "",
    managerName: "",
    player1Name: "",
    player1Phone: "",
    player1Birthday: "",
    player1Gender: "",
    player2Name: "",
    player2Phone: "",
    player2Birthday: "",
    player2Gender: "",
  });

  // Fetch tournament data
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`/api/tournament/${id}`);
        const t = response.data.data as Tournament;
        setTournament(t);

        if ((t.currentPlayers || 0) >= (t.maxPlayers || 0)) {
          setIsFull(true);
        }

        if (t.playType === "SINGLE") setMode("single");
        if (t.playType === "DOUBLE") setMode("double");
      } catch (error) {
        console.error("Failed to fetch tournament:", error);
        Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: "ไม่สามารถโหลดข้อมูลการแข่งขันได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonText: "ตกลง",
        });
      } finally {
        setTournamentLoading(false);
      }
    };

    if (id) fetchTournament();
  }, [id]);

  // handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form
  const isFormValid = () => {
    const baseValid =
      formData.teamName &&
      formData.managerName &&
      formData.player1Name &&
      formData.player1Phone &&
      formData.player1Birthday &&
      formData.player1Gender &&
      selectedRank &&
      tournament;

    const requiresDouble = tournament && tournament.playType === "DOUBLE";

    if (requiresDouble) {
      return (
        baseValid &&
        formData.player2Name &&
        formData.player2Phone &&
        formData.player2Birthday &&
        formData.player2Gender
      );
    }

    return baseValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 1) กรอกไม่ครบ → Swal
    if (!isFormValid()) {
      await Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: "❌ กรุณากรอกข้อมูลให้ครบถ้วนก่อนลงทะเบียน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ✅ 2) ยืนยันก่อนส่ง
    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการลงทะเบียน",
      text: "ต้องการยืนยันการลงทะเบียนใช่หรือไม่",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",

      reverseButtons: true,      // ✅ ยืนยันอยู่ซ้าย (มาก่อน)
      focusConfirm: true,        // ✅ โฟกัสที่ยืนยัน (แนะนำ)
      // focusCancel: true,       // ❌ เอาออก
    });


    if (!confirm.isConfirmed) return;

    setLoading(true);

    // ✅ 3) ระหว่างส่ง → Loading Swal
    Swal.fire({
      title: "กำลังลงทะเบียน...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("teamName", formData.teamName);
      formDataToSend.append("managerName", formData.managerName);
      formDataToSend.append("player1Name", formData.player1Name);
      formDataToSend.append("player1Phone", formData.player1Phone);
      formDataToSend.append("player1Birthday", formData.player1Birthday);
      formDataToSend.append("player1Gender", formData.player1Gender);

      // (ของเดิมคุณใส่ playType = selectedRank แปลกนิดหน่อย แต่พี่คงไว้ตามเดิม)
      formDataToSend.append("playType", selectedRank!);
      formDataToSend.append(
        "mode",
        tournament?.playType === "SINGLE" ? "single" : "double"
      );

      if (tournament?.playType === "DOUBLE") {
        formDataToSend.append("player2Name", formData.player2Name);
        formDataToSend.append("player2Phone", formData.player2Phone);
        formDataToSend.append("player2Birthday", formData.player2Birthday);
        formDataToSend.append("player2Gender", formData.player2Gender);
      }

      if (video) {
        formDataToSend.append("video", video, video.name);
      }

      const response = await axios.post(
        `/api/tournament/${id}/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

      if (response.status === 201) {
        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "สมัครสำเร็จ",
          text: "สมัครเรียบร้อยแล้ว กำลังพาไปหน้ากติกาการแข่งขัน",
          confirmButtonText: "ไปต่อ",
        });

        router.push(`/user/match-rules?id=${id}`);
      } else {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: "สมัครไม่สำเร็จ",
          text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error: any) {
      Swal.close();

      const errorMessage =
        error.response?.data?.message ||
        "เกิดข้อผิดพลาดในการสมัคร กรุณาลองใหม่อีกครั้ง";

      await Swal.fire({
        icon: "error",
        title: "สมัครไม่สำเร็จ",
        text: `❌ ${errorMessage}`,
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isFull) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#F6E2FF] via-[#FEE5F1] to-[#E2F1FF] p-6">
        <div className="w-full max-w-lg bg-white/85 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-red-500 mb-4">
            ขออภัย การสมัครเต็มแล้ว
          </h1>
          <p className="text-gray-600 mb-8">
            จำนวนผู้สมัครครบตามที่กำหนดแล้ว ไม่สามารถรับสมัครเพิ่มได้
          </p>
          <button
            onClick={() => router.push("/user/tournament")}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold px-8 py-3 rounded-full hover:scale-105 transition-all"
          >
            กลับหน้ารายการแข่งขัน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#F6E2FF] via-[#FEE5F1] to-[#E2F1FF] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white/85 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_0_40px_rgba(150,100,255,0.25)] p-8 md:p-10"
      >
        {/* Header */}
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-[#5E4B8A] mb-10 flex items-center justify-center gap-3">
          สมัครการแข่งขันแบดมินตัน
        </h1>

        {/* ประเภทการแข่งขัน */}
        <section className="mb-8">
          <label className="block text-gray-800 font-semibold mb-3 text-base">
            ประเภทการแข่งขัน
          </label>
          <div className="flex gap-8">
            {tournamentLoading ? (
              <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : tournament ? (
              <label className="flex items-center gap-2 text-lg cursor-pointer text-[#5E4B8A]">
                <input
                  type="radio"
                  name="mode"
                  checked={
                    mode ===
                    (tournament.playType === "SINGLE" ? "single" : "double")
                  }
                  onChange={() => { }}
                  className="accent-pink-500 w-4 h-4"
                  disabled
                />
                {tournament.playType === "SINGLE" ? "เดี่ยว" : "คู่"}
              </label>
            ) : (
              <div className="text-red-500">ไม่สามารถโหลดข้อมูลการแข่งขันได้</div>
            )}
          </div>
        </section>

        {/* ข้อมูลทีม */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#5E4B8A] mb-3">ข้อมูลทีม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <label className="block mb-1 font-medium">ชื่อทีม</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
                placeholder="เช่น Smash Queen"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">ชื่อผู้จัดการทีม</label>
              <input
                type="text"
                name="managerName"
                value={formData.managerName}
                onChange={handleInputChange}
                placeholder="ชื่อจริง–นามสกุล"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
            </div>
          </div>
        </section>

        {/* ข้อมูลผู้เล่น */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#5E4B8A] mb-3">ข้อมูลผู้เล่น</h2>

          {/* ผู้เล่นคนที่ 1 */}
          <div className="bg-[#FBC9DC]/70 border border-[#F7A2BC] rounded-2xl p-5 mb-6 shadow-sm hover:shadow-md transition-all">
            <p className="font-semibold text-[#4A3C7A] mb-3 text-base">
              ผู้เล่นคนที่ 1
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <label className="block mb-1 font-medium">ชื่อ–นามสกุล</label>
                <input
                  type="text"
                  name="player1Name"
                  value={formData.player1Name}
                  onChange={handleInputChange}
                  placeholder="ชื่อผู้เล่น"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  name="player1Phone"
                  value={formData.player1Phone}
                  onChange={handleInputChange}
                  placeholder="08x-xxx-xxxx"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">วันเกิด</label>
                <input
                  type="date"
                  name="player1Birthday"
                  value={formData.player1Birthday}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">เพศ</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, player1Gender: "Male" })}
                    className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player1Gender === "Male"
                      ? "bg-blue-100 border-blue-400 text-blue-700 shadow-sm ring-2 ring-blue-200"
                      : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                      }`}
                  >
                    ชาย
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, player1Gender: "Female" })}
                    className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player1Gender === "Female"
                      ? "bg-pink-100 border-pink-400 text-pink-700 shadow-sm ring-2 ring-pink-200"
                      : "bg-white border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-600"
                      }`}
                  >
                    หญิง
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ผู้เล่นคนที่ 2 */}
          {tournament?.playType === "DOUBLE" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#D6E6FF]/80 border border-[#9CC5FF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="font-semibold text-[#364C8A] mb-3 text-base">
                ผู้เล่นคนที่ 2
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block mb-1 font-medium">ชื่อ–นามสกุล</label>
                  <input
                    type="text"
                    name="player2Name"
                    value={formData.player2Name}
                    onChange={handleInputChange}
                    placeholder="ชื่อผู้เล่นอีกคน"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-sky-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    name="player2Phone"
                    value={formData.player2Phone}
                    onChange={handleInputChange}
                    placeholder="08x-xxx-xxxx"
                    maxLength={10}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-sky-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">วันเกิด</label>
                  <input
                    type="date"
                    name="player2Birthday"
                    value={formData.player2Birthday}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-sky-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">เพศ</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, player2Gender: "Male" })}
                      className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player2Gender === "Male"
                        ? "bg-blue-100 border-blue-400 text-blue-700 shadow-sm ring-2 ring-blue-200"
                        : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                        }`}
                    >
                      ชาย
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, player2Gender: "Female" })}
                      className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player2Gender === "Female"
                        ? "bg-pink-100 border-pink-400 text-pink-700 shadow-sm ring-2 ring-pink-200"
                        : "bg-white border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-600"
                        }`}
                    >
                      หญิง
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* แรงค์ */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#5E4B8A] mb-3">ประเภทมือ</h2>
          <div className="flex flex-wrap gap-3">
            {tournamentLoading ? (
              <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : tournament && tournament.rank.length > 0 ? (
              tournament.rank.map((rank) => (
                <button
                  key={rank}
                  type="button"
                  onClick={() => setSelectedRank(rank)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${selectedRank === rank
                    ? "bg-gradient-to-r from-[#FBC2EB] to-[#A6C1EE] text-slate-800 shadow"
                    : "bg-white border-gray-200 hover:border-pink-300 text-slate-600"
                    }`}
                >
                  {rank === "P_PLUS" ? "P+" : rank === "P_MINUS" ? "P-" : rank}
                </button>
              ))
            ) : (
              <div className="text-red-500">ไม่มีข้อมูลประเภทมือ</div>
            )}
          </div>
        </section>

        {/* Upload */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#5E4B8A] mb-3">วิดีโอการเล่น</h2>
          <label className="flex flex-col items-center justify-center text-center border-2 border-dashed border-pink-300 rounded-2xl p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
            <UploadCloud className="w-10 h-10 text-pink-400 mb-3" />
            {video ? (
              <p className="font-semibold text-pink-600">{video.name}</p>
            ) : (
              <>
                <p className="font-semibold text-pink-700">อัปโหลดวิดีโอการเล่น</p>
                <p className="text-xs text-gray-500 mt-1">รองรับไฟล์วิดีโอทุกประเภท</p>
              </>
            )}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </section>

        {/* ปุ่มลงทะเบียน */}
        <div className="flex justify-center mt-10">
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`bg-gradient-to-r from-[#C084FC] via-[#F472B6] to-[#FBBF24] text-white font-semibold px-12 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all text-base ${(!isFormValid() || loading) && "opacity-50 cursor-not-allowed"
              }`}
          >
            {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
          </button>
        </div>
      </form>
    </div>
  );
}
