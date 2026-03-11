import openai from "../config/openAI";

export interface Player {
  id: number;
  score: number;
  gender: string;
  comment: string;
  age: number | string;
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNumGroups = (n: number) => {
  if (n > 24) return 8; // If more than 24, make it 8 groups
  return Math.max(1, Math.floor(n / 4)); // Default mapping for anything else
};

const normalizeGender = (g: string) => {
  const x = (g || "").trim().toLowerCase();

  if (x.includes("/")) {
    return x
      .split("/")
      .map((p) => {
        const pt = p.trim();
        if (["m", "male", "ชาย", "ผู้ชาย"].includes(pt)) return "Male";
        if (["f", "female", "หญิง", "ผู้หญิง", "w"].includes(pt)) return "Female";
        return "Unknown";
      })
      .join("/");
  }

  if (["m", "male", "ชาย", "ผู้ชาย"].includes(x)) return "Male";
  if (["f", "female", "หญิง", "ผู้หญิง", "w"].includes(x)) return "Female";
  return "Unknown";
};

// ──────────────────────────────────────────────
// Validate ผลลัพธ์จาก Tool Arguments
// ──────────────────────────────────────────────
const validateGroups = (
  players: Player[],
  numGroups: number,
  raw: any
): number[][] => {
  if (!raw || typeof raw !== "object" || !raw.groups) {
    throw new Error("Tool args ไม่มี groups");
  }

  const groupsObj = raw.groups;
  const keys = Array.from({ length: numGroups }, (_, i) => letters[i]);

  const validIds = new Set(players.map((p) => p.id));
  const allIds: number[] = keys.flatMap((k) => {
    const arr = groupsObj[k];
    return Array.isArray(arr) ? arr : [];
  });

  for (const id of allIds) {
    if (typeof id !== "number") throw new Error("ID ต้องเป็นตัวเลขเท่านั้น");
    if (!validIds.has(id)) throw new Error(`พบ ID ที่ไม่มีจริง: ${id}`);
  }

  const seen = new Set<number>();
  const dupes: number[] = [];
  for (const id of allIds) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  if (dupes.length)
    throw new Error(`มี ID ซ้ำ: ${[...new Set(dupes)].join(", ")}`);

  const missing = [...validIds].filter((id) => !seen.has(id));
  if (missing.length) throw new Error(`มี ID หาย: ${missing.join(", ")}`);

  return keys.map((k) => groupsObj[k] as number[]);
};

// ──────────────────────────────────────────────
// สร้าง Tool Schema แบบ dynamic ตาม numGroups
// ──────────────────────────────────────────────
const buildTool = (numGroups: number, groupKeys: string, numPlayers: number) => {
  const groupProperties: Record<string, any> = {};
  const requiredGroups: string[] = [];

  for (let i = 0; i < numGroups; i++) {
    const key = letters[i];
    groupProperties[key] = {
      type: "array",
      items: { type: "integer" },
      description: `รายการ ID ทีมในกลุ่ม ${key} — พยายามจัดให้แต่ละกลุ่มมีจำนวนใกล้เคียงกันที่สุด (สูงสุด 4 ทีมต่อกลุ่ม) ห้ามใช้ ID ซ้ำ`,
    };
    requiredGroups.push(key);
  }

  return {
    type: "function" as const,
    function: {
      name: "assign_groups",
      description:
        "จัดกลุ่มทีมแบดมินตันตามเงื่อนไขที่ผู้ใช้กำหนด " +
        "ต้องใส่ ID จริงทุกตัว ห้ามซ้ำ ห้ามหาย กระจายผู้เล่นให้แต่ละกลุ่มมีจำนวนเท่าๆ กันหรือใกล้เคียงกันที่สุด",
      parameters: {
        type: "object",
        properties: {
          thinking_process: {
            type: "string",
            description: "อธิบายวิธีการคิดและการแจกจ่าย ID ผู้เล่นอย่างเป็นลำดับขั้นตอน (Step-by-step) โดยให้จดลิสต์ ID ทั้งหมดที่ว่างอยู่ แล้วหักออกทีละตัวเมื่อนำไปจัดเข้ากลุ่ม เพื่อทำตัวเป็นกระดาษทดป้องกันการเติม ID ซ้ำอย่างเด็ดขาด!",
          },
          interpreted: {
            type: "string",
            description: "สรุปเงื่อนไขที่ตีความได้จากคำสั่งผู้ใช้ (1-2 บรรทัด)",
          },
          errorMessage: {
            type: "string",
            description: "ห้ามใช้งานฟิลด์นี้เด็ดขาด (ให้ส่งค่าว่าง `\"\"` เสมอ) ยกเว้นแต่คุณหาคนที่มีคุณสมบัติ 'ไม่ได้เลยแม้แต่คนเดียวในระบบ (0 คน)'! หากผู้ใช้สั่งอะไรมาแล้วหาไม่ครบจำนวน หรือแม้กระทั่งหาไม่ได้เลยในบางเงื่อนไข ให้ใช้วิธี 'เอาคนอื่นที่เหลืออยู่มาอุดรอยรั่วให้เต็มกลุ่มแทน' ห้ามใช้ฟิลด์นี้เพื่อบ่นว่าจัดไม่ได้หรือคนไม่เพียงพอเด็ดขาด จัดให้เต็ม 4 ทีมเสมอ",
          },
          groups: {
            type: "object",
            description: `Object กลุ่ม ${groupKeys} แบ่ง ID ให้ครบ ${numPlayers} คน โดยกระจายจำนวน ID เข้ากลุ่มให้เท่าๆ กัน (ไม่จำเป็นต้องกลุ่มละ 4 คนพอดี)`,
            properties: groupProperties,
            required: requiredGroups,
            additionalProperties: false,
          },
        },
        required: ["thinking_process", "interpreted", "groups"],
        additionalProperties: false,
      },
    },
  };
};

// ──────────────────────────────────────────────
// Main: groupPlayers ด้วย OpenAI Tools
// ──────────────────────────────────────────────
export const groupPlayers = async (
  players: Player[],
  detail: string,
  fixedNumGroups?: number
): Promise<number[][]> => {
  const numGroups = fixedNumGroups ?? getNumGroups(players.length);
  const groupKeys = Array.from({ length: numGroups }, (_, i) => letters[i]).join(", ");

  const teamList = players
    .map(
      (p) =>
        `ID:${p.id} | Gender:${normalizeGender(p.gender)} | Score:${p.score} | Age:${p.age} | Note:${p.comment || "-"}`
    )
    .join("\n");

  // ranked list สำหรับอ้างอิงการเรียงคะแนน
  const rankedList = [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => `อันดับ ${i + 1}: ID:${p.id} Score:${p.score} Age:${p.age}`)
    .join("\n");

  const tool = buildTool(numGroups, groupKeys, players.length);

  const systemPrompt = `
คุณคือระบบจัดกลุ่มทีมแบดมินตัน

═══════════════════════════════════════
กฎตายตัว (ห้ามฝ่าฝืนเด็ดขาด):
═══════════════════════════════════════
- จำนวนทีมทั้งหมด = ${players.length}
- ต้องสร้างกลุ่ม: ${groupKeys}
${players.length === 16 || players.length === 32
      ? `- คนสมัครมา ${players.length} ทีมพอดี ดังนั้น **ทุกกลุ่มต้องมี 4 ทีมพอดีเท่านั้น ห้ามน้อยกว่าหรือมากกว่า 4 โดยเด็ดขาด** (กลุ่มละ 4 คน x ${numGroups} กลุ่ม)`
      : `- กลุ่มหนึ่งมีทีมได้ "สูงสุด 4 ทีมเท่านั้น" ห้ามเกิน 4 ทีมเด็ดขาด (มีน้อยกว่า 4 ทีมได้ แต่ห้ามเกิน 4 เนื่องจากคนสมัครมี ${players.length} ทีม ไม่เต็มโควต้า)`
    }
- ใช้ ID จริงที่ให้ไปเท่านั้น ห้ามซ้ำ ห้ามหาย ห้ามแต่ง ID ขึ้นเองเด็ดขาด
- การทำตามข้อกำหนดเรื่องห้าม ID ซ้ำ สำคัญกว่าเงื่อนไขที่ User พิมพ์มา ถ้าคนไม่พอให้เอาคนอื่นมาใส่แทน

═══════════════════════════════════════
ALGORITHM การจัดกลุ่มแบบมองภาพรวม (Global Constraint Satisfaction):
═══════════════════════════════════════
การจัดกลุ่มนี้เปรียบเสมือนการเล่น Sudoku คุณต้องมองภาพรวมของทุกเงื่อนไขพร้อมกัน และ 'ต้องใช้ช่อง thinking_process ในการทดเลข ID เสมอ'!

STEP 1 — วิเคราะห์เงื่อนไขทุกกลุ่ม "พร้อมกัน" (เขียนลงใน thinking_process):
  - เขียนรายชื่อ ID ทั้งหมดที่มีในระบบเป็น Pool กองกลาง
  - วิเคราะห์ว่ากลุ่มไหนดึงตัวผู้เล่น "ยากที่สุด" หรือ "ล็อกสเปกตัวเลขเป๊ะๆ" (เช่น กลุ่ม B ขออายุ 40 และ 42 จำนวนเป๊ะๆ)
  - กลุ่มไหนเงื่อนไข "กว้างกว่า" (เช่น กลุ่ม H ขอแค่ผู้หญิง 30+)
  - แจกแจงว่า ใคร (ID ไหน) สามารถเป็น Candidate ให้กลุ่มไหนได้บ้าง

STEP 2 — จับคู่ ID (ทดเลขลงใน thinking_process ป้องกันแย่งคนและ ID ซ้ำ):
  - จัด ID ให้กลุ่มที่ล็อกสเปกเป๊ะๆ ก่อน (เช่น กลุ่ม B) เมื่อให้ ID ไหนไปแล้ว **ให้ขีดทิ้งจาก Pool กองกลางทันที!**
  - ถ้ามี ID ที่อายุ 40 และ 42 อย่าเพิ่งเอาไปใส่กลุ่ม H แม้ว่าเขาจะผู้หญิงอายุ 30+ เพราะถ้าคุณเอาไปใส่กลุ่ม H ปุ๊บ กลุ่ม B จะไม่มีคนอายุ 40/42 ให้ใช้เลย! 
  - หลังจากกลุ่มที่ล็อกสเปกเป๊ะๆ ได้คนครบ 4 ทีมแล้ว ค่อยเอา ID ที่เหลือใน Pool ไปอุดกลุ่มที่เงื่อนไขกว้างกว่า (เช่น กลุ่ม H, กลุ่ม A)
  - ❗️กฎเหล็ก: 1 ID ลงได้แค่ 1 กลุ่ม ห้ามซ้ำเด็ดขาด! ห้ามนำ ID ที่ถูกขีดทิ้งจาก Pool ไปแล้วมาใช้อีก!

STEP 3 — การอุดรอยรั่วแบบยืดหยุ่น (ทดเลขใน thinking_process เช่นกัน):
  - หากหลังจากจัดแบบฉลาดแล้ว ปรากฏว่ากลุ่มใดกลุ่มหนึ่งมีคนไม่ครบ 4 ทีม (เช่น ขอหญิง 30+ แต่เหลือแค่ 3 คน) ห้าม!! แจ้ง Error และห้าม!! ยกเลิก
  - ให้คุณเอา ID ใครก็ได้ที่ "ยังไม่ได้ถูกจัดลงกลุ่มไหนเลย" มาใส่ผสมให้เต็ม 4 ทีม
  - ทุกกลุ่มต้องมี 4 ทีมพอดีตอนจบกระบวนการ ห้ามมีกลุ่มไหนแหว่ง

STEP 4 — ตรวจสอบขั้นสุดท้ายก่อนส่งคำตอบ:
  → ทุก ID ถูกใช้ครบ ไม่ซ้ำ ไม่หาย
  → จำนวนทีมในแต่ละกลุ่มใกล้เคียงกัน ยุติธรรม ไม่กระจุกตัว

═══════════════════════════════════════
ตัวอย่าง Gender field ในข้อมูล:
═══════════════════════════════════════
- SINGLE tournament: "Male" หรือ "Female"
- DOUBLE tournament: "Male/Female", "Male/Male", "Female/Female"
  → "ชายล้วน" ใน DOUBLE = หาทีมที่ Gender เป็น "Male/Male"
  → "หญิงล้วน" ใน DOUBLE = "Female/Female"
  → "คู่ผสม"   ใน DOUBLE = "Male/Female"

═══════════════════════════════════════
ข้อมูล Age (อายุ):
═══════════════════════════════════════
- แต่ละทีม/ผู้เล่นจะมี Age (อายุ ปี) แนบมาด้วย
- ถ้าผู้ใช้ระบุเงื่อนไขเรื่องอายุ (เช่น "จัดกลุ่มตามช่วงอายุ", "อายุใกล้เคียงกัน", "อายุน้อยอยู่ด้วยกัน อายุมากอยู่ด้วยกัน")
  ให้ใช้ Age ประกอบการจัดกลุ่ม
- ถ้าผู้ใช้ไม่ได้ระบุเงื่อนไขเรื่องอายุ ไม่ต้องใช้ Age เป็นเงื่อนไขหลัก
  แต่สามารถใช้เป็นข้อมูลเสริมได้
- SINGLE tournament (แข่งเดี่ยว): 1 ID = 1 ทีม = 1 คน! ดังนั้นคำว่า "คน" หรือ "ทีม" มีความหมายตามจำนวน ID ตรงๆ เช่น ถ้าผู้ใช้สั่ง "อายุ 40 จำนวน 2 คน" หรือ "อายุ 40 จำนวน 2 ทีม" ให้คุณหา ID ที่มี Age 40 มาใส่จำนวน 2 ID ย้ำ! จำนวนตามที่ระบุเด๊ะๆ 
- DOUBLE tournament (แข่งคู่ย้ำอีกครั้ง): Age จะแสดงอายุของทั้ง 2 คนแยกกันด้วยเครื่องหมาย / เช่น "40/42" (แปลว่าคนนึง 40 อีกคน 42) 
  -> ให้มองว่า 1 ทีม (1 ID) ประกอบด้วยผู้เล่น 2 คน! 
  -> ถ้าผู้ใช้ระบุว่า "อายุ 40 ปี 2 คน" ในกรณีประเภทคู่ ให้นับจำนวน 'ผู้เล่น' ไม่ใช่นับจำนวน 'ทีม'
  -> เช่น ถ้ามีทีมใดทีมนึงอายุเป็น "40/40" แปลว่าทีมนี้ทีมเดียว ก็มีคนอายุ 40 ครบ 2 คนตามที่สั่งแล้ว! (จัดแค่ทีมเดียวก็พอ)
  -> หรือถ้ามีทีม "40/35" และอีกทีม "40/28" แบบนี้ก็แปลว่ามีคนอายุ 40 รวมกัน 2 คน (ต้องดึงมา 2 ทีม)
  -> จงนับจำนวนครั้งของตัวเลขที่ปรากฏใน Age อย่างรอบคอบที่สุด ห้ามมองข้ามเด็ดขาด

 คำเตือนสุดท้าย: ถ้าคำสั่งมีประโยคว่า "ที่เหลือคละๆ" แสดงว่าผู้ใช้ยอมให้เอาบุคลากรคนอื่นๆ มายัดผสมให้ครบ 4 ทีมได้! ห้ามชอร์ตฟีลแจ้ง errorMessage ว่า "ไม่เพียงพอ" หรือ "ไม่มีข้อมูล" เด็ดขาด! คุณต้องเอาที่เหลือมาคละให้ตายยังไงก็ต้องจัดให้ครบทุกกลุ่มเท่านั้น!
`.trim();

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const userPrompt = `
detail: "${detail}"

ทีมทั้งหมด:
${teamList}

Ranked list (เรียงคะแนนมากไปน้อยแล้ว):
${rankedList}

${lastError ? ` สัญญาณเตือนจากระบบ (สำคัญมาก ห้ามทำผิดซ้ำ):
${lastError}
* สาเหตุที่เป็นไปได้: คุณอาจจะจัดคนไปไว้กลุ่มอื่นจนหมด หรือในระบบไม่มีคนตรงตามเงื่อนไขจริงๆ
* วิธีแก้: ห้ามใช้ errorMessage เพื่อระงับการทำงานเด็ดขาด ถ้ายอมให้ผสมคนได้ (ที่เหลือคละๆ) ให้ดึงคนอื่นที่ยังว่างอยู่มาอุดรอยรั่วให้เต็มกลุ่ม! ทุกกลุ่มต้องมีคนตามโควต้าแม้จะผิดสเปกไปบ้างก็ตาม กฎคือห้ามซ้ำ!` : ""}
`.trim();

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", ["function"]: { name: "assign_groups" } },
    });

    const toolCall = res.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      lastError = "AI ไม่ได้เรียก tool assign_groups";
      if (attempt === MAX_RETRIES) throw new Error(lastError);
      continue;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolCall["function"].arguments);
    } catch {
      lastError = "parse tool arguments ล้มเหลว";
      if (attempt === MAX_RETRIES) throw new Error(lastError);
      continue;
    }

    if (parsed.errorMessage && parsed.errorMessage.trim() !== "") {
      // AI decided the constraints are impossible
      throw new Error(parsed.errorMessage);
    }

    try {
      const result = validateGroups(players, numGroups, parsed);
      console.log(`[groupPlayers] interpreted: ${parsed.interpreted}`);
      return result;
    } catch (e: any) {
      lastError = e?.message || "validate failed";
      if (attempt === MAX_RETRIES) throw new Error(lastError);
    }
  }

  throw new Error("AI grouping failed unexpectedly");
};