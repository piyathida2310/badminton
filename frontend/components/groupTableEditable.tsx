"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit3, Save, X } from "lucide-react";
import Swal from "sweetalert2";

export function GroupTableEditable({
  title,
  headers,
  rows,
  onSave,
  isAdmin,
}: {
  title: string;
  headers: string[];
  rows: any[][];
  onSave?: (data: any[][]) => void;
  isAdmin?: boolean;
}) {
  const { t, language } = useLanguage();
  const gm = {
    setCol: t("groupManage.setCol"),
    shuttleCol: t("groupManage.shuttleCol"),
    timeCol: t("groupManage.timeCol"),
    saveBtn: t("groupManage.saveBtn"),
    edit: t("groupManage.edit"),
    cancel: t("common.cancel"),
    action: t("manage.manage"),
  };

  const [data, setData] = useState(rows);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setData(rows);
  }, [rows]);

  const handleSetChange = (rowIndex: number, setIdx: number, side: number, value: string) => {
    if (!isAdmin) return;
    if (value !== "" && parseInt(value) < 0) return;

    const newData = [...data];
    const colIdx = headers.indexOf(gm.setCol);
    let valStr = newData[rowIndex][colIdx] || "";

    let sets = valStr.includes(",") ? valStr.split(",") : [valStr];
    sets = sets.slice(0, 2);
    while (sets.length < 2) {
      sets.push(" : ");
    }

    const currentSet = sets[setIdx] || " : ";
    const parts = currentSet.split(":");
    const left = parts[0] ? parts[0].trim() : "";
    const right = parts[1] ? parts[1].trim() : "";

    const newSet = side === 0 ? `${value} : ${right}` : `${left} : ${value}`;

    sets[setIdx] = newSet;
    newData[rowIndex][colIdx] = sets.join(",");
    setData(newData);
  };

  const handleSimpleChange = (rowIndex: number, colIndex: number, value: string) => {
    if (!isAdmin) return;
    if (headers[colIndex] === gm.shuttleCol && value !== "" && parseInt(value) < 0) return;

    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const handleSave = (rowIndex: number) => {
    const colIdx = headers.indexOf(gm.setCol);
    const setScore = data[rowIndex][colIdx] as string;

    // Validate Badminton Score Rules
    let isDeuceValid = true;
    let requiresRemark = false;
    let deuceErrorMessage = "";

    const setStrings = setScore.split(",").map(s => s.trim()).filter(s => s && s.includes(":"));
    for (const s of setStrings) {
      const parts = s.split(":").map(v => parseInt(v.trim()));
      const val1 = parts[0];
      const val2 = parts[1];

      if (isNaN(val1) || isNaN(val2)) continue;
      if (val1 === 0 && val2 === 0) continue;

      if (val1 > 30 || val2 > 30) {
        isDeuceValid = false;
        deuceErrorMessage = language === "en"
          ? "Score cannot exceed 30 points!"
          : "คะแนนสูงสุดต้องไม่เกิน 30 คะแนน!";
        break;
      }

      const winnerScore = Math.max(val1, val2);
      const loserScore = Math.min(val1, val2);

      // Check if it is a standard winning set score:
      // 1. 21 points and lead by at least 2 points (e.g. 21-15, 21-19)
      // 2. >21 and <30 and lead by exactly 2 points (e.g. 22-20, 29-27)
      // 3. 30 points and lead by 1 or 2 points (30-28, 30-29)
      const isStandardWin = 
        (winnerScore === 21 && loserScore <= 19) ||
        (winnerScore > 21 && winnerScore < 30 && loserScore === winnerScore - 2) ||
        (winnerScore === 30 && (loserScore === 28 || loserScore === 29));

      if (!isStandardWin) {
        requiresRemark = true;
      }
    }

    if (!isDeuceValid) {
      Swal.fire({
        icon: "error",
        title: language === "en" ? "Invalid Score" : "คะแนนไม่ถูกต้อง",
        text: deuceErrorMessage,
        confirmButtonText: language === "en" ? "OK" : "ตกลง",
        confirmButtonColor: "#194185",
      });
      return;
    }

    if (requiresRemark) {
      const team1Name = data[rowIndex][4] || (language === "en" ? "Team 1" : "ทีม 1");
      const team2Name = data[rowIndex][10] || (language === "en" ? "Team 2" : "ทีม 2");

      Swal.fire({
        title: language === "en" ? "Select Forfeiting Team" : "เลือกทีมที่สละสิทธิ์",
        text: language === "en"
          ? "Please select which team is withdrawing/forfeiting this match:"
          : "โปรดเลือกทีมที่ต้องการสละสิทธิ์/แพ้บายในแมตช์นี้:",
        input: "select",
        inputOptions: {
          "1": team1Name,
          "2": team2Name
        },
        inputPlaceholder: language === "en" ? "Select team..." : "กรุณาเลือกทีม...",
        showCancelButton: true,
        confirmButtonText: language === "en" ? "Next" : "ถัดไป",
        cancelButtonText: language === "en" ? "Cancel" : "ยกเลิก",
        confirmButtonColor: "#194185",
        inputValidator: (value) => {
          if (!value) {
            return language === "en" ? "You must select a team!" : "คุณจำเป็นต้องเลือกทีม!";
          }
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const forfeitingTeamIndex = result.value; // "1" or "2"
          const forfeitingTeamName = forfeitingTeamIndex === "1" ? team1Name : team2Name;

          Swal.fire({
            title: language === "en" ? "Enter Remark / Reason" : "กรุณากรอกหมายเหตุ",
            text: language === "en"
              ? `Enter the forfeit reason for ${forfeitingTeamName}:`
              : `ระบุเหตุผลการสละสิทธิ์ของทีม ${forfeitingTeamName}:`,
            input: "text",
            inputPlaceholder: language === "en" ? "e.g., Injured during warm-up" : "เช่น บาดเจ็บระหว่างแข่งขัน",
            showCancelButton: true,
            confirmButtonText: language === "en" ? "Confirm" : "ยืนยันการบันทึก",
            cancelButtonText: language === "en" ? "Cancel" : "ยกเลิก",
            confirmButtonColor: "#194185",
            inputValidator: (value) => {
              if (!value || !value.trim()) {
                return language === "en" ? "You must enter a remark!" : "คุณจำเป็นต้องกรอกหมายเหตุ!";
              }
            }
          }).then((innerResult) => {
            if (innerResult.isConfirmed && innerResult.value) {
              const remarkValue = innerResult.value.trim();
              const newData = [...data];
              newData[rowIndex][14] = remarkValue;
              newData[rowIndex][15] = forfeitingTeamIndex;

              if (onSave) {
                onSave(newData);
              }
              setEditingRowIndex(null);
            }
          });
        }
      });
    } else {
      if (onSave) {
        onSave(data);
      }
      setEditingRowIndex(null);
    }
  };

  const handleCancel = (rowIndex: number) => {
    const newData = [...data];
    newData[rowIndex] = [...rows[rowIndex]];
    setData(newData);
    setEditingRowIndex(null);
  };

  const displayHeaders = isAdmin ? [...headers, gm.action] : headers;

  return (
    <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-md mb-10">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-[#194185]">{title}</h3>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full text-xs sm:text-sm text-gray-700 border-collapse">
          <thead className="bg-[#194185] text-white font-bold">
            <tr>
              {displayHeaders.map((h, i) => {
                if (h === "__MERGE__") return null;
                let span = 1;
                while (displayHeaders[i + span] === "__MERGE__") span++;

                return (
                  <th
                    key={i}
                    colSpan={span}
                    className="border border-white/20 px-2 sm:px-3 py-2 text-center whitespace-nowrap"
                  >
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => {
              const isEditing = editingRowIndex === i;
              return (
                <tr
                  key={r[13] || i}
                  className={`group text-center transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-[#194185]/5`}
                >
                  {r.slice(0, headers.length).map((v, j) => {
                    const hasForfeit = !!r[14];
                    const forfeitedTeam = r[15];
                    const isTeam1Forfeited = hasForfeit && forfeitedTeam === "1";
                    const isTeam2Forfeited = hasForfeit && forfeitedTeam === "2";

                    const isColTeam1 = j === 3 || j === 4 || j === 5;
                    const isColTeam2 = j === 9 || j === 10 || j === 11;
                    const shouldHighlightRed = (isColTeam1 && isTeam1Forfeited) || (isColTeam2 && isTeam2Forfeited);

                    return (
                      <td
                        key={j}
                        className={`border border-gray-200 px-2 sm:px-3 py-2 text-center transition-all ${
                          j === 0 ? "font-semibold text-gray-900" : ""
                        } ${
                          shouldHighlightRed
                            ? "bg-rose-50 border-rose-200 text-rose-700 font-semibold"
                            : ""
                        }`}
                      >
                        {headers[j] === gm.setCol ? (
                          isEditing ? (
                            <div className="flex flex-col gap-1 py-1">
                              {(() => {
                                let setsArray = v ? (v.includes(",") ? v.split(",") : [v]) : [" : "];
                                setsArray = setsArray.slice(0, 2);
                                while (setsArray.length < 2) {
                                  setsArray.push(" : ");
                                }
                                return setsArray.map((setStr: string, setIdx: number) => {
                                  const parts = setStr.split(":");
                                  const scoreLeft = parts[0]?.trim() || "";
                                  const scoreRight = parts[1]?.trim() || "";
                                  return (
                                    <div key={setIdx} className="flex flex-row flex-nowrap items-center justify-center gap-1">
                                      <span className="text-gray-400 text-[10px] font-semibold w-8 text-right mr-0.5">Set {setIdx + 1}:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        value={scoreLeft}
                                        onChange={(e) => handleSetChange(i, setIdx, 0, e.target.value)}
                                        className="w-10 sm:w-12 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-[#194185]/30 bg-white text-gray-900 font-mono"
                                      />
                                      <span>:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        value={scoreRight}
                                        onChange={(e) => handleSetChange(i, setIdx, 1, e.target.value)}
                                        className="w-10 sm:w-12 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-[#194185]/30 bg-white text-gray-900 font-mono"
                                      />
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 items-center justify-center font-mono">
                              {v.split(",").slice(0, 2).map((s: string, idx: number) => (
                                <div key={idx} className="whitespace-nowrap h-6 flex items-center">
                                  {s}
                                </div>
                              ))}
                            </div>
                          )
                        ) : (headers[j] === gm.shuttleCol || headers[j] === gm.timeCol) && isEditing ? (
                          <input
                            type={headers[j] === gm.timeCol ? "time" : "number"}
                            min={headers[j] !== gm.timeCol ? 0 : undefined}
                            value={v}
                            onChange={(e) => handleSimpleChange(i, j, e.target.value)}
                            className={`text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-[#194185]/30 bg-white ${
                              headers[j] === gm.timeCol ? "w-20" : "w-16"
                            }`}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span>{v}</span>
                            {j === 4 && isTeam1Forfeited && (
                              <span className="block text-[10px] text-rose-600 font-bold mt-1 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 whitespace-normal max-w-[150px] leading-tight">
                                {language === "en" ? "⚠️ Forfeited:" : "⚠️ สละสิทธิ์:"} {r[14]}
                              </span>
                            )}
                            {j === 10 && isTeam2Forfeited && (
                              <span className="block text-[10px] text-rose-600 font-bold mt-1 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 whitespace-normal max-w-[150px] leading-tight">
                                {language === "en" ? "⚠️ Forfeited:" : "⚠️ สละสิทธิ์:"} {r[14]}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {isAdmin && (
                    <td className="border border-gray-200 px-2 sm:px-3 py-2 text-center">
                      <div className="flex gap-2 justify-center items-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(i)}
                              className="p-2 bg-[#2ED3B7] text-[#194185] rounded-lg hover:bg-[#2ED3B7]/80 shadow-sm transition-all active:scale-95"
                              title={gm.saveBtn}
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(i)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all active:scale-95"
                              title={gm.cancel}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingRowIndex(i)}
                            className="p-2 text-[#194185]/40 hover:text-[#194185] hover:bg-[#194185]/10 rounded-lg transition-all"
                            title={gm.edit}
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
