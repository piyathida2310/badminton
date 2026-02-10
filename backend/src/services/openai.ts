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
      .map((i) => {
        let g = i.gender.trim().toLowerCase();
        if (g === "f" || g === "w" || g === "หญิง") g = "Female";
        else if (g === "m" || g === "ชาย") g = "Male";
        return `ID:${i.id} | Gender:${g} | Score:${i.score} | Note:${i.comment}`;
      })
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
คุณคือผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตันอัจฉริยะ (Smart Badminton Group Organizer)
หน้าที่ของคุณคือ: แบ่งนักกีฬาจำนวน ${players.length} คน ออกเป็นกลุ่มย่อย โดยมีเป้าหมายคือ ${numGroups} กลุ่ม

==============================
★★★ กฏเหล็ก (HARD CONSTRAINTS) ห้ามละเมิดเด็ดขาด ★★★
==============================

H0) OUTPUT
- ต้องตอบเป็น JSON เท่านั้น ตามรูปแบบที่กำหนด ห้ามมีข้อความอื่นนอก JSON

H1) จำนวนกลุ่ม และจำนวนคนต่อกลุ่ม
- ต้องมีจำนวนกลุ่ม = ${numGroups} กลุ่มเสมอ (ถ้าคนไม่พอ กลุ่มท้าย ๆ ให้เป็น [] ได้)
- แต่ละกลุ่ม "ห้ามเกิน 4 คน" เด็ดขาด
- เป้าหมายคือ "กลุ่มละ 4 คน" ให้มากที่สุด
- กลุ่มท้าย ๆ มีน้อยกว่า 4 ได้ เฉพาะกรณีคนไม่ครบจริง ๆ (1-3 คน)

H2) ความครบถ้วนของ ID
- ต้องใช้ ID ของผู้เล่นให้ครบทุกคน (${players.length})
- ห้ามทำ ID หาย / ห้ามเพิ่ม ID ปลอม / ห้ามใช้ ID ซ้ำ

H3) ทำตามคำสั่ง detail แบบ "เป๊ะตามที่พิมพ์" (Priority สูงสุดรองจาก H0-H2)
- ต้องยึด detail ตามตัวอักษร และตีความให้เป็น "กติกาแบบเจาะจงรายกลุ่ม" ก่อนจัดเสมอ
- คำสั่งเกี่ยวกับ “เพศ” เป็นข้อบังคับระดับสูงสุดใน detail:
  • "กลุ่ม A ผู้หญิงทั้งหมด" = กลุ่ม A ต้องมีแต่ผู้หญิงเท่านั้น (ห้ามผู้ชาย 0 คน)
  • "กลุ่ม A ผู้ชายทั้งหมด" = กลุ่ม A ต้องมีแต่ผู้ชายเท่านั้น (ห้ามผู้หญิง 0 คน)
  • "กลุ่ม A คู่ผสม" / "ผสมชายหญิง" / "Mixed" = กลุ่ม A **ต้องมีทั้งชายและหญิง** (ห้ามมีเพศเดียว)
  • ถ้า detail ระบุ "ขอผสมทุกกลุ่ม" / "Mixed All" ให้พยายามจัดทุกกลุ่มเป็นคู่ผสม (มีชายและหญิงในกลุ่มเดียวกัน)
  • ถ้า detail ระบุหลายกลุ่ม (A,B,C...) ให้บังคับทีละกลุ่มอย่างเคร่งครัด
- กติกาจับคู่/แยกคน:
  • "ให้ X อยู่กับ Y" = X,Y ต้องอยู่กลุ่มเดียวกัน
  • "ห้าม X อยู่กับ Y" = X,Y ต้องอยู่คนละกลุ่ม

H4) หาก detail ขัดแย้งกับข้อมูลจริง (เช่น สั่ง A หญิงล้วน แต่ผู้หญิงมีไม่พอ)
- ห้ามทำ ID หาย (ยังต้องใส่ทุกคนครบ)
- ให้ทำตาม detail ให้ได้มากที่สุด โดย:
  1) ห้ามละเมิด “หญิงล้วน/ชายล้วน” ของกลุ่มที่ถูกสั่ง ถ้ายังมีเพศนั้นพอจัด
  2) ถ้าเพศไม่พอจริง ๆ จนทำให้กลุ่มนั้นเต็ม 4 ไม่ได้ ให้ปล่อยกลุ่มนั้นเป็น 1-3 คน (ยังถือว่าทำตามคำสั่งเพศ)
  3) ผู้เล่นที่เหลือให้จัดลงกลุ่มอื่นตามกติกาที่เหลือ
  4) กรณีสั่ง "คู่ผสม" แต่เพศใดเพศหนึ่งหมด -> อนุโลมให้กลุ่มท้ายๆ เป็นเพศเดียวได้ แต่ต้องพยายามผสมให้มากที่สุดก่อน
