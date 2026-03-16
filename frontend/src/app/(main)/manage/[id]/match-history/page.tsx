"use client";

import { useParams } from "next/navigation";
import MatchTable from "../../../../../../components/matchTable";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MatchHistoryPage() {
  const { id } = useParams();
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-pink-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
         {t("matchHistory.pageTitle")}
      </h1>

      <MatchTable tournamentId={id as string} />
    </main>
  );
}
