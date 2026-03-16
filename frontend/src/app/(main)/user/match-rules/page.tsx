"use client";
import { useSearchParams } from "next/navigation";
import RulesTablesPage from "../../../../../components/rulesTables";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/contexts/translations";

export default function Page() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] py-6 px-4">
      {tournamentId ? (
        <RulesTablesPage tournamentId={tournamentId} readOnly={true} />
      ) : (
        <EmptyRulesView />
      )}
    </div>
  );
}

function EmptyRulesView() {
  const { t, language } = useLanguage();

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
    <div className="min-h-screen bg-transparent py-4 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">
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

        {/* ---------------------- กติกาแข่งขัน (ว่าง) ---------------------- */}
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
                  <td className="p-3 bg-[#fffaf7] space-y-2 h-72 overflow-y-auto whitespace-pre-line text-gray-700">
                    {(translations[language]?.manageMatch as any)?.defaultRules?.join('\n\n')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- เวลารอบการแข่งขัน (ว่าง) ---------------------- */}
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
                <tr>
                  <td colSpan={3} className="p-3 text-gray-500 text-center">
                    {t("matchRules.noSchedule")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
