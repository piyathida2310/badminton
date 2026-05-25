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
  const { language } = useLanguage();
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
            const isMatchTable = headers.length >= 12;
            const isRankTable = !isMatchTable;
            const isRankForfeited = isRankTable && r[9] === "true";

            const hasForfeit = isMatchTable && !!r[14];
            const forfeitedTeam = isMatchTable ? r[15] : undefined;
            const isTeam1Forfeited = hasForfeit && forfeitedTeam === "1";
            const isTeam2Forfeited = hasForfeit && forfeitedTeam === "2";

            const visibleCells = r.slice(0, headers.length);
            return (
              <tr
                key={i}
                className={`text-center ${i % 2 === 0 ? "bg-white" : "bg-[#2ED3B7]/5"
                  } hover:bg-[#2ED3B7]/5 transition`}
              >
                {visibleCells.map((v, j) => {
                  const isColTeam1 = j === 3 || j === 4 || j === 5;
                  const isColTeam2 = j === 9 || j === 10 || j === 11;
                  const shouldHighlightRed = (isColTeam1 && isTeam1Forfeited) || (isColTeam2 && isTeam2Forfeited) || isRankForfeited;

                  return (
                    <td
                      key={j}
                      className={`border border-[#2ED3B7]/20 px-3 py-2 text-center transition-all ${
                        j === 0 ? "font-semibold text-[#194185]" : ""
                      } ${
                        headers[j] === "SET"
                          ? "whitespace-nowrap font-mono min-w-[80px]"
                          : ""
                      } ${
                        shouldHighlightRed
                          ? "bg-rose-50 border-rose-200 text-rose-700 font-semibold"
                          : ""
                      }`}
                    >
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
                        {j === 2 && isRankForfeited && (
                          <span className="block text-[10px] text-rose-600 font-bold mt-1 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 whitespace-normal max-w-[150px] leading-tight animate-pulse">
                            {language === "en" ? "⚠️ Forfeited" : "⚠️ สละสิทธิ์"}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
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
