"use client";

import React, { useState, useEffect } from "react";
import ThirtyTwoBracket from "./thirtytwobracket";
import api from "../src/lib/api";

const BracketUser = () => {
    const [tournamentId, setTournamentId] = useState<number | null>(null);
    const [ranks, setRanks] = useState<string[]>([]);
    const [selectedRank, setSelectedRank] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get tournamentId from localStorage
        const savedId = localStorage.getItem("selectedTournamentId");
        if (savedId) {
            const id = parseInt(savedId);
            setTournamentId(id);
            fetchTournamentData(id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchTournamentData = async (id: number) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/tournament/${id}`);
            const data = res.data.data;

            if (data) {
                // Handle Ranks
                if (data.rank && Array.isArray(data.rank) && data.rank.length > 0) {
                    setRanks(data.rank);
                    setSelectedRank(data.rank[0]);
                } else if (typeof data.rank === "string") {
                    try {
                        const parsedRanks = JSON.parse(data.rank);
                        if (Array.isArray(parsedRanks) && parsedRanks.length > 0) {
                            setRanks(parsedRanks);
                            setSelectedRank(parsedRanks[0]);
                        }
                    } catch (e) {
                        console.error("Error parsing ranks", e);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch tournament data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#2ED3B7]/5 text-[#194185]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#194185] mb-4"></div>
                <p className="font-bold">กำลังโหลดข้อมูลการแข่งขัน...</p>
            </div>
        );
    }

    if (!tournamentId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#2ED3B7]/5 text-gray-500">
                <p className="text-xl">กรุณาเลือกรายการแข่งขันก่อนเพื่อดูสายการแข่งขัน</p>
            </div>
        );
    }

    return (
        <div className="bg-[#2ED3B7]/5 min-h-screen">
            {/* 
        We use ThirtyTwoBracket which supports dynamic sizes.
        Pass isOrganizer={false} to ensure it is read-only.
      */}
            <div className="flex flex-col gap-10">
                <ThirtyTwoBracket
                    key={`upper-${selectedRank}`}
                    level="บน"
                    tournamentId={tournamentId}
                    rank={selectedRank}
                    ranks={ranks}
                    onRankChange={setSelectedRank}
                    isOrganizer={false}
                />
                <ThirtyTwoBracket
                    key={`lower-${selectedRank}`}
                    level="ล่าง"
                    tournamentId={tournamentId}
                    rank={selectedRank}
                    ranks={ranks}
                    onRankChange={setSelectedRank}
                    isOrganizer={false}
                />
            </div>
        </div>
    );
};

export default BracketUser;
