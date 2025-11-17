"use client";

import { motion } from "framer-motion";

export default function Form({
  date,
  setDate,
  location,
  tournamentName,
  setTournamentName,
  setLocation,
  shuttlecockPrice,
  setShuttlecockPrice,
  ranks,
  setRanks,
  types,
  setTypes,
  bracketLines,
  setBracketLines,
  people,
  setPeople,
  handleUpload,
  posterPreview,
  qrPreview,
  handleNext,
  isFormComplete,
  levelOptions,
  toggleValue,
}: any) {
  return (
    <motion.div
      key="organize"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-[90%] max-w-4xl 
      bg-[#FFEAF4] text-slate-800 shadow-[0_10px_60px_rgba(0,0,0,0.15)]
      backdrop-blur-xl rounded-3xl border border-slate-200 
      overflow-hidden flex flex-col 
      max-sm:w-full max-sm:rounded-2xl py-8 mt-12 mb-16 transition-all duration-500"
    >
      <div className="px-6 py-4 border-b border-slate-200/60 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow">
          จัดการแข่งขันแบดมินตัน
        </h1>
      </div>

      {/* 🌸 ฟอร์มเนื้อหาหลัก */}
      <div className="p-6 grid gap-6 md:grid-cols-2 text-slate-700 overflow-y-auto max-h-[55vh] scrollbar-thin scrollbar-thumb-[#E5D9FF] hover:scrollbar-thumb-[#F1E9FF] scrollbar-track-transparent scrollbar-thumb-rounded-full">
        {/* ฝั่งซ้าย */}
        <div className="space-y-4">
          <LabeledInput
            label="วันแข่งขัน"
            type="date"
            value={date}
            onChange={(e: any) => setDate(e.target.value)}
          />
          <LabeledInput
            label="ชื่อรายการแข่ง"
            value={tournamentName}
            onChange={(e: any) => setTournamentName(e.target.value)}
          />

          <LabeledInput
            label="สถานที่แข่งขัน"
            value={location}
            onChange={(e: any) => setLocation(e.target.value)}
          />
          <LabeledInput
            label="ราคาลูกต่อลูก"
            value={shuttlecockPrice}
            onChange={(e: any) => setShuttlecockPrice(e.target.value)}
          />

          <RadioStyleMultiSelect
            label="ประเภทมือ"
            options={levelOptions}
            selected={ranks}
            onToggle={(val: string) => toggleValue(ranks, val, setRanks)}
          />

          <RadioStyleMultiSelect
            label="ประเภท"
            options={["SINGLE" , "DOUBLE"]}
            selected={types}
            onToggle={(val: string) => setTypes([val])}
          />
          <RadioStyleMultiSelect
            label="สายการแข่งขัน"
            options={["สายล่าง"]}
            selected={bracketLines}
            onToggle={(val: string) =>
              toggleValue(bracketLines, val, setBracketLines)
            }
          />

          <PeopleSelector people={people} setPeople={setPeople} />
        </div>

        {/* ฝั่งขวา */}
        <div className="space-y-5">
          <UploadPreview
            title="อัปโหลดรูปภาพโปสเตอร์"
            onUpload={(e: any) => handleUpload(e, "poster")}
            preview={posterPreview}
          />
          <UploadPreview
            title="อัปโหลดรูปภาพ QR Code"
            onUpload={(e: any) => handleUpload(e, "qr")}
            preview={qrPreview}
          />
        </div>
      </div>

      {/* ปุ่มถัดไป */}
      <div className="flex justify-center mt-4 pb-6">
        <motion.button
          disabled={!isFormComplete}
          className={`w-full sm:w-auto px-10 py-2.5 rounded-2xl font-semibold text-slate-800 text-base transition-all duration-300
                  ${
                    isFormComplete
                      ? "bg-[#b3e5fc] hover:bg-[#7ccff5] hover:scale-105 text-[#4B4B4B]"
                      : "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                  }`}
          onClick={handleNext}
        >
          ถัดไป
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ---------- 🧩 Components ย่อย ---------- */
function LabeledInput({ label, type = "text", value, onChange }: any) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <label className="block text-slate-700 text-sm">
      <div className="mb-1 font-medium">{label}</div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        {...(type === "date" ? { min: today } : {})}
        className="w-full h-10 rounded-lg bg-white/90 text-slate-700 
        border border-slate-200 px-3 placeholder:text-slate-400 
        focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm shadow-inner"
      />
    </label>
  );
}

function RadioStyleMultiSelect({ label, options, selected, onToggle }: any) {
  return (
    <div className="text-slate-700 text-sm">
      <div className="font-semibold mb-2">{label}</div>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {options.map((opt: string) => (
          <RadioBox
            key={opt}
            active={selected.includes(opt)}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </RadioBox>
        ))}
      </div>
    </div>
  );
}

function RadioBox({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
        ${
          active
            ? "bg-white text-sky-700 border-sky-500 shadow-sm"
            : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white/90"
        }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full border ${
          active ? "bg-sky-200 border-sky-300" : "border-slate-400"
        }`}
      />
      {children}
    </button>
  );
}

function PeopleSelector({ people, setPeople }: any) {
  return (
    <div>
      <div className="font-semibold mb-2">จำนวนคน</div>
      <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
        {[16, 32].map((num) => (
          <RadioBox
            key={num}
            active={people === num}
            onClick={() => setPeople(num)}
          >
            {num}
          </RadioBox>
        ))}
      </div>
    </div>
  );
}

/* ---------- 🌈 Upload Section ---------- */
function UploadPreview({ title, onUpload, preview }: any) {
  return (
    <label
      className="group relative flex flex-col items-center justify-center 
      w-full rounded-2xl border-2 border-dashed border-pink-200 
      bg-gradient-to-br from-[#FFF8FA] to-[#FFF0F7] 
      hover:from-[#FFE6EF] hover:to-[#FFF6F9]
      cursor-pointer overflow-hidden transition-all duration-300 shadow-sm"
    >
      <input type="file" className="hidden" onChange={onUpload} />

      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-52 object-cover rounded-xl transition-all duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-all">
            เปลี่ยนรูปภาพ
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-200 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div className="font-semibold text-slate-700 text-sm sm:text-base">
            {title}
          </div>
          <p className="text-xs text-slate-500">
            คลิกเพื่อเลือกไฟล์จากเครื่องของคุณ
          </p>
        </div>
      )}
    </label>
  );
}
