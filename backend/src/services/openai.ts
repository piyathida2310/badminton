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
  if (["m", "male", "ชาย", "ผู้ชาย"].includes(x)) return "Male";
  if (["f", "female", "หญิง", "ผู้หญิง", "w"].includes(x)) return "Female";
  return "Unknown";
};

const safeJsonParse = (s: string) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const validateGroups = (players: Player[], numGroups: number, raw: any): number[][] => {
  if (!raw || typeof raw !== "object" || !raw.groups) {
    throw new Error("AI ตอบไม่ตรง schema: ต้องมี { groups: {...} }");
  }

  const groupsObj = raw.groups;
  if (typeof groupsObj !== "object" || Array.isArray(groupsObj)) {
    throw new Error("groups ต้องเป็น object เช่น { A:[...], B:[...] }");
  }

  const keys = Array.from({ length: numGroups }, (_, i) => letters[i]);

  for (const k of keys) {
    if (!Array.isArray(groupsObj[k])) throw new Error(`groups.${k} ต้องเป็น array`);
    if (groupsObj[k].length !== 4) throw new Error(`groups.${k} ต้องมี 4 ทีมพอดี (ตอนนี้ ${groupsObj[k].length})`);
  }

  const validIds = new Set(players.map((p) => p.id));
  const allIds: number[] = keys.flatMap((k) => groupsObj[k]);

  for (const id of allIds) {
    if (typeof id !== "number") throw new Error("ID ใน groups ต้องเป็นตัวเลขเท่านั้น");
    if (!validIds.has(id)) throw new Error(`พบ ID ที่ไม่มีจริง: ${id}`);
  }

  const seen = new Set<number>();
  const dupes: number[] = [];
  for (const id of allIds) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  if (dupes.length) throw new Error(`มี ID ซ้ำ: ${[...new Set(dupes)].join(", ")}`);

  const missing = [...validIds].filter((id) => !seen.has(id));
  if (missing.length) throw new Error(`มี ID หาย: ${missing.join(", ")}`);

  return keys.map((k) => groupsObj[k] as number[]);
};

export const groupPlayers = async (players: Player[], detail: string): Promise<number[][]> => {
  const numGroups = getNumGroups(players.length);
  const groupKeys = Array.from({ length: numGroups }, (_, i) => letters[i]).join(", ");

  const teamList = players
    .map((p) => `ID:${p.id} | Gender:${normalizeGender(p.gender)} | Score:${p.score} | Note:${p.comment || "-"}`)
    .join("\n");

  // ranked list สำหรับให้ AI อ้างอิงเวลาเรียงคะแนน
  const rankedList = [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => `อันดับ ${i + 1}: ID:${p.id} Score:${p.score}`)
    .join("\n");

  const systemPrompt = `
คุณคือระบบจัดกลุ่มทีมแบดมินตัน

กฎตายตัว:
- จำนวนทีมทั้งหมด = ${players.length} (มีได้แค่ 16 หรือ 32)
- ต้องสร้างกลุ่มตามตัวอักษร: ${groupKeys}
- ทุกกลุ่มต้องมี "exactly 4 ทีม" (ห้ามขาด ห้ามเกิน)
- ต้องใช้ ID ให้ครบทุกทีม ห้ามซ้ำ ห้ามหาย ห้ามแต่ง ID
- ถ้าคำสั่งเกี่ยวกับการเรียงคะแนน ให้ทำตามขั้นตอนนี้เสมอ:
  STEP 1: ดู Ranked list ที่แนบมาใน user prompt (เรียงไว้ให้แล้ว)
  STEP 2: แบ่งตาม ranked list นั้น อันดับ 1-4 = A, 5-8 = B, 9-12 = C ...
  STEP 3: ตรวจว่าแต่ละกลุ่มมีคะแนนต่อเนื่องกัน ไม่มีคะแนนสูงกว่าหลุดไปกลุ่มหลัง

ผู้ใช้พิมพ์คำสั่งอะไรก็ได้ เช่น:
- "เรียงคะแนนมากไปน้อย", "คนเก่งอยู่ A ก่อน"
- "เรียงคะแนนน้อยไปมาก", "คนอ่อนอยู่ A ก่อน"
- "คละให้สมดุล", "คละให้แฟร์", "กระจายคะแนน"
- "กลุ่ม A ผู้หญิงล้วน", "A ญล้วน"
- "กลุ่ม B ชาย3หญิง1", "B ช3ญ1", "ชาย 3 หญิง 1", "3:1"
- หรือผสมหลายเงื่อนไข

ต้องทำตามคำสั่งผู้ใช้ 100%
ถ้าทำไม่ได้จริง ให้ตอบ JSON: { "error": "เหตุผลสั้น ๆ" }

ตอบเป็น JSON เท่านั้น ตาม schema:
{
  "interpreted": "สรุปเงื่อนไขที่คุณตีความ (1-2 บรรทัด)",
  "groups": {
    "A": [id,id,id,id],
    "B": [id,id,id,id]
  }
}
(ต้องมีครบทุกกลุ่มตาม ${groupKeys})
ห้ามตอบเป็นข้อความนอก JSON
`.trim();

  const MAX_RETRIES = 4;
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const userPrompt = `
detail: "${detail}"

ทีมทั้งหมด:
${teamList}

Ranked list (เรียงคะแนนมากไปน้อยแล้ว ใช้อ้างอิงการจัดกลุ่ม):
${rankedList}

${lastError ? `ข้อผิดพลาดจากรอบก่อน: ${lastError}\nกรุณาแก้และส่ง JSON ใหม่ให้ผ่านกฎตายตัวทั้งหมด` : ""}
`.trim();

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = res.choices[0].message.content || "{}";
    const parsed = safeJsonParse(content);

    if (parsed?.error) {
      throw new Error(String(parsed.error));
    }

    try {
      return validateGroups(players, numGroups, parsed);
    } catch (e: any) {
      lastError = e?.message || "validate failed";
      if (attempt === MAX_RETRIES) throw new Error(lastError);
    }
  }

  throw new Error("AI grouping failed unexpectedly");
};