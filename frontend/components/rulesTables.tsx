"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "../src/lib/api";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/contexts/translations";

interface mathRules {
  id: string;
  content: string;
}

interface mathCom {
  id: string;
  time: string;
  rank: string[];
  detail: string;
}

interface tournamentmath {
  rule: mathRules;
  competition: mathCom[]; // ต้องเป็น array
}

interface RulesTablesPageProps {
  tournamentId?: string | string[];
  readOnly?: boolean;
}

export default function RulesTablesPage({ tournamentId, readOnly = false }: RulesTablesPageProps = {}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<tournamentmath>();
  const { t, language } = useLanguage();

  const getDisplayRule = (content: string | undefined): string => {
    if (!content) return "";
    
    // Normalize newlines and trim completely (remove all whitespaces for exact check)
    const cleanContent = content.replace(/\s+/g, '');
    
    // Get language default rules from translations
    const cleanTh = (translations["th"].manageMatch as any).defaultRules.join("").replace(/\s+/g, '');
    const cleanEn = (translations["en"].manageMatch as any).defaultRules.join("").replace(/\s+/g, '');

    // Check if it starts with a significant portion of the default rules (first 100 non-whitespace chars)
    // or if it matches perfectly without spaces.
    if (cleanContent === cleanTh || cleanContent === cleanEn || 
        cleanContent.startsWith(cleanTh.substring(0, 50)) || 
        cleanContent.startsWith(cleanEn.substring(0, 50))) {
      return (translations[language].manageMatch as any).defaultRules.join("\n\n");
    }
    
    // Otherwise return custom rules
    return content;
  };

  // Get tournament ID from props, URL params, or query params
  const id = tournamentId || params?.id || searchParams?.get("id");

  // ------------ STATE สำหรับ UI EDIT ----------------
  const [editingRule, setEditingRule] = useState(false);
  const [editingCompet, setEditingCompet] = useState<number | null>(null);
  const [compUI, setCompUI] = useState({
    time: "",
    rank: "",
    detail: "",
    openRankDropdown: false,
  });

  const formatRank = (rank: string) => {
    switch (rank) {
      case "P_MINUS":
        return "P-";
      case "P_PLUS":
        return "P+";
      default:
        return rank;
    }
  };

  const reverseFormatRank = (rank: string) => {
    switch (rank) {
      case "P-":
        return "P_MINUS";
      case "P+":
        return "P_PLUS";
      default:
        return rank;
    }
  };

  // ============ popup ยืนยันบันทึก ===============
  const [confirmSave, setConfirmSave] = useState(false);
  const [saveType, setSaveType] = useState<"rule" | "compet" | null>(null);
  const [saveIndex, setSaveIndex] = useState<number | null>(null);

  const fetchRules = async () => {
    if (!id) {
      console.error("No tournament ID provided");
      return;
    }

    try {
      const res = await axios.get(`/api/tournament/${id}`);
      const data = res.data.data;
      console.log("Tournament data:", data);

      setTournament({
        rule: data.rule,
        competition: data.competition,
      });
    } catch (error) {
      console.error("Failed to fetch tournament rules:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRules();
    }
  }, [id]);

  const handelUpdateRule = async (id: string) => {
    try {
      await axios.put(`/api/rules/${id}`, {
        content: getDisplayRule(tournament?.rule.content),
      });

      Swal.fire({
        title: t("matchRules.saveSuccess"),
        text: t("matchRules.saveSuccessDesc1"),
        icon: "success",
        confirmButtonText: t("common.confirm"),
        confirmButtonColor: "#f9a825",
        background: "#fffef5",
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: t("matchRules.saveError"),
        text: t("matchRules.saveErrorDesc"),
        icon: "error",
        confirmButtonText: t("common.close"),
        confirmButtonColor: "#e53935",
        background: "#fff7f7",
      });
    }
  };

  const handelUpdateCom = async (id: string, index: number) => {
    try {
      // rank เป็น string เช่น "BG / NB"
      // ต้องแปลงกลับไปเป็น array
      const rankArray = compUI.rank.split(" / ").filter((r) => r.trim() !== "");
      const dbRankArray = rankArray.map(reverseFormatRank);

      const payload = {
        time: compUI.time, // string เช่น "14:30"
        detail: compUI.detail, // ข้อความ
        rank: dbRankArray, // array เช่น ["BG", "NB"]
      };

      await axios.put(`/api/compet/${id}`, payload);

      Swal.fire({
        title: t("matchRules.saveSuccess"),
        text: t("matchRules.saveSuccessDesc2"),
        icon: "success",
        confirmButtonText: t("common.confirm"),
        confirmButtonColor: "#f9a825",
        background: "#fffef5",
      });

      // อัปเดต UI บนหน้าโดยตรง
      setTournament((prev: any) => {
        const updatedComp = [...prev!.competition];
        updatedComp[index] = {
          ...updatedComp[index],
          time: new Date(`1970-01-01T${compUI.time}:00`).toISOString(), // ทำให้ UI ใช้ได้ทันที
          detail: compUI.detail,
          rank: dbRankArray,
        };

        return { ...prev, competition: updatedComp };
      });

      setEditingCompet(null);
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "อัปเดตไม่สำเร็จ กรุณาลองใหม่",
        icon: "error",
        confirmButtonText: "ปิด",
        confirmButtonColor: "#e53935",
        background: "#fff7f7",
      });
    }
  };

  const competitionTypeData = [
    {
      color: "bg-[#b3e5fc]",
      count: t("matchRules.pairs16"),
      desc: (
        <>
          <p>{t("matchRules.compTypeDesc1")}</p>
          <p>{t("matchRules.compTypeDesc2")}</p>
          <p>{t("matchRules.compTypeDesc3")}</p>
        </>
      ),
    },
    {
      color: "bg-[#ffe1df]",
      count: t("matchRules.pairs32"),
      desc: (
        <>
          <p>{t("matchRules.compTypeDesc4")}</p>
          <p>{t("matchRules.compTypeDesc5")}</p>
          <p>{t("matchRules.compTypeDesc6")}</p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] py-10 px-4 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ----------------------- POPUP SAVE CONFIRM ------------------------ */}
        {confirmSave && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl border w-[300px] text-center">
              <h2 className="text-lg font-semibold text-[#e07a5f]">
                {t("matchRules.saveConfirmTitle")}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {t("matchRules.saveConfirmDesc")}
              </p>

              <div className="flex justify-center gap-3 mt-5">
                <button
                  className="px-4 py-2 bg-[#e07a5f] text-white rounded-lg"
                  onClick={() => {
                    setConfirmSave(false);

                    if (saveType === "rule") {
                      handelUpdateRule(tournament?.rule.id ?? "");
                    }

                    if (saveType === "compet" && saveIndex !== null) {
                      const compId = tournament?.competition[saveIndex].id; // ต้องมี id ของ competition
                      handelUpdateCom(String(compId), saveIndex);
                    }

                    setEditingCompet(null);
                  }}
                >
                  {t("common.save")}
                </button>

                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  onClick={() => setConfirmSave(false)}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------- ประเภทการแข่งขัน ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            {t("matchRules.pageTitle")}
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] text-gray-900 text-center font-semibold">
                  <th className="border border-[#ffd4c4]/70 p-3 w-32 rounded-tl-2xl">
                    {t("matchRules.count")}
                  </th>
                  <th className="border border-[#ffd4c4]/70 p-3 rounded-tr-2xl">
                    {t("matchRules.format")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitionTypeData.map((r, i) => (
                  <tr
                    key={i}
                    className="divide-x divide-[#ffd8c0] border-b border-[#ffddd0]"
                  >
                    <td
                      className={`${r.color} p-3 text-center font-bold align-top`}
                    >
                      {r.count}
                    </td>
                    <td className="p-3 bg-[#fffaf7]">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- กติกา ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            {t("matchRules.rulesTitle")}
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full text-sm leading-relaxed border-collapse">
              <tbody>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
                  <td className="p-3 rounded-tl-2xl border border-[#ffd8c0] w-48">
                    {t("matchRules.category")}
                  </td>
                  <td className="p-3 rounded-tr-2xl border border-[#ffd8c0]">
                    {t("matchRules.detail")}
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    {t("matchRules.groupStage")}
                  </td>
                  <td className="p-3 bg-[#fffaf7] space-y-1">
                    <p className="text-red-600 font-semibold">{t("matchRules.ruleGroupDesc1")}</p>
                    <p>{t("matchRules.ruleGroupDesc2")}</p>
                    <p>{t("matchRules.ruleGroupDesc3")}</p>
                    <ul className="ml-5 list-disc">
                      <li>{t("matchRules.ruleGroupDesc4")}</li>
                      <li>{t("matchRules.ruleGroupDesc5")}</li>
                      <li>{t("matchRules.ruleGroupDesc6")}</li>
                      <li>{t("matchRules.ruleGroupDesc7")}</li>
                    </ul>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    {t("matchRules.knockOut")}
                  </td>
                  <td className="p-3 bg-[#fffaf7]">
                    {t("matchRules.ruleKnockOutDesc")}
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    {t("matchRules.byeScore")}
                  </td>
                  <td className="p-3 bg-[#fffaf7] space-y-1">
                    <p>{t("matchRules.ruleByeDesc1")}</p>
                    <p>{t("matchRules.ruleByeDesc2")}</p>
                    <p>{t("matchRules.ruleByeDesc3")}</p>
                    <p>{t("matchRules.ruleByeDesc4")}</p>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    {t("matchRules.serving")}
                  </td>
                  <td className="p-3 bg-[#fffaf7]">
                    <p>{t("matchRules.ruleServeDesc1")}</p>
                    <p>{t("matchRules.ruleServeDesc2")}</p>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#ffe66f] font-semibold text-center align-top text-[#d6336c] border-r border-[#ffd8c0]">
                    {t("matchRules.important")}
                  </td>
                  <td className="p-3 bg-[#fff4f4] font-semibold text-[#d6336c]">
                    <p>{t("matchRules.ruleImportDesc1")}</p>
                    <p>{t("matchRules.ruleImportDesc2")}</p>
                    <p>{t("matchRules.ruleImportDesc3")}</p>
                    <p>{t("matchRules.ruleImportDesc4")}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- กติกาแข่งขัน ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            {t("matchRules.matchRulesTitle")}
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border bg-white">
            <table className="w-full text-sm leading-relaxed">
              <tbody>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
                  <td className="p-3 border">{t("matchRules.detail")}</td>
                </tr>

                <tr>
                  <td className="p-3 bg-[#fffaf7] space-y-2">
                    {/* VIEW MODE */}
                    {!editingRule && (
                      <p
                        onDoubleClick={!readOnly ? () => setEditingRule(true) : undefined}
                        className={`${!readOnly ? 'cursor-pointer' : ''} bg-white p-3 rounded-xl border shadow-inner h-72 overflow-y-auto whitespace-pre-line`}
                      >
                        {getDisplayRule(tournament?.rule.content)}
                      </p>
                    )}

                    {/* EDIT MODE */}
                    {editingRule && (
                      <div className="space-y-3">
                        <textarea
                          autoFocus
                          value={getDisplayRule(tournament?.rule.content) || ""}
                          onChange={(e) =>
                            setTournament((prev: any) => ({
                              ...prev,
                              rule: {
                                ...prev!.rule,
                                content: e.target.value,
                              },
                            }))
                          }
                          className="w-full h-72 p-3 bg-white rounded-xl border-2 border-pink-400"
                        />

                        {/* ปุ่มบันทึก + ยกเลิก */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSaveType("rule");

                              setConfirmSave(true);
                            }}
                            className="px-4 py-2 bg-[#e07a5f] text-white rounded-lg"
                          >
                            {t("common.save")}
                          </button>

                          <button
                            className="px-4 py-2 bg-gray-300 rounded-lg"
                            onClick={() => setEditingRule(false)}
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- เวลารอบการแข่งขัน ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            {t("matchRules.scheduleTitle")}
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border bg-white">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center">
                  <th className="p-3 border">{t("matchRules.time")}</th>
                  <th className="p-3 border">{t("matchRules.skill")}</th>
                  <th className="p-3 border">{t("matchRules.detail")}</th>
                </tr>
              </thead>

              <tbody>
                {tournament?.competition.map((item, index) => (
                  <tr key={index} className="text-center">
                    {/* TIME */}
                    <td
                      onDoubleClick={!readOnly ? () => {
                        setEditingCompet(index);
                        setCompUI({
                          time: new Date(item.time)
                            .toISOString()
                            .substring(11, 16), // <-- แก้ตรงนี้
                          rank: item.rank.map(formatRank).join(" / "),
                          detail: item.detail,
                          openRankDropdown: false,
                        });
                      } : undefined}
                      className={`p-3 bg-[#fffaf7] border ${!readOnly ? 'cursor-pointer' : ''}`}
                    >
                      {editingCompet === index ? (
                        <div className="space-y-2">
                          <input
                            type="time"
                            value={compUI.time}
                            onChange={(e) =>
                              setCompUI((prev) => ({
                                ...prev,
                                time: e.target.value,
                              }))
                            }
                            className="p-2 border rounded-lg"
                          />

                          {/* ปุ่มบันทึกเพื่อ popup */}
                          <div className="flex gap-2 justify-center">
                            <button
                              className="px-3 py-1 bg-[#e07a5f] text-white rounded-lg"
                              onClick={() => {
                                setSaveType("compet");
                                setSaveIndex(index);
                                setConfirmSave(true);
                              }}
                            >
                              {t("common.save")}
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-300 rounded-lg"
                              onClick={() => setEditingCompet(null)}
                            >
                              {t("common.cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {new Date(item.time).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          น.
                        </>
                      )}
                    </td>

                    {/* RANK */}
                    <td
                      onDoubleClick={!readOnly ? () => {
                        setEditingCompet(index);
                        setCompUI({
                          time: new Date(item.time)
                            .toISOString()
                            .substring(11, 16),
                          rank: item.rank.map(formatRank).join(" / "),
                          detail: item.detail,
                          openRankDropdown: false,
                        });
                      } : undefined}
                      className={`p-3 bg-[#fffaf7] border ${!readOnly ? 'cursor-pointer' : ''}`}
                    >
                      {editingCompet === index ? (
                        <div className="relative">
                          {/* ปุ่มเปิด dropdown */}
                          <div
                            className="p-2 border rounded-lg w-full bg-white cursor-pointer text-left"
                            onClick={() =>
                              setCompUI((prev: any) => ({
                                ...prev,
                                openRankDropdown: !prev.openRankDropdown,
                              }))
                            }
                          >
                            {compUI.rank || t("matchRules.selectRank")}
                          </div>

                          {/* กล่อง dropdown */}
                          {compUI.openRankDropdown && (
                            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                              {["BG", "NB", "N", "S", "P-", "P+"].map((rk) => (
                                <label
                                  key={rk}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-pink-100 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-pink-500"
                                    checked={compUI.rank
                                      .split(" / ")
                                      .includes(rk)}
                                    onChange={() => {
                                      const current = compUI.rank
                                        ? compUI.rank.split(" / ")
                                        : [];
                                      let newRank;

                                      if (current.includes(rk)) {
                                        newRank = current.filter(
                                          (x) => x !== rk
                                        );
                                      } else {
                                        newRank = [...current, rk];
                                      }

                                      setCompUI((prev) => ({
                                        ...prev,
                                        rank: newRank.join(" / "),
                                      }));
                                    }}
                                  />
                                  <span className="text-gray-700">{rk}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>{t("matchRules.level")} {item.rank.map(formatRank).join(" / ")}</>
                      )}
                    </td>

                    {/* DETAIL */}
                    <td
                      onDoubleClick={!readOnly ? () => {
                        setEditingCompet(index);
                        setCompUI({
                          time: new Date(item.time)
                            .toISOString()
                            .substring(11, 16),
                          rank: item.rank.map(formatRank).join(" / "),
                          detail: item.detail,
                          openRankDropdown: false,
                        });
                      } : undefined}
                      className={`p-3 bg-[#fffaf7] border ${!readOnly ? 'cursor-pointer' : ''} text-left whitespace-pre-line`}
                    >
                      {editingCompet === index ? (
                        <textarea
                          value={compUI.detail}
                          onChange={(e) =>
                            setCompUI((prev) => ({
                              ...prev,
                              detail: e.target.value,
                            }))
                          }
                          className="w-full p-2 border rounded-lg"
                          rows={3}
                        />
                      ) : (
                        item.detail
                      )}
                    </td>
                  </tr>
                ))}

                {/* ถ้าไม่มีข้อมูล */}
                {tournament?.competition.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-gray-500 text-center">
                      {t("matchRules.noSchedule")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