- ห้ามแก้ปัญหาด้วยการยัดเกิน 4 คน

==============================
INPUT
==============================
players: รายชื่อผู้เล่น (id, gender, score, note)
detail: "${detail}"

หมายเหตุ: gender อาจเป็น "F/M" หรือ "หญิง/ชาย" หรือ "female/male"
ให้ตีความ: หญิง=female=F, ชาย=male=M

==============================
วิธีทำงาน (ทำในใจเท่านั้น ห้ามพิมพ์ออกมา)
==============================
1) แปลง detail -> เป็นกติกา “รายกลุ่ม” ก่อน เช่น:
   - groupRules: {A: F_ONLY, B: MIXED, C: M_ONLY, ...}
   - pairRules: mustTogether, mustSeparate
   - **สำคัญ**: ถ้า detail มีคำว่า "Mixed" หรือ "ผสม" หรือ "ชายหญิง" แต่ไม่ระบุกลุ่ม ให้ถือว่าเป็น **Global Rule** (ทุกกลุ่มต้องพยายามผสม)
2) เตรียม ${numGroups} กลุ่มเปล่า
3) เติมผู้เล่นลงกลุ่ม:
   - ทำกลุ่มที่ถูกสั่งใน detail ก่อน (A,B,...) ให้ถูกเรื่องเพศและไม่เกิน 4
   - ถ้าเป็น Global Rule (Mixed) ให้กระจาย ชาย/หญิง ลงทุกกลุ่มให้มีทั้ง 2 เพศก่อน แล้วค่อยเติมให้ครบ 4
   - ถ้า detail ไม่ได้ล็อก ให้บาลานซ์ score กระจายคนเก่ง
4) ตรวจสอบก่อนตอบ:
   - กลุ่มครบ ${numGroups} ไหม
   - ไม่มีใครซ้ำ/ขาด และรวม ID = ${players.length} ไหม
   - ทุกกลุ่มมีสมาชิก <= 4 ไหม
   - เงื่อนไข Mixed (ถ้ามีสั่ง) เป็นจริงหรือไม่? (ต้องมีชาย+หญิง)
   - เงื่อนไขจับคู่/แยกคนถูกไหม
   - ถ้าไม่ผ่าน ต้องจัดใหม่จนผ่าน

==============================
OUTPUT FORMAT (JSON Only)
==============================
{
  "groups": [
    [id1, id2, id3, id4],
    [id5, id6, id7, id8],
    ...
  ]
}
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
    let groups: number[][] = [];
    if (result.groups && Array.isArray(result.groups)) {
      groups = result.groups;
    }

    // --- Post-Processing: Validate & Fix (Trust AI mostly) ---
    const inputIds = new Set(players.map((p) => p.id));
    const seenIds = new Set<number>();
    const cleanedGroups: number[][] = [];

    // 1. Keep valid groups from AI
    for (const group of groups) {
      if (!Array.isArray(group)) continue;
      const validGroup: number[] = [];
      for (const id of group) {
        if (inputIds.has(id) && !seenIds.has(id)) {
          seenIds.add(id);
          validGroup.push(id);
        }
      }
      if (validGroup.length > 0) cleanedGroups.push(validGroup);
    }

    // 2. Add missing IDs
    const missingIds = players.filter((p) => !seenIds.has(p.id)).map((p) => p.id);
    if (missingIds.length > 0) {
      // Fill existing groups up to 4
      for (const group of cleanedGroups) {
        while (group.length < 4 && missingIds.length > 0) {
          group.push(missingIds.shift()!);
        }
      }
      // Create new groups if needed
      while (missingIds.length > 0) {
        cleanedGroups.push(missingIds.splice(0, 4));
      }
    }

    // 3. Enforce Max 4 Strict Limit (Split if needed)
    const finalGroups: number[][] = [];
    for (const group of cleanedGroups) {
      if (group.length <= 4) {
        finalGroups.push(group);
      } else {
        for (let i = 0; i < group.length; i += 4) {
          finalGroups.push(group.slice(i, i + 4));
        }
      }
    }

    return finalGroups;

  } catch (error) {
    console.error("AI Grouping Error:", error);
    return [];
  }
};
