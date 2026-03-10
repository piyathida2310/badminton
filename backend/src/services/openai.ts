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

  for (const k of keys) {
    if (!Array.isArray(groupsObj[k]))
      throw new Error(`groups.${k} ต้องเป็น array`);

    if (groupsObj[k].length > 4)
      throw new Error(
        `groups.${k} ต้องมีทีมสูงสุดไม่เกิน 4 ทีม (ตอนนี้ ${groupsObj[k].length})`
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
          interpreted: {
            type: "string",
            description: "สรุปเงื่อนไขที่ตีความได้จากคำสั่งผู้ใช้ (1-2 บรรทัด)",
          },
          groups: {
            type: "object",
            description: `Object กลุ่ม ${groupKeys} แบ่ง ID ให้ครบ ${numPlayers} คน โดยกระจายจำนวน ID เข้ากลุ่มให้เท่าๆ กัน (ไม่จำเป็นต้องกลุ่มละ 4 คนพอดี)`,
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

  const tool = buildTool(numGroups, groupKeys, players.length);

  const systemPrompt = `
คุณคือระบบจัดกลุ่มทีมแบดมินตัน

═══════════════════════════════════════
กฎตายตัว (ห้ามฝ่าฝืนเด็ดขาด):
═══════════════════════════════════════
- จำนวนทีมทั้งหมด = ${players.length}
- ต้องสร้างกลุ่ม: ${groupKeys}
${players.length === 16 || players.length === 32
      ? `- ❗️คนสมัครมา ${players.length} ทีมพอดี ดังนั้น **ทุกกลุ่มต้องมี 4 ทีมพอดีเท่านั้น ห้ามน้อยกว่าหรือมากกว่า 4 โดยเด็ดขาด** (กลุ่มละ 4 คน x ${numGroups} กลุ่ม)`
      : `- ❗️กลุ่มหนึ่งมีทีมได้ "สูงสุด 4 ทีมเท่านั้น" ห้ามเกิน 4 ทีมเด็ดขาด (มีน้อยกว่า 4 ทีมได้ แต่ห้ามเกิน 4 เนื่องจากคนสมัครมี ${players.length} ทีม ไม่เต็มโควต้า)`
    }
- ใช้ ID จริงที่ให้ไปเท่านั้น ❗️ห้ามซ้ำ ❗️ห้ามหาย ❗️ห้ามแต่ง ID ขึ้นเองเด็ดขาด
- การทำตามข้อกำหนดเรื่องห้าม ID ซ้ำ สำคัญกว่าเงื่อนไขที่ User พิมพ์มา ถ้าคนไม่พอให้เอาคนอื่นมาใส่แทน

═══════════════════════════════════════
ALGORITHM เมื่อมีเงื่อนไขต่างๆ (เพศ, อายุ) + เรียงคะแนน:
═══════════════════════════════════════
ให้ทำตามขั้นตอนนี้ทีละกลุ่มตามลำดับ:

STEP 1 — อ่าน constraint (กฎ) ของแต่ละกลุ่มจากคำสั่ง (A, B, C, D, E, F, G, H...):
  - ถ้าผู้ใช้ระบุกฎให้กลุ่มไหน (เช่น "กลุ่ม H ผู้หญิงล้วน") ให้ล็อกสเป็กตามนั้น
  - "ไม่เกิน 20" แปลว่า อายุ <= 20
  - "ไม่ต่ำกว่า 30" หรือ "30 ปีขึ้นไป" แปลว่า อายุ >= 30
  - "อายุ 40 ปี" แปลว่า อายุใกล้เคียง 40 หรือเท่ากับ 40
  - ถ้าระบุผสมกัน (เช่น "หญิงล้วนและอายุไม่ต่ำกว่า 30") ให้หาคนที่เข้าเงื่อนไขทั้งคู่ก่อน

STEP 2 — จัดกลุ่มที่มี constraint เจาะจงก่อน (เช่น กลุ่มที่มีสั่งไว้พิเศษ ไม่ว่าจะ A, B หรือ H):
  → ควานหาจาก Ranked list เรียงคะแนนมากไปน้อย
  → คัด ID ที่ยังไม่ถูกเลือก และ "ตรงสเปก" มากที่สุดก่อน (เช่น ทั้งเป็นหญิง และอายุ >= 30)
  → ❗️ถ้าคน "ตรงสเปกเป๊ะๆ" หมดแล้ว หรือหาไม่ได้เลย:
     ให้ลดบรรทัดฐานลง หยิบคนที่ "ใกล้เคียงสเปกที่สุด" หรือหยิบ "ใครก็ได้ที่เหลืออยู่แบบผสมกัน" มาใส่แทนทันที เพื่อให้เต็มโควต้าของกลุ่ม (เพื่อเลี่ยง ID ซ้ำ)
  → ❗️กฎเหล็กสูงสุด: ห้ามใช้ ID ซ้ำเด็ดขาด ถ้าถูกใช้ไปแล้วห้ามใช้ซ้ำอีก

STEP 3 — กลุ่มที่เหลือ (ไม่มี constraint หรือบอกว่า "สุ่ม" / "คู่ผสม")
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

⚠️ คำเตือนสุดท้าย: ถ้าคุณจัดกลุ่มแล้วเจอ Error ว่า "หา ID ไม่ครบ / ซ้ำ / เกิน 4" แปลว่าคุณบังคับเงื่อนไขคุณลักษณะ (อายุ, เพศ) ไว้โหดเกินไป ให้คุณยอมละทิ้งเงื่อนไขนั้นแล้วหยิบ ID ไหนก็ได้ที่ยังว่างอยู่มาใส่ให้เต็มกล่อง เพื่อให้โปรแกรมทำงานต่อได้!
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

${lastError ? `⚠️ สัญญาณเตือนจากระบบ (สำคัญมาก ห้ามทำผิดซ้ำ):
${lastError}
* สาเหตุที่เป็นไปได้: คุณตั้งเงื่อนไขย่อยตึงเกินไป หรือมีโควต้าจำกัด คุณดันทำ ID ซ้ำ, ID หาย, หรือสร้างมั่วขึ้นมาเพื่อให้ตรงกับคำสั่งยิบย่อยที่คุณตีความผิด หรือพยายามจับยัดใส่ครบ 4
* วิธีแก้: ต้องยืดหยุ่น! กลุ่มที่หาคนตรงสเปกไม่ได้ ให้เอาคนที่เหลืออยู่ "ใครก็ได้" ไปใส่แทนให้คละๆ กัน รับรองว่ามันจะไม่ซ้ำ และผ่านแน่นอน! ห้าม ID ซ้ำเด็ดขาด!` : ""}
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