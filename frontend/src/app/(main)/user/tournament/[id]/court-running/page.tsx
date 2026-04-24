"use client";

import { useSearchParams, useParams } from "next/navigation";
import MatchTableUser from "../../../../../../../components/matchTableUser"; // Consistent path
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const searchParams = useSearchParams();
  const params = useParams();
  const rawId = params?.id || searchParams.get("id") || searchParams.get("tournamentId");
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2ED3B7]/10 via-white to-white p-6">
      <h1 className="text-2xl font-bold text-center mb-4 text-[#194185]">
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
