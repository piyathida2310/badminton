"use client";
import { useRouter } from "next/navigation";
import React from "react";

export function BackButton({ target }: { target: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(target)}
      className="mb-6 px-6 py-2 rounded-full bg-white/80 border border-gray-300 
      font-semibold text-gray-700 shadow-sm hover:scale-110 hover:bg-white 
      hover:shadow-md transition"
    >
      กลับไปหน้ากลุ่ม
    </button>
  );
}




//  หัวข้อกลุ่ม
export function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <h2
      className="text-2xl md:text-3xl font-extrabold text-center mb-6"
      style={{
        color,
        textShadow: "0px 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {text}
    </h2>
  );
}

//  ตารางข้อมูล
export function GroupTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: any[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white/80 backdrop-blur-sm p-5 border border-gray-200 shadow-md mb-10 transition hover:shadow-lg">
      <h3 className="font-bold text-lg mb-3 text-gray-800">{title}</h3>
      <table className="w-full text-sm text-gray-700 border-collapse">
        <thead className="bg-gray-100/70 text-gray-800 font-semibold">
          <tr>
            {headers.map((h, i) => {
              if (h === "__MERGE__") return null;
              let span = 1;
              while (headers[i + span] === "__MERGE__") span++;

              return (
                <th
                  key={i}
                  colSpan={span}
                  className="border border-gray-200 px-3 py-2 text-center"
                >
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            // Only show as many columns as there are headers (hide extra data like IDs)
            const visibleCells = r.slice(0, headers.length);
            return (
              <tr
                key={i}
                className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50/80"
                  } hover:bg-gray-100/60 transition`}
              >
                {visibleCells.map((v, j) => (
                  <td
                    key={j}
                    className={`border border-gray-200 px-3 py-2 text-center ${j === 0 ? "font-semibold text-gray-900" : ""
                      } ${headers[j] === "SET"
                        ? "whitespace-nowrap font-mono min-w-[80px]"
                        : ""
                      }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

//  ข้อมูลคำอธิบายสายบน/สายล่าง
//  ข้อมูลคำอธิบายสายบน/สายล่าง
export function GroupInfo({ totalTeams }: { totalTeams?: number }) {
  return (
    <div className="text-center mb-8">
      <p className="font-semibold text-red-500 text-base mb-1">สายบน</p>
      <p className="text-gray-600 text-sm mb-4">
        ทีมอันดับ 1–2 ของกลุ่ม เข้ารอบก่อนรองชนะเลิศสายบน (Quarter Finals)
      </p>
      <p className="font-semibold text-red-500 text-base mb-1">สายล่าง</p>
      <p className="text-gray-600 text-sm">
        ทีมอันดับ 3–4 ของกลุ่ม เข้ารอบก่อนรองชนะเลิศสายล่าง (Quarter Finals)
      </p>
    </div>
  );
}
