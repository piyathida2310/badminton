"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function TournamentManagePage() {
  const router = useRouter();
  const [role, setRole] = useState<"player" | "organizer">("organizer");
  const [ranks, setRanks] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [people, setPeople] = useState<number | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const gradient = useMemo(
    () => ({
      background:
        `radial-gradient(1000px 600px at 75% -10%, rgba(76,14,98,0.7) 0%, rgba(0,0,0,0) 60%),` +
        `radial-gradient(800px 500px at 10% 110%, rgba(11,16,32,0.6) 0%, rgba(0,0,0,0) 60%),` +
        `linear-gradient(135deg, #0B1020 0%, #4C0E62 100%)`,
    }),
    []
  );

  const toggleValue = (arr: string[], val: string, setArr: any) => {
    setArr((prev: string[]) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "poster" | "slip"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "poster") setPoster(file);
      if (type === "slip") setPaymentSlip(file);
    }
  };

  const isFormComplete =
    !!date && ranks.length > 0 && types.length > 0 && people && paymentSlip;

  const handleSubmit = () => {
    if (isFormComplete) setShowPopup(true);
  };

  const handleConfirm = () => {
    setShowPopup(false);
    router.push("/manage");
  };

  return (
    <div
      className="
        fixed inset-0 flex items-center justify-center 
        overflow-hidden text-white 
        mt-16 ml-56
        max-sm:mt-0 max-sm:ml-0 max-sm:px-4 max-sm:items-start max-sm:pt-20
        max-sm:overflow-y-auto max-sm:h-screen
      "
      style={gradient}
    >
      <Stars />
     

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          w-[90%] max-w-4xl 
          bg-white/10 backdrop-blur-xl 
          rounded-3xl border border-white/20 
          shadow-[0_20px_80px_rgba(0,0,0,0.45)] 
          text-white overflow-hidden
          flex flex-col
          max-sm:w-full max-sm:rounded-2xl
        "
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-white/10">
          <h1 className="text-xl sm:text-2xl md:text-3xl max-sm:text-lg font-bold drop-shadow text-center sm:text-left">
            จัดการแข่งขันแบดมินตัน
          </h1>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2 text-white/90 overflow-y-auto md:overflow-hidden max-sm:p-4">
          {/* ฝั่งซ้าย */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm justify-center sm:justify-start">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  checked={role === "player"}
                  onChange={() => setRole("player")}
                  className="accent-white"
                />
                ผู้เข้าแข่งขัน
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  checked={role === "organizer"}
                  onChange={() => setRole("organizer")}
                  className="accent-white"
                />
                ผู้จัดแข่ง
              </label>
            </div>

            <LabeledInput
              label="วันแข่งขัน"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <LabeledInput label="กรอกเลขคอร์ด"  />

            <RadioStyleMultiSelect
              label="แรงค์"
              options={["BG", "NB", "N", "S", "P", "P+"]}
              selected={ranks}
              onToggle={(val) => toggleValue(ranks, val, setRanks)}
            />

            <RadioStyleMultiSelect
              label="ประเภท"
              options={["คู่", "เดี่ยว"]}
              selected={types}
              onToggle={(val) => toggleValue(types, val, setTypes)}
            />

            <div>
              <div className="font-semibold mb-2">จำนวนคน</div>
              <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                {[16, 24, 32].map((num) => (
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
          </div>

          {/* ฝั่งขวา */}
          <div className="space-y-4">
            <UploadBox
              title="อัปโหลดรูปภาพโปสเตอร์"
              onUpload={(e) => handleUpload(e, "poster")}
              fileName={poster?.name}
            />
            <UploadBox
              title="อัปโหลดรูปภาพQR Code"
              onUpload={(e) => handleUpload(e, "slip")}
              fileName={paymentSlip?.name}
            />
          </div>
        </div>

        <div className="flex justify-center pb-6 max-sm:pb-4 max-sm:px-4">
          <motion.button
            disabled={!isFormComplete}
            whileHover={
              isFormComplete
                ? { scale: 1.05, boxShadow: `0 0 25px rgba(255,200,60,0.7)` }
                : {}
            }
            whileTap={isFormComplete ? { scale: 0.97 } : {}}
            className={`w-full sm:w-auto px-8 py-2 rounded-xl font-semibold text-slate-900 text-sm md:text-base transition-all 
              ${
                isFormComplete
                  ? "bg-yellow-400 hover:bg-yellow-300 cursor-pointer"
                  : "bg-gray-400/60 text-gray-700 cursor-not-allowed"
              }`}
            onClick={handleSubmit}
          >
            จัดแข่ง
          </motion.button>
        </div>
      </motion.div>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="
                relative w-[90%] max-w-md 
                rounded-2xl border border-white/10 
                bg-[#1a1430]/95 p-6 sm:p-8 
                text-center text-white 
                shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                max-sm:p-4 max-sm:text-sm
              "
            >
              <h2 className="mb-3 text-xl font-semibold text-[#D9B3FF]">
                บันทึกข้อมูลเรียบร้อย
              </h2>

              <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-white/85">
                วันแข่ง: {date}
                {"\n"}แรงค์: {ranks.join(", ")}
                {"\n"}ประเภท: {types.join(", ")}
                {"\n"}จำนวนคน: {people}
                {"\n"}โปสเตอร์: {poster?.name || "-"}
                {"\n"}สลิป: {paymentSlip?.name || "-"}
              </p>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 16px rgba(200,150,255,0.4)",
                }}
                whileTap={{ scale: 0.96 }}
                onClick={handleConfirm}
                className="
                  rounded-xl bg-gradient-to-r from-[#7F4FFF] to-[#B47AFF] 
                  px-8 py-2 font-semibold text-sm text-white 
                  shadow-[0_0_15px_rgba(160,100,255,0.2)]
                  hover:from-[#8E5AFF] hover:to-[#C296FF] 
                  transition-all
                "
              >
                ตกลง
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Components ---------- */
function LabeledInput({ label, placeholder, type = "text", value, onChange }: any) {
  return (
    <label className="block text-white/90 text-sm">
      <div className="mb-1 font-medium">{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-10 rounded-lg bg-white/5 border border-white/20 px-3 text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#9b4fff]/60 text-sm"
      />
    </label>
  );
}

function RadioStyleMultiSelect({ label, options, selected, onToggle }: any) {
  return (
    <div className="text-white/90 text-sm">
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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        active
          ? "bg-white/20 border-white text-white"
          : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full border ${
          active ? "bg-white border-white" : "border-white/60"
        }`}
      />
      {children}
    </button>
  );
}

function UploadBox({ title, onUpload, fileName }: any) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      className="rounded-xl border-2 border-dashed border-white/25 bg-white/5 p-5 text-center text-white/90 cursor-pointer block text-sm"
    >
      <input type="file" className="hidden" onChange={onUpload} />
      <div className="mx-auto text-4xl animate-bounce">☁️</div>
      <div className="mt-2 font-medium">{title}</div>
      {fileName ? (
        <div className="text-xs text-green-300 mt-1 break-words">
          ✅ {fileName}
        </div>
      ) : (
        <div className="text-xs opacity-80">
          ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์
        </div>
      )}
    </motion.label>
  );
}

/* ---------- Stars + Decorations ---------- */


function Stars() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <StarLayer density={50} size={1} speed={80} opacity={0.5} />
      <StarLayer density={25} size={2} speed={120} opacity={0.3} />
    </div>
  );
}

function StarLayer({ density, size, speed, opacity }: any) {
  const shadows = useMemo(
    () => randomStarShadows(density, size, opacity),
    [density, size, opacity]
  );
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0"
      style={{
        boxShadow: shadows,
        width: 1,
        height: 1,
        background: "transparent",
      }}
      animate={{ y: [0, 15, 0] }}
      transition={{ duration: speed, repeat: Infinity }}
    />
  );
}

function randomStarShadows(count: number, size: number, opacity: number) {
  const w = typeof window !== "undefined" ? window.innerWidth : 1440;
  const h = typeof window !== "undefined" ? window.innerHeight : 900;
  const arr: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    arr.push(`${x}px ${y}px 0 ${size}px rgba(255,255,255,${opacity})`);
  }
  return arr.join(", ");
}
