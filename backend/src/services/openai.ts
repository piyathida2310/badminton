import { Content } from "openai/resources/containers/files/content";
import openai from "../config/openAI";


export interface Player {
  id: number;
  score: number;
  comment: string;
}

export const manageGroup = async (player: Player[], detail: string, maxPlayers?: number) => {
  try {
    const playerList = player
      .map((i) => `${i.id} ได้คะแนนระดับความสามารถ: ${i.score}, คำอธิบายการเล่น: ${i.comment}`)
      .join("\n");

    let groupingInstruction = "";
    if (maxPlayers) {
      if (maxPlayers === 16) {
        groupingInstruction = "จัดการแข่งขันแบบ 16 คน ให้แบ่งเป็น 4 กลุ่ม (A, B, C, D) กลุ่มละ 4 คน";
      } else if (maxPlayers === 32) {
        groupingInstruction = "จัดการแข่งขันแบบ 32 คน ให้แบ่งเป็น 8 กลุ่ม (A-H) กลุ่มละ 4 คน";
      } else {
        groupingInstruction = `จัดการแข่งขันสำหรับ ${maxPlayers} คน ให้แบ่งกลุ่มตามความเหมาะสม โดยเน้นให้จำนวนคนต่อกลุ่มเท่ากันมากที่สุด`;
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
คุณคือ AI ผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตันที่มีหน้าที่จัดกลุ่มโดยเน้นความสมดุลและความใกล้เคียงของฝีมือ
***สำคัญที่สุด***: ต้องส่งคืนเฉพาะข้อมูล JSON เท่านั้น ห้ามมีข้อความอื่นนำหน้าหรือตามหลัง และห้ามใช้ markdown code block (เช่น \`\`\`json)

หลักการจัดกลุ่ม:
1. **ความใกล้เคียงของฝีมือ (Priority สูงสุด)**: ผู้เล่นในกลุ่มเดียวกัน *ต้อง* มีระดับคะแนน (score) ที่ใกล้เคียงกันมากที่สุดเท่าที่จะเป็นไปได้
   - ตัวอย่างที่ถูกต้อง: กลุ่ม A มีผู้เล่นคะแนน 1, 2, 2, 3 (ช่องว่างคะแนนน้อย)
   - ตัวอย่างที่ผิด: กลุ่ม A มีผู้เล่นคะแนน 1, 7, 2, 8 (ช่องว่างคะแนนมากเกินไป ฝีมือต่างกันเกินไป)
   - ห้ามจับคู่คะแนนที่ต่างกันมาก (เช่น 1 กับ 7) ให้อยู่กลุ่มเดียวกัน นอกจากจะไม่มีทางเลือกจริง ๆ
2. **จำนวนคน**: ${groupingInstruction}
3. **การวิเคราะห์ Comment (สำคัญ)**: *ต้อง* อ่านและวิเคราะห์ comment ของผู้เล่นแต่ละคนเพื่อประเมินระดับฝีมือที่แท้จริง
   - หาก comment ระบุว่า "เก่งมาก", "ตบหนัก", "มือ pro" ให้จัดว่ามีฝีมือสูงกว่า score ที่เห็น
   - หาก comment ระบุว่า "มือใหม่", "เพิ่งหัดเล่น" ให้จัดว่าฝีมืออาจต่ำกว่า score
   - ใช้ comment ในการเกลี่ยกลุ่มให้สมดุล ในกรณีที่ score ใกล้เคียงกันมาก

เป้าหมายของคุณ:
- จัดกลุ่มตามหลักการข้างต้น โดยเน้นให้ Score ในกลุ่มเกาะกลุ่มกัน (Low Variance within group) และใช้ Comment ช่วยปรับความแม่นยำ
- ห้ามตอบนอกเหนือจาก JSON ที่กำหนด

ข้อมูลประกอบการวิเคราะห์:
detail: ${detail}

รูปแบบคำตอบ (JSON เท่านั้น):
{
  "groups": [
    {
      "groupId": "A",
      "players": [1, 5, 7, 9],
      "summary": "คะแนนเฉลี่ย 4.0 ผู้เล่นที่ 5 มี comment ว่าตีดีมาก จึงจัดให้อยู่กลุ่มนี้แม้คะแนนจะน้อยกว่าคนอื่นเล็กน้อย"
    }
  ],
  "criteria": {
    "method": "จัดกลุ่มโดยใช้ Score เป็นฐาน และปรับด้วย Comment",
    "balanceStrategy": "เกลี่ยความสามารถโดยอ่านจาก Comment ร่วมกับ Score",
    "note": "..."
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

    const content = response.choices[0].message.content || "{}";
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(cleanContent);


  } catch (error) {
    console.error(error);
  }
};
