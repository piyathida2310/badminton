"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// import component ที่แยกไว้
import Form from "../../../../../../components/form";
import Schedule from "../../../../../../components/schedule";
import Guideline from "../../../../../../components/guideline";
export default function TournamentManagePage() {
  const [page, setPage] = useState<"organize" | "rules" | "schedule">(
    "organize"
  );
  const router = useRouter();

  interface tournament {
    name: string;
    location: string;
    playType: "SINGLE" | "DOUBLE" | any;
    rank: "BG" | "NB" | "N" | "S" | "P_MINUS" | "P_PLUS" | any;
    shuttlePrice: string;
    maxPlayers: string;
    posterImg: string | File | null;
    qrCodeImg: string | File | null;
    startDate: string;
    ruleId: string | null;
    isLowerBracket: boolean;
  }

  // --- ข้อมูลฟอร์มหน้าแรก ---
  const [ranks, setRanks] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [people, setPeople] = useState<number | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [shuttlecockPrice, setShuttlecockPrice] = useState("");
  const [location, setLocation] = useState("");
  const [bracketLines, setBracketLines] = useState<string[]>([]);
  const [tournament, setTournament] = useState<tournament>();
  const [tournamentID, setTournamentID] = useState<number | null>(null);

  // --- รอบการแข่งขัน (ล้างคำว่า "มือ" ออกตั้งแต่เริ่ม) ---
  const [rounds, setRounds] = useState<
    { time: string; desc: string; levels?: string[] }[]
  >([
    {
      time: "08:30 น.",
      desc: "ลงทะเบียน (ให้มาลงทะเบียนตรงเวลา อย่างช้าที่สุดไม่เกิน 08:45 น.)",
      levels: ["NB", "BG"],
    },
    {
      time: "10:30 น.",
      desc: "ลงทะเบียน (ให้มาลงทะเบียนตรงเวลา อย่างช้าที่สุดไม่เกิน 11:00 น.)",
      levels: ["S"],
    },
    {
      time: "11:30 น.",
      desc: "ลงทะเบียน (ให้มาลงทะเบียนตรงเวลา อย่างช้าที่สุดไม่เกิน 12:00 น.)",
      levels: ["N"],
    },
    {
      time: "23:00 น.",
      desc: "จบการแข่งขัน",
      levels: [],
    },
  ]);

  // --- ข้อความกติกา ---
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

  // --- popup modal state ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoundTime, setNewRoundTime] = useState("");
  const [newRoundDesc, setNewRoundDesc] = useState("");
  const [newRoundLevels, setNewRoundLevels] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

const levelOptions = [
  { label: "BG", value: "BG" },
  { label: "NB", value: "NB" },
  { label: "N", value: "N" },
  { label: "S", value: "S" },
  { label: "P-", value: "P_MINUS" },
  { label: "P+", value: "P_PLUS" },
];

  const gradient = useMemo(
    () => ({
      background:
        `radial-gradient(circle at center, rgba(240, 248, 255, 0.7) 0%, rgba(255, 239, 213, 0.6) 30%, rgba(255, 228, 225, 0.5) 60%, transparent 100%),` +
        `linear-gradient(to bottom, #F0F8FF 0%, #FFEFD5 50%, #FFE4E1 100%)`,
    }),
    []
  );

  // --- toggle ---
  const toggleValue = (arr: string[], val: string, setArr: any) => {
    setArr((prev: string[]) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleUpload = (e: any, type: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "poster") {
      setPosterFile(file);
    } else {
      setQrFile(file);
    }

    // สำหรับ preview
    const reader = new FileReader();
    reader.onload = () => {
      if (type === "poster") setPosterPreview(reader.result as string);
      if (type === "qr") setQrPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isFormComplete =
    date &&
    location &&
    shuttlecockPrice &&
    ranks.length > 0 &&
    types.length > 0 &&
    people;

  const handleNext = () => {
    setTournament({
      name: tournamentName,
      location: location,
      playType: types,
      rank: ranks,
      shuttlePrice: shuttlecockPrice,
      maxPlayers: String(people),
      posterImg: posterFile,
      qrCodeImg: qrFile,
      startDate: date,
      ruleId: null,
      isLowerBracket: false,
    });
    if (isFormComplete) setPage("rules");
  };

  // ฟังก์ชันบันทึกพร้อมล้างคำว่า "มือ" และกรองซ้ำ
  const handleAddRound = () => {
    if (!newRoundTime || !newRoundDesc.trim()) return;

    // แปลงเวลาเป็นนาทีเพื่อเรียง
    const timeToMinutes = (timeStr: string) => {
      const clean = timeStr.replace(/[^\d:]/g, "").trim();
      const [h, m] = clean.split(":").map(Number);
      return h * 60 + (m || 0);
    };

    // 🔹 ล้างคำว่า "มือ" ออกและกรองซ้ำ
    const normalize = (text: string) => text.replace(/^มือ\s*/, "").trim();
    const cleanedLevels = newRoundLevels.map(normalize);
    const uniqueLevels = Array.from(new Set(cleanedLevels));

    const newRound = {
      time: `${newRoundTime} น.`,
      desc: newRoundDesc.trim(),
      levels: uniqueLevels,
    };

    let updated = [...rounds];

    if (editIndex !== null) {
      updated[editIndex] = newRound;
    } else {
      const exists = updated.some((r) => r.time === newRound.time);
      if (exists) return alert(" มีเวลานี้อยู่แล้วในตาราง");
      updated.push(newRound);
    }

    updated.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    setRounds(updated);
    setNewRoundTime("");
    setNewRoundDesc("");
    setNewRoundLevels([]);
    setEditIndex(null);
    setShowAddModal(false);
  };

  const handleEditRound = (index: number) => {
    const r = rounds[index];
    setNewRoundTime(r.time.replace(" น.", ""));
    setNewRoundDesc(r.desc);
    setNewRoundLevels(r.levels || []);
    setEditIndex(index);
    setShowAddModal(true);
  };

  const handleDeleteRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log(tournamentID);
  }, [tournamentID]);

  //  ล้างคำว่า "มือ" ออกจากทุก round ตอนเปิดหน้านี้ครั้งแรก
  useEffect(() => {
    setRounds((prev) =>
      prev.map((r) => ({
        ...r,
        levels: (r.levels || []).map((lvl) =>
          lvl.replace(/^มือ\s*/, "").trim()
        ),
      }))
    );
  }, []);

  // --- render ---
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden text-slate-800 
      pt-20 ml-56 max-sm:mt-0 max-sm:ml-0 max-sm:px-4 max-sm:items-start max-sm:pt-24 
      max-sm:overflow-y-auto max-sm:h-screen"
      style={gradient}
    >
      <AnimatePresence mode="wait">
        {page === "organize" && (
          <Form
            date={date}
            setDate={setDate}
            tournamentName={tournamentName}
            setTournamentName={setTournamentName}
            location={location}
            setLocation={setLocation}
            shuttlecockPrice={shuttlecockPrice}
            setShuttlecockPrice={setShuttlecockPrice}
            ranks={ranks}
            setRanks={setRanks}
            types={types}
            setTypes={setTypes}
            bracketLines={bracketLines}
            setBracketLines={setBracketLines}
            people={people}
            setPeople={setPeople}
            handleUpload={handleUpload}
            posterPreview={posterPreview}
            qrPreview={qrPreview}
            handleNext={handleNext}
            isFormComplete={isFormComplete}
            levelOptions={levelOptions}
            toggleValue={toggleValue}
          />
        )}

        {page === "rules" && (
          <Guideline
            rulesText={rulesText}
            setRulesText={setRulesText}
            setPage={setPage}
            router={router}
            //@ts-ignore
            tournament={tournament}
            setTournamentID={setTournamentID}
          />
        )}

        {page === "schedule" && (
          <Schedule
            rounds={rounds}
            handleEditRound={handleEditRound}
            handleDeleteRound={handleDeleteRound}
            setShowAddModal={setShowAddModal}
            setPage={setPage}
            levelOptions={levelOptions}
            newRoundTime={newRoundTime}
            setNewRoundTime={setNewRoundTime}
            newRoundDesc={newRoundDesc}
            setNewRoundDesc={setNewRoundDesc}
            newRoundLevels={newRoundLevels}
            setNewRoundLevels={setNewRoundLevels}
            editIndex={editIndex}
            setEditIndex={setEditIndex}
            handleAddRound={handleAddRound}
            showAddModal={showAddModal}
            tournamentID={tournamentID}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
