"use client";
import React, { useState } from "react";
import SixteenBracket from "../../../../../../components/sixteenbracket";
import TwentyFourBracket from "../../../../../../components/twentyfourbracket";
import ThirtyTwoBracket from "../../../../../../components/thirtytwobracket";

const page = () => {
  const [round, setRound] = useState<number>(16);
  return (
    <div className="bg-[#f9f9f0] overflow-y-auto">
      {/* <button className='bg-pink-400 w-24 h24 rounded-3xl mr-5' onClick={()=>setRound(16)}>16</button> */}
      {/* <button className='bg-pink-400 w-24 h24 rounded-3xl mr-5' onClick={()=>setRound(24)}>24</button> */}
      <button className='bg-pink-400 w-24 h24 rounded-3xl' onClick={()=>setRound(32)}>32</button>
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
          <ThirtyTwoBracket level="บน" />
          <ThirtyTwoBracket level="ล่าง" />
        </div>
      )}
    </div>
  );
};

export default page;
