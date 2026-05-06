"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit3, Save, X } from "lucide-react";

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
  const { t } = useLanguage();
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
    let valStr = newData[rowIndex][colIdx];

    let sets = valStr.includes(",") ? valStr.split(",") : [valStr];
    if (sets.length < 2) sets.push(" : ");

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
    if (onSave) {
      onSave(data);
    }
    setEditingRowIndex(null);
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
                  {r.slice(0, headers.length).map((v, j) => (
                    <td
                      key={j}
                      className={`border border-gray-200 px-2 sm:px-3 py-2 text-center ${
                        j === 0 ? "font-semibold text-gray-900" : ""
                      }`}
                    >
                      {headers[j] === gm.setCol ? (
                        isEditing ? (
                          <div className="flex flex-col gap-1">
                            {v.split(",").map((setStr: string, setIdx: number) => (
                              <div key={setIdx} className="flex flex-row flex-nowrap items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={setStr.split(":")[0]?.trim() || ""}
                                  onChange={(e) => handleSetChange(i, setIdx, 0, e.target.value)}
                                  className="w-10 sm:w-12 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-[#194185]/30"
                                />
                                <span>:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={setStr.split(":")[1]?.trim() || ""}
                                  onChange={(e) => handleSetChange(i, setIdx, 1, e.target.value)}
                                  className="w-10 sm:w-12 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-[#194185]/30"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            {v.split(",").map((s: string, idx: number) => (
                              <div key={idx} className="whitespace-nowrap h-8 flex items-center">
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
                        v
                      )}
                    </td>
                  ))}
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
