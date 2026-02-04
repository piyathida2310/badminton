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
คุณคือ AI ผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตันสำหรับรอบแบ่งกลุ่ม (Group Stage)
***สำคัญที่สุด***: ต้องส่งคืนเฉพาะข้อมูล JSON เท่านั้น ห้ามมีข้อความอื่นนำหน้าหรือตามหลัง

หลักการจัดกลุ่ม (Seeding & Distribution):
1. **การเรียงลำดับ (Ranking - สำคัญที่สุด!)**:
   - ให้เรียงลำดับผู้เล่นทุกคนตาม **คะแนน (Score)** จากมากไปน้อย "อย่างเคร่งครัด"
   - หากคะแนนเท่ากัน ให้ใช้ **Comment** ในการตัดสินใจ (เช่น "ตีดี", "เก่ง", "Pro" ให้จัดไว้อันดับสูงกว่าคนที่มี comment ว่า "มือใหม่")

2. **การกระจายลงกลุ่ม (Distribution)**:
   - เป้าหมายคือ: **ทุกกลุ่มต้องมีความเก่งเฉลี่ยใกล้เคียงกัน** (Fair Competition)
   - ห้ามนำคนเก่งไปกองรวมกันในกลุ่มเดียว
   - ใช้วิธีแจกแจงแบบ **Snake Draft** หรือวนลูป:
     - มือวางอันดับ 1 -> Group A
     - มือวางอันดับ 2 -> Group B
     - ... (จนครบจำนวนกลุ่ม)
     - แล้ววนกลับมาใส่กลุ่มสุดท้ายย้อนกลับมากลุ่มแรก (หรือวน A->B->C->...) เพื่อให้สมดุล

3. **จำนวนคน**: ${groupingInstruction}

4. **การวิเคราะห์ Comment**: ใช้เป็นตัวช่วยเสริมในการจัด Ranking เท่านั้น (แต่ Score คือตัวหลัก)

สรุป: เรียงความเก่งตาม Score -> กระจายลงกลุ่มให้เท่าๆ กัน

ข้อมูลประกอบการวิเคราะห์:
detail: ${detail}

รูปแบบคำตอบ (JSON เท่านั้น):
{
  "groups": [
    {
      "groupId": "A",
      "players": [1, 5, 7, 9],
      "summary": "กลุ่มนี้ประกอบด้วยมือวางอันดับ 1, 8, 9, 16 เฉลี่ยความสามารถสมดุลกับกลุ่มอื่น"
    }
  ],
  "criteria": {
    "method": "เรียงตาม Score แล้วกระจายแบบ Snake Draft",
    "balanceStrategy": "Average Skill Equalization",
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
