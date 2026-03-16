"use client";

import { useSearchParams } from "next/navigation";
import MatchTableUser from "../../../../../components/matchTableUser"; // Consistent path
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || searchParams.get("tournamentId");
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
        {t("matchHistory.pageTitle")}
      </h1>

      {id ? (
        <MatchTableUser tournamentId={id} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-medium">{t("matchHistory.selectFirst")}</p>
        </div>
      )}
    </main>
  );
}
