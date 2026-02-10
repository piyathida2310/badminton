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
คุณคือผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตันอัจฉริยะ (Smart Badminton Group Organizer)
หน้าที่ของคุณคือ: แบ่งนักกีฬาจำนวน ${players.length} คน ออกเป็นกลุ่มย่อย โดยมีเป้าหมายคือ ${numGroups} กลุ่ม

★★★ กฏเหล็ก (HARD CONSTRAINTS) ห้ามละเมิดเด็ดขาด ★★★

1. **จำนวนคนต่อกลุ่ม**:
   - ต้องมีสมาชิก **4 คน** ต่อกลุ่มเป็นมาตรฐาน
   - **ห้าม**กลุ่มใดมีสมาชิก **เกิน 4 คน** เด็ดขาด (Max 4 people per group is STRICT!)
   - กลุ่มสุดท้ายหรือกลุ่มท้ายๆ สามารถมีน้อยกว่า 4 คนได้ (1-3 คน) ถ้าจำนวนคนหารไม่ลงตัว
   - ห้ามสร้างกลุ่มที่มี 5, 6, 7 คนเด็ดขาด ไม่ว่ากรณีใดๆ


2. **การปฏิบัติตามคำสั่ง (Detail) - กติกาสำคัญ**:
   - ต้อง “ยึด detail ตามตัวอักษร” เป็นอันดับแรกเสมอ
   - ตัวอย่างคำสั่งใน detail ที่ต้องทำตามแบบเข้มงวด:
     • "ผู้หญิงล้วน" / "หญิงล้วน" = ห้ามมีผู้ชายอยู่ในทุกกลุ่มเด็ดขาด
     • "ผู้ชายล้วน" = ห้ามมีผู้หญิงเด็ดขาด
     • "ห้าม A อยู่กับ B" = A และ B ต้องอยู่คนละกลุ่ม
     • "ให้ A อยู่กับ B" = A และ B ต้องอยู่กลุ่มเดียวกัน
     • "คู่ผสม" = แต่ละกลุ่มต้องมีชายและหญิง (ถ้าจำนวนเอื้อ)
   - ถ้า detail มีหลายเงื่อนไข ให้ทำตามทั้งหมดพร้อมกัน ถ้าชนกันให้เลือกทำตาม “ห้าม” ก่อน “ควร”
   - ถ้าคำสั่งใน detail ขัดกับจำนวนกลุ่มหรือจำนวนคน ให้ทำตามให้ได้มากที่สุดโดย **“ห้ามละเมิดคำสั่งเพศ”** ก่อนเสมอ
   - **แต่** ถ้าทำตาม detail แล้วคนเกิน 4 ให้แยกกลุ่มใหม่ทันที (ห้ามเกิน 4 คนเด็ดขาด)

3. **ความถูกต้องของข้อมูล**:
   - ต้องใช้ ID ของผู้เล่นให้ครบทุกคน (${players.length} คน)
   - ห้ามทำ ID หาย และ ห้ามเพิ่ม ID ปลอม
   - ห้ามใช้ ID ซ้ำในกลุ่มอื่น

----------
INPUT:
- players: รายชื่อผู้เล่น (id, gender, score, note)
- detail: "${detail}"

OUTPUT FORMAT (JSON Only):
{
  "groups": [
    [id1, id2, id3, id4],  // กลุ่มที่ 1 (ครบ 4)
    [id5, id6, id7, id8],  // กลุ่มที่ 2 (ครบ 4)
    ...
    [idX, idY]             // กลุ่มสุดท้าย (เศษเหลือได้, แต่ห้ามเกิน 4)
  ]
}
----------

STEP-BY-STEP THINKING:
1. อ่าน "detail" เพื่อเข้าใจเงื่อนไขพิเศษ (เพศ, การจับคู่)
2. คำนวณจำนวนกลุ่มที่เหมาะสม: ${players.length} / 4
3. จัดผู้เล่นลงกลุ่ม ทีละ 4 คน โดยพยายามเกลี่ย Score ให้สมดุล (ถ้าไม่มี detail บังคับอื่น)
4. ตรวจสอบกลุ่มที่จัด:
   - มีกลุ่มไหนเกิน 4 คนไหม? -> ถ้ามี **ต้องแตกกลุ่มทันที**
   - ผู้เล่นครบไหม?
   - เงื่อนไข detail เป็นจริงไหม?
5. ส่งออกเป็น JSON

ย้ำครั้งสุดท้าย: **ห้ามกลุ่มไหนมีเกิน 4 คน เด็ดขาด**
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

    // --- Post-Processing: Enforce Strict 4-Player Limit ---
    // Flatten all IDs to ensure we don't lose anyone
    const allGroupedIds = groups.flat();

    // Check for missing/duplicate IDs compared to input
    const inputIds = new Set(players.map(p => p.id));
    const uniqueGroupedIds = [...new Set(allGroupedIds)].filter(id => inputIds.has(id));

    // Find who was missed
    const missedIds = players.filter(p => !uniqueGroupedIds.includes(p.id)).map(p => p.id);
    const finalIds = [...uniqueGroupedIds, ...missedIds];

    // Re-chunk into groups of 4 strictly
    const strictGroups: number[][] = [];
    const chunkSize = 4;

    for (let i = 0; i < finalIds.length; i += chunkSize) {
      strictGroups.push(finalIds.slice(i, i + chunkSize));
    }

    return strictGroups;

  } catch (error) {
    console.error("AI Grouping Error:", error);
    return [];
  }
};
