import openai from "../config/openAI";

export interface Player {
  id: number;
  score: number;
  gender: string;
  comment: string;
  age: number;
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const getNumGroups = (n: number) => {
  if (n === 16) return 4;
  if (n === 32) return 8;
  throw new Error(`รองรับเฉพาะ 16 หรือ 32 ทีม ตอนนี้ได้ ${n}`);
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

  for (const k of keys) {
    if (!Array.isArray(groupsObj[k]))
      throw new Error(`groups.${k} ต้องเป็น array`);

    //  แก้ให้รองรับกลุ่มที่มีสมาชิกน้อยกว่า 4 คนด้วย (เพื่อรองรับเคสคนไม่เต็มแม็กซ์)
    // แต่ละกลุ่มห้ามเกิน 4 คน
    if (groupsObj[k].length > 4)
      throw new Error(
        `groups.${k} ต้องมีทีมไม่เกิน 4 ทีม (ตอนนี้ ${groupsObj[k].length})`
      );
  }

  const validIds = new Set(players.map((p) => p.id));
  const allIds: number[] = keys.flatMap((k) => groupsObj[k]);

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
const buildTool = (numGroups: number, groupKeys: string) => {
  const groupProperties: Record<string, any> = {};
  const requiredGroups: string[] = [];

  for (let i = 0; i < numGroups; i++) {
    const key = letters[i];
    groupProperties[key] = {
      type: "array",
      items: { type: "integer" },
      description: `รายการ ID ทีมในกลุ่ม ${key} — พยายามจัดให้แต่ละกลุ่มมีจำนวนใกล้เคียงกันที่สุด (สูงสุดกลุ่มละ 4 ทีม)`,
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
          interpreted: {
            type: "string",
            description: "สรุปเงื่อนไขที่ตีความได้จากคำสั่งผู้ใช้ (1-2 บรรทัด)",
          },
          groups: {
            type: "object",
            description: `Object กลุ่ม ${groupKeys} แต่ละกลุ่มเป็น array ของ ID จำนวน 4 ตัวพอดี`,
            properties: groupProperties,
            required: requiredGroups,
            additionalProperties: false,
          },
        },
        required: ["interpreted", "groups"],
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

  const tool = buildTool(numGroups, groupKeys);

  const systemPrompt = `
คุณคือระบบจัดกลุ่มทีมแบดมินตัน

═══════════════════════════════════════
กฎตายตัว (ห้ามฝ่าฝืนเด็ดขาด):
═══════════════════════════════════════
- จำนวนทีมทั้งหมด = ${players.length}
- ต้องสร้างกลุ่ม: ${groupKeys}
- ❗️กระจายทีมให้ลงกลุ่มเท่าๆ กันให้มากที่สุด (สูงสุด 4 ทีมต่อกลุ่ม) 
- ใช้ ID จริงทุกตัว ห้ามซ้ำ ห้ามหาย ห้ามแต่ง ID

═══════════════════════════════════════
ALGORITHM เมื่อมีเงื่อนไขเพศ + เรียงคะแนน:
═══════════════════════════════════════
ให้ทำตามขั้นตอนนี้ทีละกลุ่มตามลำดับ:

STEP 1 — อ่าน constraint ของแต่ละกลุ่มจากคำสั่ง
  ตัวอย่างการตีความ:
  "ชายล้วน"       → ต้องการ MALE=4, FEMALE=0
  "หญิงล้วน"      → ต้องการ MALE=0, FEMALE=4
  "ชาย2หญิง2"     → ต้องการ MALE=2, FEMALE=2
  "หญิง3ชาย1"     → ต้องการ FEMALE=3, MALE=1
  "คู่ผสม"        → MALE/FEMALE ใดก็ได้ ไม่จำกัด
  (ไม่ระบุเพศ)    → ไม่จำกัดเพศ ใช้ตามลำดับคะแนน

STEP 2 — จัดกลุ่มที่มี constraint เพศก่อน (A, B, C, ... ตามลำดับ)
  สำหรับแต่ละกลุ่มที่มี constraint เพศ:
  → จาก Ranked list เรียงคะแนนมากไปน้อย
  → คัดเฉพาะ ID ที่ยังไม่ถูกเลือก และมีเพศตรงตาม constraint
  → เลือก N คนแรกที่คะแนนสูงสุดที่ตรงเงื่อนไข (N = จำนวนที่ต้องการต่อเพศ)
  → ถ้าหา MALE ไม่ครบ → เติมด้วย FEMALE ที่คะแนนสูงสุด (ระบุใน interpreted)
  → ถ้าหา FEMALE ไม่ครบ → เติมด้วย MALE ที่คะแนนสูงสุด (ระบุใน interpreted)

STEP 3 — กลุ่มที่เหลือ (ไม่มี constraint เพศ หรือบอกว่า "คู่ผสม")
  → เลือกจาก ID ที่ยังเหลือ เรียงตามคะแนนมากไปน้อย
  → เติมกลุ่มตามลำดับ โดยพยายามกระจายให้จำนวนทีมในแต่ละกลุ่มเท่าๆ กัน

STEP 4 — ตรวจสอบ
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
- DOUBLE tournament: Age จะเป็นอายุเฉลี่ยของผู้เล่น 2 คน

ทำตาม ALGORITHM ข้างต้นทุกครั้ง อย่า skip ขั้นตอน
ถ้า constraint ทำไม่ได้ 100% ให้ทำให้ดีที่สุดและระบุใน interpreted
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

${lastError ? `⚠️ ข้อผิดพลาดจากรอบก่อน: ${lastError}\nกรุณาแก้และเรียก assign_groups ใหม่ให้ผ่านกฎทุกข้อ` : ""}
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