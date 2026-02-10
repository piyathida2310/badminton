import { Content } from "openai/resources/containers/files/content";
import openai from "../config/openAI";


export interface Player {
  id: number;
  score: number;
  comment: string;
  gender: string;
}

export const groupPlayers = async (players: Player[], detail: string, numGroups: number): Promise<number[][]> => {
  try {
    const playerList = players
      .map((i) => `ID:${i.id} | Gender:${i.gender} | Score:${i.score} | Note:${i.comment}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
คุณคือผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตัน
หน้าที่ของคุณคือแบ่งนักกีฬาจำนวน ${players.length} คน ออกเป็น ${numGroups} กลุ่ม
โดย “แต่ละกลุ่มต้องมี 4 คน” (ยกเว้นกลุ่มท้าย ๆ ที่คนไม่พอ ให้มีน้อยกว่าได้ แต่ห้ามเกิน 4)

INPUT:
- players: รายการผู้เล่น แต่ละคนมีอย่างน้อย { id, gender, score, note/comment(optional) }
- detail: "${detail}"

กติกาสำคัญ:
1) ต้อง “ยึด detail ตามตัวอักษร” เป็นอันดับแรกเสมอ
   - ตัวอย่างคำสั่งใน detail ที่ต้องทำตามแบบเข้มงวด:
     • "ผู้หญิงล้วน" / "หญิงล้วน" = ห้ามมีผู้ชายอยู่ในทุกกลุ่มเด็ดขาด
     • "ผู้ชายล้วน" = ห้ามมีผู้หญิงเด็ดขาด
     • "ห้าม A อยู่กับ B" = A และ B ต้องอยู่คนละกลุ่ม
     • "ให้ A อยู่กับ B" = A และ B ต้องอยู่กลุ่มเดียวกัน
     • "คู่ผสม" = แต่ละกลุ่มต้องมีชายและหญิง (ถ้าจำนวนเอื้อ)
   - ถ้า detail มีหลายเงื่อนไข ให้ทำตามทั้งหมดพร้อมกัน ถ้าชนกันให้เลือกทำตาม “ห้าม” ก่อน “ควร”
   - ถ้าคำสั่งใน detail ขัดกับจำนวนกลุ่มหรือจำนวนคน ให้ทำตามให้ได้มากที่สุดโดย “ห้ามละเมิดคำสั่งเพศ” ก่อนเสมอ

2) การจัดจำนวนคนต่อกลุ่ม (บังคับ):
   - เป้าหมายหลัก: ทุกกลุ่มมี 4 คน
   - ห้ามมีกลุ่มไหนเกิน 4 คนเด็ดขาด
   - ถ้าคนไม่พอให้ครบทุกกลุ่ม:
     • ให้เติมกลุ่มจากกลุ่ม 1 ไปเรื่อย ๆ จนคนหมด
     • กลุ่มที่เหลือให้เป็น [] หรือมีน้อยกว่า 4 ได้
   - ห้าม “ยัด” คนเกิน 4 เพื่อแก้เงื่อนไขอื่น

3) ถ้า detail ไม่ได้สั่งอะไรเฉพาะเจาะจง ให้จัดแบบสมดุลตาม score:
   - กระจายคน score สูงไปแต่ละกลุ่มให้ใกล้เคียงกัน
   - ใช้ note/comment เป็นตัวช่วยเท่าที่มี

4) ข้อบังคับผลลัพธ์ (ห้ามผิด):
- ต้องส่งคืน JSON เท่านั้น รูปแบบนี้เท่านั้น:
{
  "groups": [
    [id1, id2, id3, id4],
    [id5, id6, id7, id8],
    ...
  ]
}
- ต้องมีจำนวนกลุ่ม = ${numGroups} กลุ่มเสมอ (คนไม่พอให้ [] ได้)
- ต้องใช้ id ของผู้เล่นทุกคน “ครบพอดี” ห้ามตก, ห้ามซ้ำ, ห้ามเกิน
- ห้ามกลุ่มใดเกิน 4 คน

กระบวนการทำงาน (ต้องทำในใจ แต่ห้ามพิมพ์ออกมา):
A) อ่าน detail แล้วสกัดกติกา โดยเฉพาะเรื่องเพศ/จับคู่/แยกคน
B) จัดกลุ่มให้เป็นก้อนละ 4 คน ตามกติกา
C) ตรวจสอบตัวเองก่อนตอบ:
   - จำนวนกลุ่มครบ ${numGroups}
   - ไม่มี id ซ้ำ และรวมครบ ${players.length}
   - ทุกกลุ่มมีสมาชิก <= 4 และส่วนใหญ่ = 4 (ยกเว้นคนไม่พอ)
   - เงื่อนไขเพศจาก detail ถูกต้อง 100%
   - เงื่อนไขจับคู่/แยกคนถูกต้อง
D) ถ้าไม่ผ่าน ให้แก้จนผ่าน แล้วค่อยส่ง JSON

ห้ามพิมพ์คำอธิบายใด ๆ นอกเหนือจาก JSON
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

    // Validate result structure
    if (result.groups && Array.isArray(result.groups)) {
      return result.groups;
    }

    return [];

  } catch (error) {
    console.error("AI Grouping Error:", error);
    return [];
  }
};
