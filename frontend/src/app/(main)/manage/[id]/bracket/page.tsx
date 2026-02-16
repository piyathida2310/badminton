"use client";
import React, { useState, use } from "react";
import SixteenBracket from "../../../../../../components/sixteenbracket";
import TwentyFourBracket from "../../../../../../components/twentyfourbracket";
import ThirtyTwoBracket from "../../../../../../components/thirtytwobracket";

const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const [round, setRound] = useState<number>(16);
  // Unwrap params using React.use()
  const unwrappedParams = use(params);

  return (
    <div className="bg-[#f9f9f0] overflow-y-auto">
      {/* <button className='bg-pink-400 w-24 h24 rounded-3xl mr-5' onClick={()=>setRound(16)}>16</button> */}
      {/* <button className='bg-pink-400 w-24 h24 rounded-3xl mr-5' onClick={()=>setRound(24)}>24</button> */}
      <button className='bg-pink-400 w-24 h24 rounded-3xl' onClick={() => setRound(32)}>32</button>
      {round === 16 ? (
        <div>
          <SixteenBracket level="บน" />
          <SixteenBracket level="ล่าง" />
        </div>
      ) : round === 24 ? (
        <div>
          <TwentyFourBracket level="บน" />
          <TwentyFourBracket level="ล่าง" />{" "}
        </div>
      ) : (
        <div>
          <ThirtyTwoBracket level="บน" tournamentId={Number(unwrappedParams.id)} />
          <ThirtyTwoBracket level="ล่าง" tournamentId={Number(unwrappedParams.id)} />
        </div>
      )}
    </div>
  );
};

export default page;
