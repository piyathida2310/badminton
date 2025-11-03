"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud } from "lucide-react";

export default function RegisterPage() {
  const [mode, setMode] = useState<"single" | "double">("single");
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const ranks = ["BG", "NB", "N", "S", "P-", "P+"];

  // handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideo(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ สมัครสำเร็จแล้ว!");
  };

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
            {["single", "double"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-lg cursor-pointer text-[#5E4B8A]"
              >
                <input
                  type="radio"
                  name="mode"
                  checked={mode === type}
                  onChange={() => setMode(type as "single" | "double")}
                  className="accent-pink-500 w-4 h-4"
                />
                {type === "single" ? "เดี่ยว" : "คู่"}
              </label>
            ))}
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
                placeholder="เช่น Smash Queen"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">ชื่อผู้จัดการทีม</label>
              <input
                type="text"
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
                  placeholder="ชื่อผู้เล่น"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  placeholder="08x-xxx-xxxx"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">วันเกิด</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* ผู้เล่นคนที่ 2 */}
          <AnimatePresence>
            {mode === "double" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
                      placeholder="ชื่อผู้เล่นอีกคน"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-sky-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="08x-xxx-xxxx"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-sky-400 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">วันเกิด</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white/90 focus:ring-2 focus:ring-sky-400 outline-none"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* แรงค์ */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#5E4B8A] mb-3">แรงค์</h2>
          <div className="flex flex-wrap gap-3">
            {ranks.map((rank) => (
              <button
                key={rank}
                type="button"
                onClick={() => setSelectedRank(rank)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedRank === rank
                    ? "bg-gradient-to-r from-[#FBC2EB] to-[#A6C1EE] text-slate-800 shadow"
                    : "bg-white border-gray-200 hover:border-pink-300 text-slate-600"
                }`}
              >
                {rank}
              </button>
            ))}
          </div>
        </section>

        {/* Upload */}
        <section className="mb-8">
          <h2 className="font-bold text-lg text-[#5E4B8A] mb-3">วิดีโอแนะนำตัว</h2>
          <label className="flex flex-col items-center justify-center text-center border-2 border-dashed border-pink-300 rounded-2xl p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
            <UploadCloud className="w-10 h-10 text-pink-400 mb-3" />
            {video ? (
              <p className="font-semibold text-pink-600">{video.name}</p>
            ) : (
              <>
                <p className="font-semibold text-pink-700">
                  อัปโหลดวิดีโอแนะนำตัว
                </p>
                
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
            className="bg-gradient-to-r from-[#C084FC] via-[#F472B6] to-[#FBBF24] text-white font-semibold px-12 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all text-base"
          >
            ลงทะเบียน
          </button>
        </div>
      </form>
    </div>
  );
}
