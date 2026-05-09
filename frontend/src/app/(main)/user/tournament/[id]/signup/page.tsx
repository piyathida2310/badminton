"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "../../../../../../lib/api";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th, enUS } from "date-fns/locale";

registerLocale("th", th);
registerLocale("en", enUS);

interface Tournament {
  id: number;
  name: string;
  playType: string;
  rank: string[];
  maxPlayers: number;
  currentPlayers: number;
  registrationStats: Record<string, number>;
}

export default function RegisterPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<"single" | "double">("single");
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);

  const player1BirthdayRef = useRef<HTMLInputElement>(null);
  const player2BirthdayRef = useRef<HTMLInputElement>(null);

  const calculateAge = (birthday: string): number => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

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
        const response = await axios.get(`/tournament/${id}`);
        const t = response.data.data as Tournament;
        setTournament(t);

        // Check if all ranks are full
        const ranks = t.rank || [];
        const isAllFull = ranks.length > 0
          ? ranks.every(r => (t.registrationStats?.[r] || 0) >= (t.maxPlayers || 0))
          : (t.currentPlayers || 0) >= (t.maxPlayers || 0);

        setIsFull(isAllFull);

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
    const { name, value } = e.target;
    // อนุญาตเฉพาะตัวเลขสำหรับเบอร์โทรศัพท์
    if (name === "player1Phone" || name === "player2Phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        [name]: numericValue,
      });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
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
      tournament &&
      video;

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
      reverseButtons: true,
      focusConfirm: true,

      customClass: {
        actions: "flex-row-reverse", // บังคับสลับลำดับปุ่ม
      },
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
        `/tournament/${id}/register`,
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

        router.push(`/user/tournament/${id}/match-rules`);
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#2ED3B7]/10 via-white to-[#194185]/5 p-6">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-[#2ED3B7]/20 rounded-[2rem] shadow-xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-red-500 mb-4">
            {t('signup.fullMessage')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('signup.fullDesc')}
          </p>
          <button
            onClick={() => router.push("/user/tournament")}
            className="bg-[#194185] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#2ED3B7] transition-all"
          >
            {t('signup.backToTournament')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#2ED3B7]/10 via-white to-[#194185]/5 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-[#2ED3B7]/20 rounded-[2rem] shadow-2xl p-8 md:p-10"
      >
        {/* Header */}
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-[#194185] mb-10 flex items-center justify-center gap-3">
          {t('signup.pageTitle')}
        </h1>

        {/* ประเภทการแข่งขัน */}
        <section className="mb-8">
          <label className="block text-gray-800 font-semibold mb-3 text-base">
            {t('signup.competitionType')}
          </label>
          <div className="flex gap-8">
            {tournamentLoading ? (
              <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : tournament ? (
              <label className="flex items-center gap-2 text-lg cursor-pointer text-[#194185]">
                <input
                  type="radio"
                  name="mode"
                  checked={
                    mode ===
                    (tournament.playType === "SINGLE" ? "single" : "double")
                  }
                  onChange={() => { }}
                  className="accent-[#2ED3B7] w-4 h-4"
                  disabled
                />
                {tournament.playType === "SINGLE" ? t('signup.single') : t('signup.double')}
              </label>
            ) : (
              <div className="text-red-500">ไม่สามารถโหลดข้อมูลการแข่งขันได้</div>
            )}
          </div>
        </section>

        {/* ข้อมูลทีม */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#194185] mb-3">{t('signup.teamInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <label className="block mb-1 font-medium">{t('signup.teamName')}</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
                placeholder={language === "en" ? "e.g. Smash Queen" : "เช่น Smash Queen"}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-[#2ED3B7] outline-none"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">{t('signup.managerName')}</label>
              <input
                type="text"
                name="managerName"
                value={formData.managerName}
                onChange={handleInputChange}
                placeholder={language === "en" ? "First Name - Last Name" : "ชื่อจริง–นามสกุล"}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-[#2ED3B7] outline-none"
                required
              />
            </div>
          </div>
        </section>

        {/* ข้อมูลผู้เล่น */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#194185] mb-3">{t('signup.playerInfo')}</h2>

          {/* ผู้เล่นคนที่ 1 */}
          <div className="bg-[#194185]/5 border border-[#194185]/10 rounded-2xl p-5 mb-6 shadow-sm hover:shadow-md transition-all">
            <p className="font-semibold text-[#194185] mb-3 text-base">
              {t('signup.player1')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <label className="block mb-1 font-medium">{t('signup.fullname')}</label>
                <input
                  type="text"
                  name="player1Name"
                  value={formData.player1Name}
                  onChange={handleInputChange}
                  placeholder={language === "en" ? "Player Name" : "ชื่อผู้เล่น"}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-[#2ED3B7] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('signup.phone')}</label>
                <input
                  type="text"
                  name="player1Phone"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.player1Phone}
                  onChange={handleInputChange}
                  placeholder="08x-xxx-xxxx"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-[#2ED3B7] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('signup.age')}</label>
                {/* DatePicker แทน input type="date" เดิม */}
                <DatePicker
                  selected={formData.player1Birthday ? new Date(formData.player1Birthday + "T00:00:00") : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const offset = date.getTimezoneOffset() * 60000;
                      const d = new Date(date.getTime() - offset).toISOString().split("T")[0];
                      setFormData({ ...formData, player1Birthday: d });
                    } else {
                      setFormData({ ...formData, player1Birthday: "" });
                    }
                  }}
                  locale={language === "en" ? "en" : "th"}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  shouldCloseOnSelect={true}
                  placeholderText={language === "en" ? "Select Birthday Date" : "เลือกวันเกิด"}
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => {
                    const months = language === "en" ? [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ] : [
                      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
                    ];
                    // สร้างรายชื่อปีเกิดย้อนหลังไป 100 ปี เรียงจากปัจจุบันไปอดีต
                    const currentYear = new Date().getFullYear();
                    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
                    return (
                      <div className="flex justify-between items-center px-4 py-1 bg-white">
                        <button
                          onClick={(e) => { e.preventDefault(); decreaseMonth(); }}
                          disabled={prevMonthButtonDisabled}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={months[date.getMonth()]}
                            onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                            className="font-semibold text-slate-700 bg-transparent rounded-md px-1 py-1 text-[15px] outline-none cursor-pointer hover:bg-slate-50 transition-all border-none"
                          >
                            {months.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <select
                            value={date.getFullYear()}
                            onChange={({ target: { value } }) => changeYear(Number(value))}
                            className="font-semibold text-slate-700 bg-transparent rounded-md px-1 py-1 text-[15px] outline-none cursor-pointer hover:bg-slate-50 transition-all border-none"
                          >
                            {years.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); increaseMonth(); }}
                          disabled={nextMonthButtonDisabled}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    );
                  }}
                  className="w-full border border-[#194185]/20 rounded-xl px-4 py-2 bg-white text-[#194185] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2ED3B7] hover:shadow-md cursor-pointer"
                />
                {formData.player1Birthday && (
                  <p className="text-xs text-[#194185]/60 mt-1">
                    {t('signup.age')}: {calculateAge(formData.player1Birthday)} {language === "en" ? "Years old" : "ปี"}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">{t('signup.gender')}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, player1Gender: "Male" })}
                    className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player1Gender === "Male"
                      ? "bg-[#194185]/10 border-[#194185]/40 text-[#194185] shadow-sm ring-2 ring-[#194185]/20"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#194185]/30 hover:text-[#194185]"
                      }`}
                  >
                    {t('signup.male')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, player1Gender: "Female" })}
                    className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player1Gender === "Female"
                      ? "bg-[#2ED3B7]/10 border-[#2ED3B7] text-[#194185] shadow-sm ring-2 ring-[#2ED3B7]/20"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#2ED3B7] hover:text-[#2ED3B7]"
                      }`}
                  >
                    {t('signup.female')}
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
              className="bg-[#194185]/5 border border-[#194185]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="font-semibold text-[#194185] mb-3 text-base">
                ผู้เล่นคนที่ 2
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block mb-1 font-medium">{t('signup.fullname')}</label>
                  <input
                    type="text"
                    name="player2Name"
                    value={formData.player2Name}
                    onChange={handleInputChange}
                    placeholder={language === "en" ? "Player Name" : "ชื่อผู้เล่นอีกคน"}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-[#2ED3B7] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t('signup.phone')}</label>
                  <input
                    type="text"
                    name="player2Phone"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.player2Phone}
                    onChange={handleInputChange}
                    placeholder="08x-xxx-xxxx"
                    maxLength={10}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-[#2ED3B7] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t('signup.age')}</label>
                  <DatePicker
                    selected={formData.player2Birthday ? new Date(formData.player2Birthday + "T00:00:00") : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const offset = date.getTimezoneOffset() * 60000;
                        const d = new Date(date.getTime() - offset).toISOString().split("T")[0];
                        setFormData({ ...formData, player2Birthday: d });
                      } else {
                        setFormData({ ...formData, player2Birthday: "" });
                      }
                    }}
                    locale={language === "en" ? "en" : "th"}
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    shouldCloseOnSelect={true}
                    placeholderText={language === "en" ? "Select Birthday Date" : "เลือกวันเกิด"}
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => {
                      const months = language === "en" ? [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ] : [
                        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
                      ];
                      // สร้างรายชื่อปีเกิดย้อนหลังไป 100 ปี เรียงจากปัจจุบันไปอดีต
                      const currentYear = new Date().getFullYear();
                      const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
                      return (
                        <div className="flex justify-between items-center px-4 py-1 bg-white">
                          <button
                            onClick={(e) => { e.preventDefault(); decreaseMonth(); }}
                            disabled={prevMonthButtonDisabled}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={months[date.getMonth()]}
                              onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                              className="font-semibold text-slate-700 bg-transparent rounded-md px-1 py-1 text-[15px] outline-none cursor-pointer hover:bg-slate-50 transition-all border-none"
                            >
                              {months.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <select
                              value={date.getFullYear()}
                              onChange={({ target: { value } }) => changeYear(Number(value))}
                              className="font-semibold text-slate-700 bg-transparent rounded-md px-1 py-1 text-[15px] outline-none cursor-pointer hover:bg-slate-50 transition-all border-none"
                            >
                              {years.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); increaseMonth(); }}
                            disabled={nextMonthButtonDisabled}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                          </button>
                        </div>
                      );
                    }}
                    className="w-full border border-[#194185]/20 rounded-xl px-4 py-2 bg-white text-[#194185] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2ED3B7] hover:shadow-md cursor-pointer"
                  />
                  {formData.player2Birthday && (
                    <p className="text-xs text-[#194185]/60 mt-1">
                      {t('signup.age')}: {calculateAge(formData.player2Birthday)} {language === "en" ? "Years old" : "ปี"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">{t('signup.gender')}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, player2Gender: "Male" })}
                      className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player2Gender === "Male"
                        ? "bg-[#194185]/10 border-[#194185]/40 text-[#194185] shadow-sm ring-2 ring-[#194185]/20"
                        : "bg-white border-gray-200 text-gray-500 hover:border-[#194185]/30 hover:text-[#194185]"
                        }`}
                    >
                      {t('signup.male')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, player2Gender: "Female" })}
                      className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${formData.player2Gender === "Female"
                        ? "bg-[#2ED3B7]/10 border-[#2ED3B7] text-[#194185] shadow-sm ring-2 ring-[#2ED3B7]/20"
                        : "bg-white border-gray-200 text-gray-500 hover:border-[#2ED3B7] hover:text-[#2ED3B7]"
                        }`}
                    >
                      {t('signup.female')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* แรงค์ */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#194185] mb-3">{t('signup.rankType')}</h2>
          <div className="flex flex-wrap gap-3">
            {tournamentLoading ? (
              <div className="text-gray-500">{t('signup.loading')}</div>
            ) : tournament && tournament.rank.length > 0 ? (
              tournament.rank.map((rank) => {
                const count = tournament.registrationStats?.[rank] || 0;
                const isRankFull = count >= tournament.maxPlayers;

                return (
                  <button
                    key={rank}
                    type="button"
                    disabled={isRankFull}
                    onClick={() => !isRankFull && setSelectedRank(rank)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${isRankFull
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : selectedRank === rank
                        ? "bg-[#194185] text-white shadow-lg scale-105"
                        : "bg-white border-gray-200 hover:border-[#2ED3B7] text-[#194185]"
                      }`}
                  >
                    {rank === "P_PLUS" ? "P+" : rank === "P_MINUS" ? "P-" : rank}
                    {isRankFull && " (" + t('signup.full') + ")"}
                  </button>
                );
              })
            ) : (
              <div className="text-red-500">{t('signup.noRank')}</div>
            )}
          </div>
        </section>

        {/* Upload */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#194185] mb-3">{t('signup.video')}</h2>
          <label className="flex flex-col items-center justify-center text-center border-2 border-dashed border-[#194185]/20 rounded-2xl p-6 bg-[#194185]/5 hover:bg-[#194185]/10 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
            <UploadCloud className="w-10 h-10 text-[#194185]/40 mb-3" />
            {video ? (
              <p className="font-semibold text-[#194185]">{video.name}</p>
            ) : (
              <>
                <p className="font-semibold text-[#194185]">{t('signup.uploadVideo')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('signup.videoFormats')}</p>
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
            className={`bg-[#194185] hover:bg-[#2ED3B7] text-white font-bold px-12 py-3.5 rounded-full shadow-lg hover:scale-105 transition-all text-base ${(!isFormValid() || loading) && "opacity-50 cursor-not-allowed"
              }`}
          >
            {loading ? t('signup.registering') : t('signup.registerBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
