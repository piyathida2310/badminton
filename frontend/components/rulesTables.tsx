"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "../src/lib/api";
import Swal from "sweetalert2";

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
}

export default function RulesTablesPage({ tournamentId }: RulesTablesPageProps = {}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<tournamentmath>();

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
        content: tournament?.rule.content,
      });

      Swal.fire({
        title: "อัปเดตสำเร็จ!",
        text: "ข้อมูลกฎกติกาได้รับการบันทึกแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f9a825",
        background: "#fffef5",
      });
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

  const handelUpdateCom = async (id: string, index: number) => {
    try {
      // rank เป็น string เช่น "BG / NB"
      // ต้องแปลงกลับไปเป็น array
      const rankArray = compUI.rank.split(" / ").filter((r) => r.trim() !== "");

      const payload = {
        time: compUI.time, // string เช่น "14:30"
        detail: compUI.detail, // ข้อความ
        rank: rankArray, // array เช่น ["BG", "NB"]
      };

      await axios.put(`/api/compet/${id}`, payload);

      Swal.fire({
        title: "อัปเดตสำเร็จ!",
        text: "ข้อมูลรอบการแข่งขันได้รับการบันทึกแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
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
          rank: rankArray,
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
      count: "16 คู่",
      desc: (
        <>
          <p>แบ่งกลุ่มละ 4 ทีม จำนวน 4 กลุ่ม</p>
          <p>
            - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 8 ทีม เข้ารอบก่อนรองชนะเลิศ
            สายบน (Quarter Finals)
          </p>
          <p>
            - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 8 ทีม
            เข้ารอบก่อนรองชนะเลิศ สายล่าง (Quarter Finals) (ถ้ามี)
          </p>
        </>
      ),
    },
    {
      color: "bg-[#ffe1df]",
      count: "32 คู่",
      desc: (
        <>
          <p>แบ่งกลุ่มละ 4 ทีม จำนวน 8 กลุ่ม</p>
          <p>
            - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 16 ทีม เข้ารอบ Knock Out 16
            ทีม
          </p>
          <p>
            - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 16 ทีม เข้ารอบ Knock Out
            16 ทีม สายล่าง (ถ้ามี)
          </p>
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
                ยืนยันการบันทึก?
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                ต้องการบันทึกข้อมูลที่แก้ไขหรือไม่
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
                  บันทึก
                </button>

                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  onClick={() => setConfirmSave(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------- ประเภทการแข่งขัน ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            ประเภทการแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] text-gray-900 text-center font-semibold">
                  <th className="border border-[#ffd4c4]/70 p-3 w-32 rounded-tl-2xl">
                    จำนวน
                  </th>
                  <th className="border border-[#ffd4c4]/70 p-3 rounded-tr-2xl">
                    รูปแบบ
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
            กติกา
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full text-sm leading-relaxed border-collapse">
              <tbody>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
                  <td className="p-3 rounded-tl-2xl border border-[#ffd8c0] w-48">
                    หมวด
                  </td>
                  <td className="p-3 rounded-tr-2xl border border-[#ffd8c0]">
                    รายละเอียด
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    รอบแบ่งกลุ่ม
                  </td>
                  <td className="p-3 bg-[#fffaf7] space-y-1">
                    <p className="text-red-600 font-semibold">
                      - แข่งขันแบบ 21 แต้ม 2 เซ็ต ไม่มีดิวส์ ทีมที่ได้แต้มที่ 21
                      ก่อนเป็นฝ่ายชนะ
                    </p>
                    <p>- ทีมชนะ ได้ 2 คะแนน เสมอได้ 1 คะแนน แพ้ได้ 0 คะแนน</p>
                    <p>- เกณฑ์คะแนน:</p>
                    <ul className="ml-5 list-disc">
                      <li>ชนะ 2-0 เซ็ท ได้ 3 คะแนน</li>
                      <li>ชนะ 2-1 เซ็ท ได้ 2 คะแนน</li>
                      <li>แพ้ 1-2 เซ็ท ได้ 1 คะแนน</li>
                      <li>แพ้ 0-2 เซ็ท ได้ 0 คะแนน</li>
                    </ul>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    รอบ Knock Out
                  </td>
                  <td className="p-3 bg-[#fffaf7]">
                    แข่งขันแบบ 21 แต้ม 2 ใน 3 เซ็ท มีดิวส์ (สูงสุด 30 แต้ม)
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    การให้คะแนน BYE
                  </td>
                  <td className="p-3 bg-[#fffaf7] space-y-1">
                    <p>
                      - มาไม่ทันแข่งแต่ยังแข่งต่อได้: ทีมชนะได้ 21-11 / 15-7
                    </p>
                    <p>
                      - ไม่มาแข่งทั้งกลุ่ม: ทีมชนะได้ 2-0 / 15-0,
                      ทีมแพ้หมดสิทธิ์เข้ารอบสายล่าง
                    </p>
                    <p>- บาดเจ็บเล่นต่อไม่ได้: ทีมชนะได้ 21-(คะแนนจริง)</p>
                    <p>- ทุจริต: ทีมอื่นได้ 21-0, ทีมนี้หมดสิทธิ์เข้าสายล่าง</p>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    การเสิร์ฟ
                  </td>
                  <td className="p-3 bg-[#fffaf7]">
                    <p>
                      - เสิร์ฟด้านหน้า: Forehand หรือ Backhand ได้
                      แต่ห้ามพุ่งใส่ตัว
                    </p>
                    <p>
                      - เสิร์ฟด้านหลัง: ได้เฉพาะ Forehand
                      ต้องเป็นวิถีโค้งขึ้นสูง
                    </p>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#ffe66f] font-semibold text-center align-top text-[#d6336c] border-r border-[#ffd8c0]">
                    !!! สำคัญ !!!
                  </td>
                  <td className="p-3 bg-[#fff4f4] font-semibold text-[#d6336c]">
                    - หลังจบแมตช์ทุกครั้ง ต้องลงคะแนนและเซ็นชื่อในใบคะแนน <br />
                    - ทีมชนะนำใบคะแนนส่งที่โต๊ะดำเนินการ <br />
                    - แจ้งแก้คะแนนได้เฉพาะก่อนออกสาย Knock Out เท่านั้น <br />-
                    หากตรวจสอบพบว่ามีการแก้ไข → ถือว่าทุจริต → ปรับแพ้ 21-0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- กติกาแข่งขัน ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            กติกาแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border bg-white">
            <table className="w-full text-sm leading-relaxed">
              <tbody>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
                  <td className="p-3 border">รายละเอียด</td>
                </tr>

                <tr>
                  <td className="p-3 bg-[#fffaf7] space-y-2">
                    {/* VIEW MODE */}
                    {!editingRule && (
                      <p
                        onDoubleClick={() => setEditingRule(true)}
                        className="cursor-pointer bg-white p-3 rounded-xl border shadow-inner h-72 overflow-y-auto whitespace-pre-line"
                      >
                        {tournament?.rule.content}
                      </p>
                    )}

                    {/* EDIT MODE */}
                    {editingRule && (
                      <div className="space-y-3">
                        <textarea
                          autoFocus
                          value={tournament?.rule.content || ""}
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
                            บันทึก
                          </button>

                          <button
                            className="px-4 py-2 bg-gray-300 rounded-lg"
                            onClick={() => setEditingRule(false)}
                          >
                            ยกเลิก
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
            เวลารอบการแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border bg-white">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center">
                  <th className="p-3 border">เวลา</th>
                  <th className="p-3 border">ระดับฝีมือ</th>
                  <th className="p-3 border">รายละเอียด</th>
                </tr>
              </thead>

              <tbody>
                {tournament?.competition.map((item, index) => (
                  <tr key={index} className="text-center">
                    {/* TIME */}
                    <td
                      onDoubleClick={() => {
                        setEditingCompet(index);
                        setCompUI({
                          time: new Date(item.time)
                            .toISOString()
                            .substring(11, 16), // <-- แก้ตรงนี้
                          rank: item.rank.join(" / "),
                          detail: item.detail,
                          openRankDropdown: false,
                        });
                      }}
                      className="p-3 bg-[#fffaf7] border cursor-pointer"
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
                              บันทึก
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-300 rounded-lg"
                              onClick={() => setEditingCompet(null)}
                            >
                              ยกเลิก
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
                      onDoubleClick={() => {
                        setEditingCompet(index);
                        setCompUI({
                          time: new Date(item.time)
                            .toISOString()
                            .substring(11, 16),
                          rank: item.rank.join(" / "),
                          detail: item.detail,
                          openRankDropdown: false,
                        });
                      }}
                      className="p-3 bg-[#fffaf7] border cursor-pointer"
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
                            {compUI.rank || "เลือกระดับฝีมือ"}
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
                        <>ระดับ {item.rank.join(" / ")}</>
                      )}
                    </td>

                    {/* DETAIL */}
                    <td
                      onDoubleClick={() => {
                        setEditingCompet(index);
                        setCompUI({
                          time: new Date(item.time)
                            .toISOString()
                            .substring(11, 16),
                          rank: item.rank.join(" / "),
                          detail: item.detail,
                          openRankDropdown: false,
                        });
                      }}
                      className="p-3 bg-[#fffaf7] border cursor-pointer text-left whitespace-pre-line"
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
                    <td colSpan={3} className="p-3 text-gray-500">
                      ยังไม่มีข้อมูลเวลาการแข่งขัน
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
