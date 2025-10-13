"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TournamentManagePage() {
  const [page, setPage] = useState<
    "organize" | "schedule" | "rules" | "register"
  >("organize");

  // --- ฟอร์มหน้าแรก ---
  const router = useRouter();
  const [role, setRole] = useState<"player" | "organizer">("organizer");
  const [ranks, setRanks] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [people, setPeople] = useState<number | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [shuttlecockPrice, setShuttlecockPrice] = useState("");
  const [location, setLocation] = useState("");
  // --- เนื้อหากติกา (แก้ไขได้) ---
  const [rulesText, setRulesText] = useState<string>(
    [
      "- เวลาที่ระบุในตารางเวลาเป็นเพียงเวลาประมาณการเท่านั้น กรณีที่การแข่งขันดำเนินไปเร็วกว่าที่กำหนด ทางทีมงานสามารถเรียกนักกีฬาเข้าทำการแข่งขันได้ก่อนเวลา แต่จะไม่เรียกเร็วกว่าช่วงเวลาที่กำหนดให้มาลงทะเบียนรายงานตัว ดังนั้นขอให้นักกีฬามารายงานตัวไม่เกินเวลาที่ระบุ เพื่อป้องกันการถูกตัดสิทธิ์การแข่งขัน",
      "- ทีมงานจะยึดตาม ‘ลำดับแมทช์’ ในการเรียกนักกีฬาเข้าทำการแข่งขันเป็นหลัก ขอให้นักกีฬาเตรียมตัวให้พร้อม เมื่อประกาศเรียกลงสนามแล้ว หากภายใน 5 นาที นักกีฬายังไม่มาแสดงตัว หรือมาแต่ไม่พร้อมลงสนาม (เช่น ยังไม่เปลี่ยนชุด ยังไม่ใส่รองเท้า หรือขอเข้าห้องน้ำ) ทีมงานจะประกาศเรียกซ้ำและจับเวลาอีก 5 นาที หากครบกำหนดครั้งที่ 2 แล้วยังไม่พร้อมแข่งขัน นักกีฬาฝั่งที่พร้อมลงสนามจะได้สิทธิ์ชนะ Bye ในแมทช์นั้น",
      "- นักกีฬาต้องลงทำการแข่งขันในรอบแบ่งกลุ่มอย่างน้อย 1 แมทช์ (ไม่นับแมทช์ที่ได้ Bye) จึงจะมีสิทธิ์เข้าเล่นในรอบ Knock Out สายล่าง (หากมี) หากไม่ลงเล่นเลยในรอบแบ่งกลุ่ม ทีมงานขอสงวนสิทธิ์ตัดสิทธิ์นักกีฬานั้นออกจากรอบ Knock Out",
      "- เมื่อนักกีฬามาถึงสนามแล้วแต่ไม่ยอมลงทำการแข่งขัน หรือจงใจไม่เล่น หากทีมงานตรวจพบ จะถือว่าทุจริต และทีมงานมีสิทธิ์ปรับแพ้ทุกแมทช์ที่เหลืออทันที",
      "- ตารางการแข่งขันอาจเร็วหรือช้ากว่าที่ประกาศ ทีมงานจะใช้ ‘ลำดับแมทช์’ เป็นหลัก ขอให้นักกีฬาจดจำหมายเลขแมทช์ของตนเอง ทั้งในรอบแบ่งกลุ่มและ Knock Out เพื่อเตรียมตัวให้พร้อมเมื่อใกล้ถึงคิวแข่งขัน",
      "- นักกีฬาที่ลงแข่งมากกว่า 1 ประเภท ในรอบแบ่งกลุ่ม ต้องลงแข่งขันต่อเนื่อง ส่วนในรอบ Knock Out จะมีเวลาพัก 5 – 10 นาที ก่อนแมทช์ถัดไป",
      "- หลังแข่งขันเสร็จให้นักกีฬาลงคะแนนในใบคะแนน ตรวจสอบความถูกต้อง และเซ็นชื่อรับทราบ จากนั้นให้นำใบคะแนนพร้อมไม้และปากกาคืนที่โต๊ะดำเนินการ เมื่อทีมงานได้รับใบคะแนนแล้วจะถือเป็นผลสิ้นสุด ไม่สามารถแก้ไขได้ (ยกเว้นกรณีลงคะแนนผิดพลาดจริง)",
      "- นักกีฬาสามารถตรวจสอบคะแนนได้จากระบบออนไลนตลอดเวลา หากพบว่าคะแนนผิดพลาด ให้รีบแจ้งทีมงานก่อนออกสาย Knock Out หากประกาศสายไปแล้ว จะไม่สามารถแก้ไขได้",
      "- ระบบออนไลนมีหน้าตรวจสอบแมทช์และคอร์ทที่กำลังใช้งานอยู่ ในกรณีที่ไม่ได้ยินเสียงประกาศ หรือต้องออกไปทำธุระ ให้ตรวจเช็กในระบบ เพื่อป้องกันการถูก Bye",
      "- การคิดคะแนนในรอบ Knock Out บางประเภทอาจมีกติกาแตกต่างกัน หลังจากแข่งรอบแบ่งกลุ่มครบ ขอให้นักกีฬาตรวจสอบคะแนนก่อนกลับ หากกลับไปแล้วและถูกเรียกแข่งขันต่อ เมื่อครบเวลาที่กำหนดแล้วยังไม่มา จะถือว่าสละสิทธิ์ และคู่แข่งจะได้ Bye โดยไม่ข้อโต้แย้ง",
      "- หากนักกีฬาบาดเจ็บ จะมีเวลาให้หยุดพักรักษา แมทช์ละ 2 ครั้ง รวมกันไม่เกิน 10 นาที หากครบเวลาแล้วยังไม่สามารถกลับมาแข่งขันได้ หรือกลับมาแล้วบาดเจ็บซ้ำ จะถือว่ายุติการแข่งขัน และให้อีกฝ่ายชนะ Bye เพื่อความปลอดภัยของนักกีฬา",
      "- ระหว่างการแข่งขัน เมื่อเล่นถึงแต้มที่ 11 จะมีเวลาพัก 60 วินาที และเมื่อจบแต่ละเกม จะพัก 120 วินาที",
    ].join("\n")
  );

  // --- ฟอร์มลงทะเบียน ---
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRanks, setRegRanks] = useState<string[]>([]);
  const [regTypes, setRegTypes] = useState<string[]>([]);

  // --- รอบการแข่งขัน ---
  const [rounds, setRounds] = useState<
    { time: string; desc: string; levels: string[] }[]
  >([]);

  // --- popup เพิ่ม/แก้ไข รอบ ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoundTime, setNewRoundTime] = useState("");
  const [newRoundDesc, setNewRoundDesc] = useState("");
  const [newRoundLevels, setNewRoundLevels] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const levelOptions = ["BG", "NB", "N", "S", "P-", "P+"];

  const gradient = useMemo(
    () => ({
      background:
      `radial-gradient(circle at center, rgba(165, 254, 203, 0.7) 0%, rgba(255, 218, 185, 0.6) 30%, rgba(255, 182, 193, 0.5) 60%, transparent 100%),` +
      `linear-gradient(to bottom, #A5FECB 0%, #FFDAB9 50%, #FFB6C1 100%)`,
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
    type: "poster" | "qr"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "poster") setPosterPreview(reader.result as string);
        if (type === "qr") setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormComplete =
    !!date &&
    ranks.length > 0 &&
    types.length > 0 &&
    people &&
    qrPreview &&
    shuttlecockPrice;

  const handleNext = () => {
    if (isFormComplete) setPage("schedule");
  };

  // --- เพิ่มหรืออัปเดตรอบ ---
  const handleAddRound = () => {
    if (!newRoundTime || !newRoundDesc) return;
    const newRound = {
      time: `${newRoundTime} น.`,
      desc: newRoundDesc,
      levels: newRoundLevels,
    };

    if (editIndex !== null) {
      const updated = [...rounds];
      updated[editIndex] = newRound;
      setRounds(updated);
      setEditIndex(null);
    } else {
      setRounds([...rounds, newRound]);
    }

    setNewRoundTime("");
    setNewRoundDesc("");
    setNewRoundLevels([]);
    setShowAddModal(false);
  };

  const handleEditRound = (index: number) => {
    const r = rounds[index];
    setNewRoundTime(r.time.replace(" น.", ""));
    setNewRoundDesc(r.desc);
    setNewRoundLevels(r.levels);
    setEditIndex(index);
    setShowAddModal(true);
  };

  const handleDeleteRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  return (
    <div
  className="fixed inset-0 flex items-center justify-center overflow-hidden text-white 
  pt-20 ml-56 max-sm:mt-0 max-sm:ml-0 max-sm:px-4 max-sm:items-start max-sm:pt-24 
  max-sm:overflow-y-auto max-sm:h-screen"
  style={gradient}
>

      <Stars />

      <AnimatePresence mode="wait">
        {/* ---------- หน้า 1: จัดการแข่งขัน ---------- */}
        {page === "organize" && (
          <motion.div
            key="organize"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          className="w-[90%] max-w-4xl 
bg-gradient-to-br from-[#f3a5e7] via-[#fbbe95] to-[#f8db83] 
backdrop-blur-xl rounded-3xl border border-white/40 
text-white overflow-hidden flex flex-col 
max-sm:w-full max-sm:rounded-2xl py-8 mt-12 mb-16 transition-all duration-500"



          >
            <div className="px-6 py-4 border-b border-white/10 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow">
                จัดการแข่งขันแบดมินตัน
              </h1>
            </div>

            <div className="p-6 grid gap-6 md:grid-cols-2 text-white/90 overflow-y-auto max-h-[55vh] scrollbar-thin scrollbar-thumb-[#B47AFF]/50 hover:scrollbar-thumb-[#D9B3FF] scrollbar-track-transparent scrollbar-thumb-rounded-full">
              <div className="space-y-4">
             

                <LabeledInput
                  label="วันแข่งขัน"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <LabeledInput
                  label="สถานที่แข่งขัน"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <LabeledInput
                  label="ราคาลูกต่อลูก"
                  value={shuttlecockPrice}
                  onChange={(e) => setShuttlecockPrice(e.target.value)}
                />

                <RadioStyleMultiSelect
                  label="แรงค์"
                  options={levelOptions}
                  selected={ranks}
                  onToggle={(val) => toggleValue(ranks, val, setRanks)}
                />

                <RadioStyleMultiSelect
                  label="ประเภท"
                  options={["คู่", "เดี่ยว"]}
                  selected={types}
                  onToggle={(val) => toggleValue(types, val, setTypes)}
                />

                <PeopleSelector people={people} setPeople={setPeople} />
              </div>

              <div className="space-y-4">
                <UploadPreview
                  title="อัปโหลดรูปภาพโปสเตอร์"
                  onUpload={(e) => handleUpload(e, "poster")}
                  preview={posterPreview}
                />
                <UploadPreview
                  title="อัปโหลดรูปภาพ QR Code"
                  onUpload={(e) => handleUpload(e, "qr")}
                  preview={qrPreview}
                />
              </div>
            </div>

            <div className="flex justify-center mt-4 pb-6">
              <motion.button
                disabled={!isFormComplete}
                whileHover={
                  isFormComplete
                    ? {
                        scale: 1.08,
                        boxShadow: "0 0 20px rgba(255, 214, 165, 0.6)",
                      }
                    : {}
                }
                whileTap={isFormComplete ? { scale: 0.95 } : {}}
                className={`w-full sm:w-auto px-10 py-2.5 rounded-2xl font-semibold text-white text-base transition-all duration-300
                  ${
                    isFormComplete
                      ? "bg-gradient-to-r from-pink-300 via-pink-400 to-yellow-300 hover:from-pink-400 hover:to-yellow-400"
                      : "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                  }`}
                onClick={handleNext}
              >
                ถัดไป
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ---------- หน้า 2: ตารางการแข่งขัน ---------- */}
        {page === "schedule" && (
  <motion.div
    key="schedule"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.5 }}
    className="w-[90%] max-w-4xl 
      bg-gradient-to-br from-[#ffaff3] via-[#fbbe95] to-[#f8db83] 
      backdrop-blur-xl rounded-3xl border border-white/30 shadow-[0_10px_60px_rgba(0,0,0,0.25)] 
      p-6 text-slate-800 py-8 mt-12 mb-16 transition-all duration-500"
  >
    <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
      ตารางการแข่งขัน
    </h1>

    <div className="flex justify-end mb-5">
      <button
        onClick={() => setShowAddModal(true)}
         className="bg-gradient-to-r from-purple-600  via-purple-500  to-purple-400 
            
             text-white font-semibold 
             rounded-xl text-sm px-5 py-2.5 flex items-center gap-2 
             shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-120"
             
>
        <Plus size={18} /> เพิ่มรอบการแข่งขัน
      </button>
    </div>

    <div
      className="divide-y divide-white/30 border border-white/40 rounded-lg 
                 overflow-y-auto max-h-[36vh] 
                 scrollbar-thin scrollbar-thumb-[#f0a2c4]/50 hover:scrollbar-thumb-[#fbc2eb] 
                 scrollbar-track-transparent scrollbar-thumb-rounded-full"
    >
      {/* Header ตาราง */}
      <div className="grid grid-cols-2 text-2xl bg-gradient-to-r from-[#ffdf6a] via-[#ffadad] to-[#ff6ca2]  text-white font-bold text-center py-3 rounded-t-lg shadow-inner">
        <div>เวลาประมาณ</div>
        <div>กำหนดการ</div>
      </div>

      {rounds.length === 0 && (
        <div className="text-center py-6 text-white/80 text-2xl italic">
          ยังไม่มีข้อมูลรอบการแข่งขัน
        </div>
      )}

      {rounds.map((r, i) => (
        <div
          key={i}
          className={`grid grid-cols-2 py-4 px-4 items-center transition-all duration-300 ${
            i % 2 === 0
              ? "bg-white/40 hover:bg-white/50"
              : "bg-white/30 hover:bg-white/40"
          }`}
        >
          <div className="text-center font-bold text-slate-700 text-[25px]">
            {r.time}
          </div>

          <div className="flex flex-col gap-2 text-slate-700 text-[25px]">
            <span className="font-semibold">{r.desc}</span>
            <div className="flex flex-wrap gap-2">
              {r.levels.map((lvl) => (
                <span
                  key={lvl}
                  className="px-3 py-1 rounded-full text-[15px] font-normal 
                     bg-sky-500  text-white shadow-md"
                >
                  {lvl}
                </span>
              ))}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => handleEditRound(i)}
                className="p-2 rounded-lg bg-pink-400 hover:bg-pink-500/60 "
                title="แก้ไข"
              >
                <Edit3 size={16} className="text-white" />
              </button>
              <button
                onClick={() => handleDeleteRound(i)}
                className="p-2 rounded-lg bg-red-400 hover:bg-red-500/60 "
                title="ลบ"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* ปุ่มด้านล่าง */}
    <div className="flex justify-between mt-6">
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage("organize")}
        className="px-8 py-2.5 rounded-2xl font-semibold text-white text-sm md:text-base
          bg-[#bdbdbd]  shadow-md"
      >
        ย้อนกลับ
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage("rules")}
        className="px-10 py-2.5 rounded-2xl font-semibold text-white text-base
          bg-gradient-to-r from-pink-300 via-pink-400 to-yellow-300 
                   hover:from-pink-400 hover:to-yellow-400 shadow-md"
      >
        ถัดไป
      </motion.button>
    </div>
  </motion.div>
)}


        {/* ---------- หน้า 3: กติกาและข้อควรระวัง ---------- */}
       {page === "rules" && (
  <motion.div
    key="rules"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.5 }}
    className="w-[90%] max-w-4xl 
               bg-gradient-to-br from-[#FFB6B9] via-[#FFDAB9] to-[#FFDFAE]
               backdrop-blur-xl rounded-3xl border border-white/40 
               shadow-[0_20px_80px_rgba(255,182,193,0.3)]
               p-6 text-slate-700 py-8 mt-12 mb-16"
  >
    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-pink-600 drop-shadow-sm">
      กติกาและข้อควรระวัง
    </h1>

    <div className="overflow-y-auto max-h-[55vh] 
                    scrollbar-thin scrollbar-thumb-pink-300 
                    hover:scrollbar-thumb-pink-400 
                    scrollbar-track-transparent scrollbar-thumb-rounded-full">
     
      
        <textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          className="w-full min-h-[320px] rounded-lg bg-white/90 border border-pink-200 
                     px-3 py-2 text-slate-700 placeholder:text-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-pink-300 
                     text-sm leading-relaxed shadow-inner"
          placeholder="พิมพ์กติกาและข้อควรระวังที่นี่"
        />
     
    </div>

    <div className="flex justify-between mt-6">
      {/* ปุ่มย้อนกลับ */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage("schedule")}
        className="px-8 py-2.5 rounded-2xl font-semibold text-white text-sm md:text-base
                   bg-[#bdbdbd]
                   shadow-md transition-all duration-300"
      >
        ย้อนกลับ
      </motion.button>

      {/* ปุ่มลงทะเบียน */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/manage')}
        className="px-10 py-2.5 rounded-2xl font-semibold text-white text-base
                  bg-gradient-to-r from-pink-300 via-pink-400 to-yellow-300 
                   hover:from-pink-400 hover:to-yellow-400
                   shadow-md transition-all duration-300"
      >
        ลงทะเบียน
      </motion.button>
    </div>
  </motion.div>
)}
      </AnimatePresence>

      {/* ---------- Popup (Modal) ---------- */}
      <AnimatePresence>
  {showAddModal && (
    <motion.div
      key="addRoundModal"
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="bg-gradient-to-br from-pink-100 via-pink-200 to-yellow-100 
                   border border-pink-300/50 rounded-2xl p-6 w-[90%] max-w-md 
                   text-slate-700 shadow-[0_10px_40px_rgba(255,183,197,0.5)] 
                   my-8 sm:my-12 max-h-[80vh] overflow-y-auto 
                   scrollbar-thin scrollbar-thumb-pink-300 hover:scrollbar-thumb-pink-400 
                   scrollbar-track-transparent scrollbar-thumb-rounded-full"
      >
        <h2 className="text-lg font-bold mb-4 text-center text-pink-600 drop-shadow-sm">
          {editIndex !== null ? "แก้ไขรอบการแข่งขัน" : "เพิ่มรอบการแข่งขัน"}
        </h2>

        <div className="space-y-4 text-sm">
          <label className="block">
            <div className="mb-1 font-semibold text-pink-700">เวลาโดยประมาณ</div>
            <input
              type="time"
              value={newRoundTime}
              onChange={(e) => setNewRoundTime(e.target.value)}
              className="w-full rounded-lg bg-white/90 border border-pink-200 
                         px-3 py-2 text-slate-700 focus:outline-none 
                         focus:ring-2 focus:ring-pink-300 shadow-inner"
            />
          </label>

          <label className="block">
            <div className="mb-1 font-semibold text-pink-700">รายละเอียดกำหนดการ</div>
            <input
              type="text"
              value={newRoundDesc}
              onChange={(e) => setNewRoundDesc(e.target.value)}
              placeholder="เช่น ลงทะเบียน (อย่างช้าที่สุดไม่เกิน 08:45 น.)"
              className="w-full rounded-lg bg-white/90 border border-pink-200 
                         px-3 py-2 text-slate-700 focus:outline-none 
                         focus:ring-2 focus:ring-pink-300 shadow-inner"
            />
          </label>

          <div>
            <div className="mb-2 font-semibold text-pink-700">รายการระดับมือย่อย</div>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleValue(newRoundLevels, opt, setNewRoundLevels)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all 
                    ${
                      newRoundLevels.includes(opt)
                        ? "bg-gradient-to-r from-pink-400 to-blue-300 text-white border-transparent"
                        : "bg-white/70 border-pink-200 text-pink-600 hover:bg-white/90"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleAddRound}
            className="px-6 py-2 rounded-lg font-semibold text-white text-sm
                       bg-gradient-to-r from-pink-400 via-pink-500 to-blue-400 
                       hover:from-pink-500 hover:to-blue-400 shadow-md"
          >
            {editIndex !== null ? "บันทึกการแก้ไข" : "บันทึก"}
          </button>
          <button
            onClick={() => {
              setShowAddModal(false);
              setEditIndex(null);
            }}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 
                       text-slate-700 font-semibold text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}

/* ---------- Components ---------- */
function LabeledInput({ label, type = "text", value, onChange }: any) {
  return (
    <label className="block text-white/90 text-sm">
      <div className="mb-1 font-medium">{label}</div>
      <input
        type={type}
        value={value}
        onChange={onChange}
       className="w-full h-10 rounded-lg bg-white/90 text-slate-700 
border border-white/40 px-3 placeholder:text-slate-400 
focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm shadow-inner"

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
{/* ---------- เลือกแรงค์ ---------- */}
function RadioBox({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
        ${
          active
            ? "bg-white text-pink-500 border-pink-200 shadow-sm"
            : "bg-white/80 text-slate-600 border-white/40 hover:bg-white/90"
        }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full border ${
          active ? "bg-pink-400 border-pink-400" : "border-slate-400"
        }`}
      />
      {children}
    </button>
  );
}

{/* ---------- เลือกจำนวนคน ---------- */}
function PeopleSelector({ people, setPeople }: any) {
  return (
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
  );
}

{/* ---------- อัพโหลดรูป ---------- */}
function UploadPreview({ title, onUpload, preview }: any) {
  return (
    <label
      className="rounded-xl border-2 border-dashed border-pink-200/60 
      bg-white/85 hover:bg-white/95 text-center cursor-pointer block p-5 
      transition-all duration-300 shadow-inner"
    >
      <input type="file" className="hidden" onChange={onUpload} />

      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-contain rounded-lg border border-pink-200 bg-white shadow-md"
        />
      ) : (
        <>
         <motion.div
  className="text-4xl mb-2"
  animate={{
    y: [0, -8, 0],
    rotate: [0, -6, 6, 0],
  }}
  transition={{
    duration: 2.8,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut",
  }}
>
  🌸
</motion.div>


          <div className="font-semibold text-pink-500 text-sm sm:text-base">
            {title}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์
          </div>
        </>
      )}
    </label>
  );
}



/* ---------- Stars ---------- */
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
