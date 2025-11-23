"use client";
import { useEffect, useState } from "react";
import RulesTablesPage from "../../../../../components/rulesTables";
import axios from "../../../../lib/api";

interface Tournament {
  id: number;
  name: string;
}

interface Registration {
  id: number;
  tournament: Tournament;
}

export default function Page() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      try {
        const response = await axios.get("/api/user/registrations");
        const data = response.data.data;
        setRegistrations(data);

        // เลือกรายการแข่งแรกโดยอัตโนมัติถ้ามี
        if (data.length > 0) {
          setSelectedTournamentId(String(data[0].tournament.id));
        }
      } catch (error) {
        console.error("Failed to fetch user registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e07a5f] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ยังไม่มีรายการแข่งขัน
          </h2>
          <p className="text-gray-600 mb-6">
            คุณยังไม่ได้สมัครเข้าร่วมการแข่งขันใดๆ
          </p>
          <a
            href="/user/tournament"
            className="inline-block bg-gradient-to-r from-[#e07a5f] to-[#f4a261] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            ดูรายการแข่งขัน
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] py-6 px-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#ffd4c4]">
          <label className="block text-lg font-semibold text-[#e07a5f] mb-3">
            เลือกรายการแข่งขัน
          </label>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full p-3 border-2 border-[#ffd4c4] rounded-xl bg-[#fffaf7] text-gray-800 font-medium focus:outline-none focus:border-[#e07a5f] focus:ring-2 focus:ring-[#e07a5f]/20 transition-all"
          >
            {registrations.map((reg) => (
              <option key={reg.id} value={String(reg.tournament.id)}>
                {reg.tournament.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTournamentId && (
        <RulesTablesPage tournamentId={selectedTournamentId} />
      )}
    </div>
  );
}
