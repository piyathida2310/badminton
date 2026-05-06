"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function BackButton({ target }: { target: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const backToGroupLabel = t("groupManage.backToGroup");

  return (
    <button
      onClick={() => router.push(target)}
      className="mb-6 px-6 py-2 rounded-full bg-[#2ED3B7]/10 border border-[#194185]/20 
      font-bold text-[#194185] shadow-sm hover:scale-110 hover:bg-[#2ED3B7]/20 
      hover:shadow-md transition-all active:scale-95"
    >
      {backToGroupLabel}
    </button>
  );
}

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
    <div className="overflow-x-auto rounded-2xl bg-white/80 backdrop-blur-sm p-5 border border-[#2ED3B7]/20 shadow-md mb-10 transition hover:shadow-lg">
      <h3 className="font-bold text-lg mb-3 text-[#194185]">{title}</h3>
      <table className="w-full text-sm text-gray-700 border-collapse">
        <thead className="bg-[#194185] text-white font-bold">
          <tr>
            {headers.map((h, i) => {
              if (h === "__MERGE__") return null;
              let span = 1;
              while (headers[i + span] === "__MERGE__") span++;

              return (
                <th
                  key={i}
                  colSpan={span}
                  className="border border-white/20 px-3 py-2 text-center"
                >
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const visibleCells = r.slice(0, headers.length);
            return (
              <tr
                key={i}
                className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-[#2ED3B7]/5"
                  } hover:bg-[#2ED3B7]/5 transition`}
              >
                {visibleCells.map((v, j) => (
                  <td
                    key={j}
                    className={`border border-[#2ED3B7]/20 px-3 py-2 text-center ${j === 0 ? "font-semibold text-[#194185]" : ""
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

export function GroupInfo({ totalTeams }: { totalTeams?: number }) {
  const { t } = useLanguage();
  const gm = {
    upperBracket: t("groupManage.upperBracket"),
    upperBracketDesc: t("groupManage.upperBracketDesc"),
    lowerBracket: t("groupManage.lowerBracket"),
    lowerBracketDesc: t("groupManage.lowerBracketDesc"),
  };

  return (
    <div className="text-center mb-8">
      <p className="font-bold text-[#194185] text-base mb-1">{gm.upperBracket}</p>
      <p className="text-gray-600 text-sm mb-4">
        {gm.upperBracketDesc}
      </p>
      <p className="font-bold text-[#2ED3B7] text-base mb-1">{gm.lowerBracket}</p>
      <p className="text-gray-600 text-sm">
        {gm.lowerBracketDesc}
      </p>
    </div>
  );
}
