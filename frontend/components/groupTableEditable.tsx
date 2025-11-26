"use client";
import React, { useState } from "react";

export function GroupTableEditable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: any[][];
}) {
  const [data, setData] = useState(rows);
  const [editing, setEditing] = useState(false);

  const handleChange = (rowIndex: number, setIndex: number, value: string) => {
    const newData = [...data];
    const [left, right] = newData[rowIndex][headers.indexOf("SET")]
      .split(":")
      .map((v: string) => v.trim());
    const updated =
      setIndex === 0
        ? `${value || ""} : ${right}`
        : `${left} : ${value || ""}`;
    newData[rowIndex][headers.indexOf("SET")] = updated;
    setData(newData);
  };

  const handleSimpleChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 border border-gray-200 shadow-md mb-10 transition hover:shadow-lg">
      {/* หัวข้อ + ปุ่ม */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-center sm:text-left">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <button
          onClick={() => setEditing(!editing)}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition duration-200
          ${editing
              ? "bg-gradient-to-r from-pink-300 to-amber-200 text-gray-800 hover:opacity-90"
              : "bg-gradient-to-r from-blue-200 to-violet-200 text-gray-700 hover:opacity-90"
            }`}
        >
          {editing ? "บันทึก" : "กรอกคะแนน"}
        </button>
      </div>

      {/* ตาราง */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full text-xs sm:text-sm text-gray-700 border-collapse">
          <thead className="bg-gray-100/70 text-gray-800 font-semibold">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="border border-gray-200 px-2 sm:px-3 py-2 text-center whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={i}
                className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50/80"
                  } hover:bg-gray-100/60 transition`}
              >
                {r.map((v, j) => (
                  <td
                    key={j}
                    className={`border border-gray-200 px-2 sm:px-3 py-2 text-center ${j === 0 ? "font-semibold text-gray-900" : ""
                      }`}
                  >
                   {headers[j] === "SET" ? (
  editing ? (
    <div className="flex flex-row flex-nowrap items-center justify-center gap-1">
      <input
        type="number"
        value={v.split(":")[0]?.trim() || ""}
        onChange={(e) => handleChange(i, 0, e.target.value)}
        className="w-10 sm:w-12 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-pink-300"
      />
      <span>:</span>
      <input
        type="number"
        value={v.split(":")[1]?.trim() || ""}
        onChange={(e) => handleChange(i, 1, e.target.value)}
        className="w-10 sm:w-12 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-pink-300"
      />
    </div>
  ) : (
    <span className="whitespace-nowrap">{v}</span>   // ⭐ ตรงนี้ช่วยไม่ให้มันตัดบรรทัด
  )
                    ) : headers[j] === "ลูกแบต" ? (
                      <input
                        type="number"
                        value={v}
                        onChange={(e) => handleSimpleChange(i, j, e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded-md px-1 py-0.5 focus:ring-2 focus:ring-pink-300 bg-white"
                      />
                    ) : (
                      v
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
