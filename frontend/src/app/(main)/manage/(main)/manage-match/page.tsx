"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { tournament } from "../../../../../../interface/manage"

import Form from "../../../../../../components/form";
import Schedule from "../../../../../../components/schedule";
import Guideline from "../../../../../../components/guideline";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "@/lib/api";
import { compressImage } from "@/lib/media-utils";
import Swal from "sweetalert2";
export default function TournamentManagePage() {
  const [page, setPage] = useState<"organize" | "rules" | "schedule">(
    "organize"
  );
  const router = useRouter();
  const { t } = useLanguage();



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
  const getTranslatedRules = () => {
    const raw = t('manageMatch.defaultRules');
    if (Array.isArray(raw)) {
      return (raw as string[]).join("\n");
    }
    // Fallback if not an array
    if (typeof raw === 'string') return raw;
    return "";
  };

  const [rulesText, setRulesText] = useState<string>("");

  useEffect(() => {
    setRulesText(getTranslatedRules());
  }, [t]);


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
  const toggleValue = (arr: string[], val: string, setArr: React.Dispatch<React.SetStateAction<string[]>>) => {
    setArr((prev: string[]) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // บีบอัดรูปภาพก่อนเก็บลง state
      const compressedFile = await compressImage(file, {
        maxWidth: type === "poster" ? 1200 : 800,
        quality: 0.8
      });

      if (type === "poster") {
        setPosterFile(compressedFile);
      } else {
        setQrFile(compressedFile);
      }

      // สำหรับ preview
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "poster") setPosterPreview(reader.result as string);
        if (type === "qr") setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Compression error:", error);
    }
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
      isLowerBracket: bracketLines.includes("สายล่าง"),
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
      if (exists) return alert(t('manageMatch.timeExists'));
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

  // --- ฟังก์ชันบันทึกข้อมูลทั้งหมด ---
  const handleFinalRegister = async () => {
    if (!tournament) return;

    try {
      // 1. สร้างกติกา
      const rulesRes = await axios.post("/rules", { content: rulesText });
      const ruleId = rulesRes.data.data.id;

      // 2. สร้างรายการแข่งขัน
      const formData = new FormData();
      formData.append("name", tournament.name);
      formData.append("playType", tournament.playType);
      formData.append("rank", JSON.stringify(tournament.rank));
      formData.append("location", tournament.location);
      formData.append("shuttlePrice", String(tournament.shuttlePrice));
      formData.append("maxPlayers", String(tournament.maxPlayers));
      if (tournament.posterImg) formData.append("posterImg", tournament.posterImg);
      if (tournament.qrCodeImg) formData.append("qrCodeImg", tournament.qrCodeImg);
      formData.append("startDate", tournament.startDate);
      formData.append("ruleId", String(ruleId));
      formData.append("isLowerBracket", String(tournament.isLowerBracket));

      const tourRes = await axios.post("/tournament", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newTournamentID = tourRes.data.data.id;

      // 3. สร้างรอบการแข่งขัน
      for (const round of rounds) {
        const payload = {
          time: round.time.replace(" น.", "").trim(), // แปลง "08:30 น." -> "08:30"
          detail: round.desc,
          rank: round.levels || [],
          tournamentId: newTournamentID,
        };
        await axios.post("/compet", payload);
      }

      Swal.fire({
        title: "ลงทะเบียนสำเร็จ!",
        text: "สร้างรายการแข่งขันเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonColor: "#b3e5fc",
      });

      router.push("/manage");
    } catch (error) {
      console.error("Final registration failed:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
      });
    }
  };

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
            onFinalSubmit={handleFinalRegister}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
