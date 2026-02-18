"use client";
import React, { useState, use } from "react";
import { useEffect } from "react";
// import SixteenBracket from "../../../../../../components/sixteenbracket";
// import TwentyFourBracket from "../../../../../../components/twentyfourbracket";
import ThirtyTwoBracket from "../../../../../../components/thirtytwobracket";
import api from "../../../../../lib/api";

const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const [round, setRound] = useState<number>(32); // Default 32
  const [ranks, setRanks] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [isOrganizer, setIsOrganizer] = useState<boolean>(false);
  // Unwrap params using React.use()
  const unwrappedParams = use(params);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get(`/api/tournament/${unwrappedParams.id}`);
        const data = res.data.data;

        if (data) {
          // Handle Ranks
          if (data.rank && Array.isArray(data.rank) && data.rank.length > 0) {
            setRanks(data.rank);
            setSelectedRank(data.rank[0]);
          }

          // Handle Size
          if (data.maxPlayers) {
            // Logic kept for reference, but currently forced to 32
          }
        }
        setIsOrganizer(data.isOrganizer || false);
      } catch (error) {
        console.error("Failed to fetch tournament size", error);
      }
    };
    if (unwrappedParams.id) fetchTournament();
  }, [unwrappedParams.id]);

  return (
    <div className="bg-[#f9f9f0] overflow-y-auto min-h-screen">

      {/* <button className='bg-pink-400 w-24 h24 rounded-3xl' onClick={() => setRound(32)}>32</button> */}
      {/* Note: 32 button commented out as requested */}

      <div className="pb-10">
        <ThirtyTwoBracket
          key={`upper-${selectedRank}`}
          level="บน"
          tournamentId={Number(unwrappedParams.id)}
          rank={selectedRank}
          ranks={ranks}
          onRankChange={setSelectedRank}
          isOrganizer={isOrganizer}
        />
        <ThirtyTwoBracket
          key={`lower-${selectedRank}`}
          level="ล่าง"
          tournamentId={Number(unwrappedParams.id)}
          rank={selectedRank}
          ranks={ranks}
          onRankChange={setSelectedRank}
          isOrganizer={isOrganizer}
        />
      </div>
    </div>
  );
};

export default page;
