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
      "- เมื่อนักกีฬามาถึงสนามแล้วแต่ไม่ยอมลงทำการแข่งขัน หรือจงใจไม่เล่น หากทีมงานตรวจพบ จะถือว่าทุจริต และทีมงานมีสิทธิ์ปรับแพ้ทุกแมทช์ที่เหลือทันที",
      "- ตารางการแข่งขันอาจเร็วหรือช้ากว่าที่ประกาศ ทีมงานจะใช้ ‘ลำดับแมทช์’ เป็นหลัก ขอให้นักกีฬาจดจำหมายเลขแมทช์ของตนเอง ทั้งในรอบแบ่งกลุ่มและ Knock Out เพื่อเตรียมตัวให้พร้อมเมื่อใกล้ถึวแข่งขัน",
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
  const [bracketLines, setBracketLines] = useState<string[]>([]);

  // --- รอบการแข่งขัน ----
  const [rounds, setRounds] = useState<
    { time: string; desc: string; levels?: string[] }[]
  >([
    {
      time: "08:30 น.",
      desc: "ลงทะเบียน (ให้มาลงทะเบียนตรงเวลา อย่างช้าที่สุดไม่เกิน 08:45 น.)",
      levels: ["มือ NB", "มือ BG"],
    },
    {
      time: "10:30 น.",
      desc: "ลงทะเบียน (ให้มาลงทะเบียนตรงเวลา อย่างช้าที่สุดไม่เกิน 11:00 น.)",
      levels: ["มือ S"],
    },
    {
      time: "11:30 น.",
      desc: "ลงทะเบียน (ให้มาลงทะเบียนตรงเวลา อย่างช้าที่สุดไม่เกิน 12:00 น.)",
      levels: ["มือ N"],
    },
    {
      time: "23:00 น.",
      desc: "จบการแข่งขัน",
      levels: [],
    },
  ]);

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
        `radial-gradient(circle at center, rgba(240, 248, 255, 0.7) 0%, rgba(255, 239, 213, 0.6) 30%, rgba(255, 228, 225, 0.5) 60%, transparent 100%),` +
        `linear-gradient(to bottom, #F0F8FF 0%, #FFEFD5 50%, #FFE4E1 100%)`,
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
    bracketLines.length > 0 &&
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
      className="fixed inset-0 flex items-center justify-center overflow-hidden text-slate-800 
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

            <div className="p-6 grid gap-6 md:grid-cols-2 text-slate-700 overflow-y-auto max-h-[55vh] scrollbar-thin scrollbar-thumb-[#E5D9FF] hover:scrollbar-thumb-[#F1E9FF] scrollbar-track-transparent scrollbar-thumb-rounded-full">
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
                <RadioStyleMultiSelect
                  label="สายการแข่งขัน"
                  options={["สายล่าง"]}
                  selected={bracketLines}
                  onToggle={(val) =>
                    toggleValue(bracketLines, val, setBracketLines)
                  }
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
      bg-gradient-to-br from-[#F8FAFF] via-[#FFF7F0] to-[#FDF5F8] 
      rounded-3xl 
      p-6 text-slate-800 py-8 mt-12 mb-16 transition-all duration-500"
          >
            <h1 className="text-3xl font-bold text-center mb-6 text-slate-800 drop-shadow-lg">
              ตารางการแข่งขัน
            </h1>

            {/* ปุ่มเพิ่มรอบ */}
            <div className="flex justify-end mb-5">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#EDE9FE] hover:bg-[#F3E8FF] 
           text-violet-700 font-semibold 
           rounded-xl text-sm px-5 py-2.5 flex items-center gap-2 
           transition-all duration-300 transform hover:scale-105"
              >
                <Plus size={18} /> เพิ่มรอบการแข่งขัน
              </button>
            </div>

            {/* ตารางการแข่งขัน */}
            <div
              className="border-4 border-[#F9CCE3] rounded-2xl overflow-y-auto max-h-[36vh]
         scrollbar-thin scrollbar-thumb-[#f0a2c4]/50 hover:scrollbar-thumb-[#fbc2eb]
         scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              {/* หัวตาราง */}
              <div
                className="grid grid-cols-2 text-2xl bg-[#D6E4FF] text-slate-800 font-bold text-center py-3 
           rounded-t-xl border-b-4 border-[#F9CCE3]"
              >
                <div>เวลาประมาณ</div>
                <div>กำหนดการ</div>
              </div>

              {rounds.length === 0 && (
                <div className="text-center py-6 text-slate-600 text-2xl italic border-t-2 border-[#F9CCE3]">
                  ยังไม่มีข้อมูลรอบการแข่งขัน
                </div>
              )}

              {rounds
                .slice()
                .sort((a, b) => {
                  const cleanA = a.time.replace("น.", "").trim();
                  const cleanB = b.time.replace("น.", "").trim();
                  const [ah, am] = cleanA.split(":").map(Number);
                  const [bh, bm] = cleanB.split(":").map(Number);
                  return ah * 60 + am - (bh * 60 + bm);
                })
                .map((r) => {
                  // ใช้ index จริงใน state เดิม
                  const originalIndex = rounds.indexOf(r);
                  return (
                    <div
                      key={originalIndex}
                      className={`grid grid-cols-2 py-4 px-4 items-center border-t-2 border-[#F9CCE3] 
                transition-all duration-300 ${
                  originalIndex % 2 === 0
                    ? "bg-[#FFF9FC] hover:bg-[#FFF3F7]"
                    : "bg-[#FDFBFF] hover:bg-[#F7EEFB]"
                }`}
                    >
                      {/* ✅ คอลัมน์เวลา (เส้นกลางยาวเต็มแถว) */}
                      <div className="flex items-stretch h-full">
                        <div
                          className="flex-1 flex justify-center items-center 
                  font-bold text-[#2C2C54] text-[25px]
                  border-r-[3px] border-[#F4B9D2] h-full"
                        >
                          {r.time}
                        </div>
                      </div>

                      {/* คอลัมน์รายละเอียด */}
                      <div className="pl-4 text-[#2C2C54] text-[20px] leading-snug font-semibold flex flex-col gap-2 h-full justify-center break-words break-all whitespace-pre-wrap overflow-hidden">
                        <span className="block max-w-full break-words break-all whitespace-pre-wrap">
                          {r.desc}
                        </span>

                        {/* ✅ แสดงป้ายระดับมือ */}
                        {r.levels && r.levels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {r.levels.map((lv, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-blue-100 text-[#3C3C3C] border border-[#F9CCE3] shadow-sm"
                              >
                                {lv}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* ปุ่มแก้ไข / ลบ */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEditRound(originalIndex)}
                            className="p-2 rounded-lg bg-[#FFEFB7] hover:bg-[#FFE47A] border border-[#FFD7B5]"
                            title="แก้ไข"
                          >
                            <Edit3 size={16} className="text-[#3C3C3C]" />
                          </button>
                          <button
                            onClick={() => handleDeleteRound(originalIndex)}
                            className="p-2 rounded-lg bg-[#FFCDD2] hover:bg-[#FFB4B9] border border-[#F9A8A8]"
                            title="ลบ"
                          >
                            <Trash2 size={16} className="text-[#3C3C3C]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* ปุ่มด้านล่าง */}
            <div className="flex justify-between mt-6">
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage("organize")}
                className="px-8 py-2.5 rounded-2xl font-semibold text-slate-800 text-sm md:text-base
          bg-gray-200 hover:bg-gray-300 transition-all"
              >
                ย้อนกลับ
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage("rules")}
                className="px-10 py-2.5 rounded-2xl font-semibold text-slate-800 text-base
          bg-[#b3e5fc] hover:bg-[#7ccff5] transition-all"
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
               bg-gradient-to-br from-[#F8FAFF] via-[#FFF7F0] to-[#FDF5F8]
               backdrop-blur-xl rounded-3xl border border-slate-200 
               shadow-[0_20px_80px_rgba(0,0,0,0.12)]
               p-6 text-slate-700 py-8 mt-12 mb-16"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-slate-800 drop-shadow-sm">
              กติกาและข้อควรระวัง
            </h1>

            <div
              className="overflow-y-auto max-h-[55vh] 
                    scrollbar-thin scrollbar-thumb-[#EADCF4] 
                    hover:scrollbar-thumb-[#F3EAFB] 
                    scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <textarea
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className="w-full min-h-[320px] rounded-lg bg-white/90 border border-slate-200 
                     px-3 py-2 text-slate-700 placeholder:text-slate-400 
                     focus:outline-none focus:ring-2 focus:ring-sky-200 
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
                className="px-8 py-2.5 rounded-2xl font-semibold text-slate-800 text-sm md:text-base
                   bg-gray-200 hover:bg-gray-300
                   shadow-md transition-all duration-300"
              >
                ย้อนกลับ
              </motion.button>

              {/* ปุ่มลงทะเบียน */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/manage")}
                className="px-10 py-2.5 rounded-2xl font-semibold text-slate-800 text-base
                  bg-[#b3e5fc] hover:bg-[#7ccff5]
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
                   border border-slate-200 rounded-2xl p-6 w-[90%] max-w-md 
                   text-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.12)] 
                   my-8 sm:my-12 max-h-[80vh] overflow-y-auto 
                   scrollbar-thin scrollbar-thumb-[#EADCF4] hover:scrollbar-thumb-[#F3EAFB] 
                   scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <h2 className="text-lg font-bold mb-4 text-center text-slate-800 drop-shadow-sm">
                {editIndex !== null
                  ? "แก้ไขรอบการแข่งขัน"
                  : "เพิ่มรอบการแข่งขัน"}
              </h2>

              <div className="space-y-4 text-sm">
                <label className="block">
                  <div className="mb-1 font-semibold text-slate-700">
                    เวลาโดยประมาณ
                  </div>
                  <input
                    type="time"
                    value={newRoundTime}
                    onChange={(e) => setNewRoundTime(e.target.value)}
                    className="w-full rounded-lg bg-white/90 border border-slate-200 
                         px-3 py-2 text-slate-700 focus:outline-none 
                         focus:ring-2 focus:ring-sky-200 shadow-inner"
                  />
                </label>

                <label className="block">
                  <div className="mb-1 font-semibold text-slate-700">
                    รายละเอียดกำหนดการ
                  </div>
                  <input
                    type="text"
                    value={newRoundDesc}
                    onChange={(e) => setNewRoundDesc(e.target.value)}
                    placeholder="เช่น ลงทะเบียน (อย่างช้าที่สุดไม่เกิน 08:45 น.)"
                    className="w-full rounded-lg bg-white/90 border border-slate-200 
                         px-3 py-2 text-slate-700 focus:outline-none 
                         focus:ring-2 focus:ring-sky-200 shadow-inner"
                  />
                </label>

                <div>
                  <div className="mb-2 font-semibold text-slate-700">
                    รายการระดับมือย่อย
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {levelOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          toggleValue(newRoundLevels, opt, setNewRoundLevels)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all 
                    ${
                      newRoundLevels.includes(opt)
                        ? "bg-gradient-to-r from-pink-100 to-blue-100 text-slate-800 border-transparent"
                        : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white/90"
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
                  className="px-6 py-2 rounded-lg font-semibold text-slate-800 text-sm
                       bg-gradient-to-r from-pink-100 via-pink-200 to-blue-100 
                       hover:from-pink-200 hover:to-blue-200 shadow-md"
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
  // เอาวันปัจจุบันในรูปแบบ YYYY-MM-DD
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
{
  /* ---------- เลือกแรงค์ ---------- */
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

{
  /* ---------- เลือกจำนวนคน ---------- */
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

{
  /* ---------- อัพโหลดรูป ---------- */
}
function UploadPreview({ title, onUpload, preview }: any) {
  return (
    <label
      className="rounded-xl border-2 border-dashed border-slate-200/60 
      bg-white/85 hover:bg-white/95 text-center cursor-pointer block p-5 
      transition-all duration-300 shadow-inner"
    >
      <input type="file" className="hidden" onChange={onUpload} />

      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-contain rounded-lg border border-slate-200 bg-white shadow-md"
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

          <div className="font-semibold text-slate-700 text-sm sm:text-base">
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
