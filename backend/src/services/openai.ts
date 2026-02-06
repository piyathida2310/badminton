import { Content } from "openai/resources/containers/files/content";
import openai from "../config/openAI";


export interface Player {
  id: number;
  score: number;
  comment: string;
}

export const rankPlayers = async (players: Player[], detail: string): Promise<number[]> => {
  try {
    const playerList = players
      .map((i) => `ID:${i.id} | Score:${i.score} | Note:${i.comment}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
คุณคือผู้ช่วยจัดอันดับนักกีฬาแบดมินตัน
"หน้าที่ของคุณคือเรียงลำดับนักกีฬาจาก เก่งที่สุด(มือวางอันดับ 1) ไปยัง อ่อนที่สุด"

เกณฑ์การตัดสิน:
1. Score (คะแนน): คะแนนสูงกว่า ต้องอยู่อันดับดีกว่า
2. Comment (Note): ถ้าคะแนนเท่ากัน ให้วิเคราะห์จาก Note (เช่น "ตีดี", "แข่งบ่อย" > "มือใหม่")
3. Detail: ${detail}

Format คำตอบ (JSON เท่านั้น):
{
  "rankedIds": [id_อันดับ1, id_อันดับ2, id_อันดับ3, ...]
}
*** ต้องส่งคืน ID ให้ครบถ้วนตามจำนวนที่ได้รับมา ห้ามตกหล่น ***
`
        },
        {
          role: "user",
          content: playerList
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // Fallback if AI returns valid JSON but empty array or structure mismatch
    return Array.isArray(result.rankedIds) ? result.rankedIds : [];

  } catch (error) {
    console.error("AI Ranking Error:", error);
    // กรณี AI Error ให้คืนค่าตามลำดับเดิม (ดีกว่าพังไปเลย)
    return players.map(p => p.id);
  }
};
