import openai from "../config/openAI";

export interface Player {
  id: number;
  score: number;
  gender: string;
  comment: string;
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
    if (groupsObj[k].length !== 4)
      throw new Error(
        `groups.${k} ต้องมีพอดี 4 ทีม (ตอนนี้ ${groupsObj[k].length})`
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
      description: `รายการ ID ทีมในกลุ่ม ${key} — ต้องมีพอดี 4 ทีม`,
    };
    requiredGroups.push(key);
  }

  return {
    type: "function" as const,
    function: {
      name: "assign_groups",
      description:
        "จัดกลุ่มทีมแบดมินตันตามเงื่อนไขที่ผู้ใช้กำหนด " +
        "ต้องใส่ ID จริงทุกตัว ห้ามซ้ำ ห้ามหาย แต่ละกลุ่มมีพอดี 4 ทีม",
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
        `ID:${p.id} | Gender:${normalizeGender(p.gender)} | Score:${p.score} | Note:${p.comment || "-"}`
    )
    .join("\n");

  // ranked list สำหรับอ้างอิงการเรียงคะแนน
  const rankedList = [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => `อันดับ ${i + 1}: ID:${p.id} Score:${p.score}`)
    .join("\n");

  const tool = buildTool(numGroups, groupKeys);

  const systemPrompt = `
คุณคือระบบจัดกลุ่มทีมแบดมินตัน

กฎตายตัว:
- จำนวนทีมทั้งหมด = ${players.length} (16 หรือ 32 เท่านั้น)
- ต้องสร้างกลุ่มตามตัวอักษร: ${groupKeys}
- ทุกกลุ่มต้องมี "exactly 4 ทีม" (ห้ามขาด ห้ามเกิน)
- ต้องใช้ ID จริงครบทุกตัว ห้ามซ้ำ ห้ามหาย ห้ามแต่ง ID

ถ้าคำสั่งเกี่ยวกับการเรียงคะแนน ให้ทำตามขั้นตอนนี้:
  STEP 1: ดู Ranked list ที่แนบมาใน user prompt
  STEP 2: แบ่งตาม ranked list — อันดับ 1-4 = A, 5-8 = B, 9-12 = C ...
  STEP 3: ตรวจว่าแต่ละกลุ่มมีคะแนนต่อเนื่องกัน

ตัวอย่างคำสั่งที่รองรับ:
- "เรียงคะแนนมากไปน้อย", "คนเก่งอยู่ A ก่อน"
- "เรียงคะแนนน้อยไปมาก", "คนอ่อนอยู่ A ก่อน"
- "คละให้สมดุล", "คละให้แฟร์", "กระจายคะแนน"
- "กลุ่ม A ผู้หญิงล้วน", "B ชาย3หญิง1"
- หรือผสมหลายเงื่อนไข

ทำตามคำสั่งผู้ใช้ 100%
ถ้าทำไม่ได้จริง ให้ระบุใน field interpreted และจัดกลุ่มให้ดีที่สุดเท่าที่ทำได้
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