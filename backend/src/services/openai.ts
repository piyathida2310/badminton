import { Content } from "openai/resources/containers/files/content";
import openai from "../config/openAI";


export interface Player {
  id: number;
  score: number;
  comment: string;
}

export const manageGroup = async (player: Player[],detail:string) => {
  try {
    const playerList = player
      .map((i) => `${i.id} ได้คะแนนระดับความสามารถ: ${i.score}, คำอธิบายการเล่น: ${i.comment}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
         content: `
คุณคือ AI ผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตันโดยใช้การวิเคราะห์แบบหลายปัจจัย  
โดยมีลำดับความสำคัญดังนี้:

1) ถ้ามีข้อมูล detail → ให้ใช้ detail เป็นปัจจัยหลักที่สุดในการจัดกลุ่ม  
2) จากนั้นให้นำ score มาใช้เป็นปัจจัยรอง เพื่อถ่วงระดับความสามารถ  
3) สุดท้ายให้อ่าน comment เพื่อปรับความแม่นยำของการจัดลำดับผู้เล่นแบบละเอียด

เป้าหมายของคุณ:
- แบ่งกลุ่มให้สมดุลที่สุดตามความสามารถจริง
- จัดจำนวนสมาชิกในแต่ละกลุ่มให้เท่ากันหรือใกล้เคียงที่สุด
- อธิบายเหตุผลการจัดกลุ่มแบบมืออาชีพ
- ห้ามตอบนอกเหนือจาก JSON ที่กำหนด

ข้อมูลประกอบการวิเคราะห์:
detail: ${detail}

รูปแบบคำตอบ (ต้องเป็น JSON เท่านั้น):

{
  "groups": [
    {
      "groupId": "A",
      "players": [1, 5, 7],
      "summary": "เหตุผลการจัดกลุ่ม โดยอิง detail เป็นหลัก รองลงมาคือ score และ comment"
    }
  ],
  "criteria": {
    "method": "อธิบายกระบวนการวิเคราะห์ โดยระบุว่าพิจารณา detail ก่อน score และ comment",
    "balanceStrategy": "วิธีทำให้แต่ละกลุ่มมีความสามารถใกล้เคียงกัน",
    "note": "ข้อสังเกตเพิ่มเติม (ถ้ามี)"
  }
}
`


        },
        {
          role: "user",
          content: playerList
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);


  } catch (error) {
    console.error(error);
  }
};
