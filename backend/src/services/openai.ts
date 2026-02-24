import openai from "../config/openAI";

export interface Player {
  id: number;
  score: number;
  gender: string;
}

type Mode = "sort_desc" | "sort_asc" | "balance";

type Instruction = {
  mode: Mode;
  femaleGroupA?: boolean;
  groupB_2M2F?: boolean;
};

// ====================
//  ให้ AI แปล detail
// ====================
const parseDetail = async (detail: string): Promise<Instruction> => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
แปลคำสั่งจัดกลุ่มเป็น JSON เท่านั้น

{
 "mode": "sort_desc" | "sort_asc" | "balance",
 "femaleGroupA": boolean,
 "groupB_2M2F": boolean
}

ถ้าไม่พูดถึงให้เป็น false
`
      },
      { role: "user", content: detail }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(res.choices[0].message.content || "{}");
};

// ====================
// จัดกลุ่มจริง (logic ธรรมดา)
// ====================
export const groupPlayers = async (
  players: Player[],
  detail: string
) => {
  const instruction = await parseDetail(detail);

  let sorted = [...players];

  if (instruction.mode === "sort_desc")
    sorted.sort((a, b) => b.score - a.score);
  else if (instruction.mode === "sort_asc")
    sorted.sort((a, b) => a.score - b.score);
  else
    sorted.sort((a, b) => b.score - a.score); // balance ใช้ desc ฐาน

  const groups: number[][] = [[], [], [], []];

  //  กลุ่ม A หญิงล้วน
  if (instruction.femaleGroupA) {
    const females = sorted.filter(p => p.gender === "หญิง").slice(0, 4);
    groups[0] = females.map(p => p.id);
    sorted = sorted.filter(p => !groups[0].includes(p.id));
  }

  // กลุ่ม B ชาย2หญิง2
  if (instruction.groupB_2M2F) {
    const males = sorted.filter(p => p.gender === "ชาย").slice(0, 2);
    const females = sorted.filter(p => p.gender === "หญิง").slice(0, 2);
    groups[1] = [...males, ...females].map(p => p.id);
    sorted = sorted.filter(p => !groups[1].includes(p.id));
  }

  //  เติมที่เหลือเรียงลงกลุ่ม
  let gi = 0;
  for (const p of sorted) {
    while (groups[gi].length >= 4) gi++;
    if (gi >= 4) break;
    groups[gi].push(p.id);
  }

  return groups;
};