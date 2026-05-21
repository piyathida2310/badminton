import openai from "../config/openAI";

export interface Player {
  id: number;
  score: number;
  gender: string;
  comment: string;
  age: number | string;
  teamName: string;
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

// Validate ผลลัพธ์จาก Tool Arguments
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

  // ตรวจสอบความจุสมาชิกของแต่ละกลุ่ม: ห้ามมีกลุ่มใดเกิน 4 ทีม (สามารถมีน้อยกว่า 4 ทีมได้)
  for (const k of keys) {
    const arr = groupsObj[k];
    const size = Array.isArray(arr) ? arr.length : 0;
    if (size > 4) {
      throw new Error(`กลุ่ม ${k} สามารถมีสมาชิกได้สูงสุดไม่เกิน 4 ทีม (ปัจจุบันจัดมา ${size} ทีม)`);
    }
  }

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

// สร้าง Tool Schema แบบ dynamic ตาม numGroups
const buildTool = (numGroups: number, groupKeys: string, numPlayers: number, language: string = "th") => {
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
        "จัดกลุ่มทีมแบดมินตันพร้อมอธิบายเหตุผลของแต่ละกลุ่ม " +
        "ต้องใส่ ID จริงทุกตัว ห้ามซ้ำ ห้ามหาย กระจายผู้เล่นให้แต่ละกลุ่มมีจำนวนเท่าๆ กันหรือใกล้เคียงกันที่สุด",
      parameters: {
        type: "object",
        properties: {
          thinking_process: {
            type: "string",
            description: `พื้นที่สำหรับ "กระดาษทด" ของ AI: ให้คุณทดเลข ID, ขีดฆ่า ID ที่ใช้แล้ว, และวางแผนการจัดกลุ่มอย่างละเอียดที่นี่ (ส่วนนี้ผู้ใช้จะไม่เห็น)`,
          },
          user_explanation: {
            type: "string",
            description: `อธิบายเหตุผลการแบ่งกลุ่ม "ภาษาคน" ที่อ่านง่าย: สรุปใจความสำคัญว่าแต่ละกลุ่มมีลักษณะอย่างไร และลิสต์ชื่อทีม [Team Name] ในก้ามปูให้ครบ (ห้ามใส่เลข ID ในช่องนี้เด็ดขาด!) ตัวอย่าง: 'กลุ่ม A เป็นกลุ่มรวมทีมที่คะแนนใกล้เคียง 6 ตามที่คุณต้องการ ประกอบด้วย [ทีม 1], [ทีม 2]... ส่วนกลุ่มที่เหลือเราสุ่มกระจายให้เท่ากันครับ' (CRITICAL: You must write this field entirely in ${language === "en" ? "English" : "Thai"}!)`,
          },
          interpreted: {
            type: "string",
            description: "สรุปเงื่อนไขที่ตีความได้จากคำสั่งผู้ใช้ (1-2 บรรทัด)",
          },
          errorMessage: {
            type: "string",
            description: "หากข้อมูลผู้เล่นที่มีอยู่ในระบบไม่เพียงพอที่จะตอบสนองเงื่อนไขหลักที่ระบุในคำสั่งของผู้ใช้ (เช่น ผู้ใช้ระบุว่าขอคนอายุ 19 ปี 4 คน แต่มีคนอายุ 19 ปีในรายชื่อแค่คนเดียว) ให้เขียนคำอธิบายความผิดพลาดเป็นภาษาไทยอย่างละเอียด และส่งค่ากลับมาผ่านฟิลด์นี้เพื่อปฏิเสธการจัดกลุ่ม (หากสามารถจัดกลุ่มได้ถูกต้องโดยไม่มีเงื่อนไขใดขัดแย้ง ให้ส่งค่าว่าง \"\")",
          },
          groups: {
            type: "object",
            description: `Object กลุ่ม ${groupKeys} แบ่ง ID ให้ครบ ${numPlayers} คน โดยกระจายจำนวน ID เข้ากลุ่มให้เท่าๆ กัน`,
            properties: groupProperties,
            required: requiredGroups,
            additionalProperties: false,
          },
        },
        required: ["thinking_process", "user_explanation", "interpreted"],
        additionalProperties: false,
      },
    },
  };
};

// แปลงคำสั่งผู้ใช้ (Prompt Translation Pre-processing)
const refinePrompt = async (rawDetail: string, numGroups: number): Promise<string> => {
  if (!rawDetail || rawDetail.trim() === "") return "";

  // 1. ตรวจสอบเบื้องต้นด้วย Keyword (Hard-coded Bypass)
  const groupingKeywords = ["คะแนน", "อายุ", "สุ่ม", "คละ", "กลุ่ม", "คน", "ทีม", "เพศ", "ชาย", "หญิง", "เก่ง", "อ่อน", "score", "age", "random", "group", "male", "female", "จัด", "แบ่ง", "ชุด", "อันดับ"];
  const isGroupingRelated = groupingKeywords.some(kw => rawDetail.toLowerCase().includes(kw));

  // ถ้าเรามั่นใจว่าเกี่ยวแน่ๆ ให้ข้ามการเช็ค INVALID_PROMPT ไปเลย
  const systemMessage = isGroupingRelated
    ? `คุณคือผู้เชี่ยวชาญด้านการจัดกลุ่มการแข่งขันแบดมินตัน โปรดแปลงคำสั่งผู้ใช้ให้เป็น "ขั้นตอนการจัดกลุ่มที่ชัดเจน" เป็นภาษาไทย โดยไม่ต้องตรวจสอบความถูกต้องซ้ำอีกเพราะคำสั่งนี้ได้รับการยืนยันว่าเกี่ยวข้องแล้ว`
    : `คุณคือผู้เชี่ยวชาญด้านการจัดกลุ่มการแข่งขันแบดมินตัน หน้าที่ของคุณคือแปลงคำสั่งผู้ใช้ให้เป็น "ขั้นตอนการจัดกลุ่มที่ชัดเจน"
กฎ:
1. หากคำสั่ง "ไม่เกี่ยวข้อง" กับการจัดกลุ่มแบดมินตันเลย ให้ตอบ: "INVALID_PROMPT"
2. หากเกี่ยวข้อง ให้แปลงเป็นภาษาไทยที่อธิบายขั้นตอน
3. ห้ามพิมพ์คำตอบรับ ให้ตอบเฉพาะผลลัพธ์เท่านั้น`.trim();

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `โปรดแปลคำสั่งนี้: "${rawDetail}"` },
      ],
      temperature: 0.1,
    });

    const result = res.choices?.[0]?.message?.content?.trim() || rawDetail;
    
    // Failsafe: ถ้าเป็นเรื่องจัดกลุ่มแน่ๆ แต่ AI ดันตอบ INVALID_PROMPT มา (ไม่ว่าจะติดคำอื่นมาด้วยหรือไม่)
    if (isGroupingRelated && result.includes("INVALID_PROMPT")) {
      return rawDetail; 
    }

    return result;
  } catch (error) {
    console.error("[refinePrompt error]:", error);
    return rawDetail;
  }
};

// Main: groupPlayers ด้วย OpenAI Tools
export const groupPlayers = async (
  players: Player[],
  detail: string,
  fixedNumGroups?: number,
  requireReason?: boolean,
  language: string = "th"
): Promise<{ groups: number[][]; reason: string }> => {
  const numGroups = fixedNumGroups ?? getNumGroups(players.length);
  const groupKeys = Array.from({ length: numGroups }, (_, i) => letters[i]).join(", ");

  // นำคำสั่งจากหน้าเว็บเข้าสู่กระบวนการ Pre-processing 
  const processedDetail = await refinePrompt(detail, numGroups);
  
  if (processedDetail === "INVALID_PROMPT") {
    throw new Error(
      language === "en" 
        ? "Invalid command.<br />Please provide a relevant instruction." 
        : "คำสั่งไม่เกี่ยวข้องกับการจัดกลุ่มแบดมินตัน<br />กรุณาระบุเงื่อนไข เช่น เรียงตามคะแนน หรือ อายุ"
    );
  }

  console.log(`[groupPlayers] Original Prompt: "${detail}"`);
  console.log(`[groupPlayers] Refined  Prompt: "${processedDetail}"`);

  const teamList = players
    .map(
      (p) =>
        `ทีม: [${p.teamName}] (ID:${p.id}) | Gender:${normalizeGender(p.gender)} | Score:${p.score} | Age:${p.age} | Note:${p.comment || "-"}`
    )
    .join("\n");

  // ranked list สำหรับอ้างอิงการเรียงคะแนน
  const rankedList = [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => `อันดับ ${i + 1}: [${p.teamName}] ID:${p.id} Score:${p.score} Age:${p.age}`)
    .join("\n");

  // Helper ฟังก์ชันสำหรับรวมตัวเลขอายุ กรณีเป็น "40/42"
  const getAgeSum = (ageVal: string | number): number => {
    if (typeof ageVal === "number") return ageVal;
    if (!ageVal) return 0;
    return String(ageVal).split("/").reduce((sum, v) => sum + (parseFloat(v.trim()) || 0), 0);
  };

  //  รายชื่อเรียงลำดับตามอายุ จาก มากไปน้อย (Oldest to Youngest)
  const rankedByAgeDescList = [...players]
    .sort((a, b) => getAgeSum(b.age) - getAgeSum(a.age))
    .map((p, i) => `อันดับ ${i + 1}: [${p.teamName}] ID:${p.id} Score:${p.score} Age:${p.age} (ผลรวมอายุ:${getAgeSum(p.age)})`)
    .join("\n");


  const tool = buildTool(numGroups, groupKeys, players.length, language);

  const systemPrompt = `
คุณคือระบบจัดกลุ่มทีมแบดมินตันอัจฉริยะ
**สำคัญมาก (CRITICAL RULES):**
1. **ช่อง \`thinking_process\`**: ใช้เป็นกระดาษทดของคุณเอง เขียนขั้นตอนเทคนิค การเช็ค ID การขีดฆ่าคนได้เต็มที่ (ผู้ใช้จะไม่เห็นส่วนนี้)
2. **ช่อง \`user_explanation\`**: คือส่วนที่ผู้ใช้จะอ่าน! ต้องใช้ "ภาษาคน" ที่เป็นกันเอง สรุปง่ายๆ ว่าทำไมถึงจัดแบบนี้ ห้ามมีศัพท์เทคนิค ห้ามมีเลข ID และต้องเขียนด้วยภาษา${language === "en" ? "อังกฤษ (English)" : "ไทย (Thai)"} เท่านั้น
3. **ลิสต์ชื่อทีม**: ในช่อง \`user_explanation\` ให้เขียนชื่อทีมในก้ามปู เช่น "[ชื่อทีม]" ให้ครบทุกคนในกลุ่มนั้นๆ เพื่อให้ผู้ใช้ตรวจสอบได้ง่าย
4. **การตรวจสอบเงื่อนไขจำเพาะอย่างเคร่งครัด (Strict Verification)**: หากผู้ใช้ระบุเงื่อนไขการจัดกลุ่มอย่างเฉพาะเจาะจงลงไปในแต่ละกลุ่ม (เช่น "กลุ่ม A อายุ 19 ปี 4 คน", "กลุ่ม B อายุ 40+ จำนวน 2 ทีม") คุณ **ต้องทำการนับจำนวนผู้เล่นที่มีคุณสมบัติตรงเป๊ะในรายชื่อก่อน** และตรวจสอบว่าเงื่อนไขดังกล่าวมีจำนวนที่ขอจัดลงในกลุ่มเกินโควตาความจุของแต่ละกลุ่มหรือไม่ (เช่น ความจุต้องเป็น 4 ทีมพอดี หรือสูงสุดไม่เกิน 4 ทีม) หากผู้เล่นมีคุณสมบัตินั้นๆ ไม่เพียงพอ หรือหากคำสั่งขอให้ดึงคนเข้ากลุ่มใดกลุ่มหนึ่งเกินความจุที่กำหนดไว้ (เช่น ให้จัดผู้เล่นลงกลุ่ม A รวมกัน 6 คน ซึ่งเกินความจุ 4 คน) **คุณห้ามฝืนจัดกลุ่มเด็ดขาด** ให้ส่งข้อความแจ้งเตือนความผิดพลาดกลับไปทางฟิลด์ \`errorMessage\` เป็นภาษาไทยอย่างชัดเจน เช่น "ไม่สามารถจัดกลุ่มได้ เนื่องจากแต่ละกลุ่มมีความจุจำกัดไม่เกิน 4 คน แต่คำสั่งระบุเงื่อนไขกลุ่ม A มีจำนวนรวมกันถึง 6 คน"
5. **การส่งข้อมูลผลลัพธ์กลุ่ม (Required Output in Success Case)**: หากไม่มีข้อผิดพลาดเกิดขึ้น (ช่อง \`errorMessage\` เป็นค่าว่างและสามารถจัดกลุ่มได้สำเร็จ) คุณ **จำเป็นต้องส่งข้อมูลการจัดกลุ่มในฟิลด์ \`groups\` กลับมาให้ครบถ้วนทุกครั้ง ห้ามละเว้นโดยเด็ดขาด** (หากระบุ \`errorMessage\` จึงจะสามารถละเว้นฟิลด์ \`groups\` ได้)

### กฎตายตัว (ห้ามฝ่าฝืนเด็ดขาด):
- จำนวนทีมทั้งหมด = ${players.length}
- ต้องสร้างกลุ่ม: ${groupKeys}
- แต่ละกลุ่มมีทีมได้ "สูงสุด 4 ทีมเท่านั้น" ห้ามเกิน 4 ทีมเด็ดขาด (สามารถมีน้อยกว่า 4 ทีมได้ แต่ห้ามเกิน 4 ทีมโดยเด็ดขาด)
- ใช้ ID จริงที่ให้ไปเท่านั้น ห้ามซ้ำ ห้ามหาย ห้ามแต่ง ID ขึ้นเองเด็ดขาด
- การทำตามข้อกำหนดเรื่องห้าม ID ซ้ำ สำคัญกว่าเงื่อนไขที่ User พิมพ์มา (หากยืนยันว่าเงื่อนไขหลักตรงตามข้อมูลและสามารถจัดกลุ่มได้โดยไม่มี Error)

### ALGORITHM การจัดกลุ่มแบบมองภาพรวม (Global Constraint Satisfaction):
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
  - กฎเหล็ก: 1 ID ลงได้แค่ 1 กลุ่ม ห้ามซ้ำเด็ดขาด! ห้ามนำ ID ที่ถูกขีดทิ้งจาก Pool ไปแล้วมาใช้อีก!

STEP 3 — การอุดรอยรั่วแบบยืดหยุ่น (ทดเลขใน thinking_process เช่นกัน):
  - หากหลังจากจัดแบบฉลาดแล้ว ปรากฏว่ากลุ่มใดกลุ่มหนึ่งมีคนไม่ครบ 4 ทีม (เช่น ขอหญิง 30+ แต่เหลือแค่ 3 คน) ห้าม!! แจ้ง Error และห้าม!! ยกเลิก
  - ให้คุณเอา ID ใครก็ได้ที่ "ยังไม่ได้ถูกจัดลงกลุ่มไหนเลย" มาใส่ผสมให้เต็ม 4 ทีม
  - ทุกกลุ่มต้องมี 4 ทีมพอดีตอนจบกระบวนการ ห้ามมีกลุ่มไหนแหว่ง

STEP 4 — ตรวจสอบขั้นสุดท้ายก่อนส่งคำตอบ:
  → ทุก ID ถูกใช้ครบ ไม่ซ้ำ ไม่หาย
  → จำนวนทีมในแต่ละกลุ่มใกล้เคียงกัน ยุติธรรม ไม่กระจุกตัว

### ตัวอย่าง Gender field ในข้อมูล:
- SINGLE tournament: "Male" หรือ "Female"
- DOUBLE tournament: "Male/Female", "Male/Male", "Female/Female"
  → "ชายล้วน" ใน DOUBLE = หาทีมที่ Gender เป็น "Male/Male"
  → "หญิงล้วน" ใน DOUBLE = "Female/Female"
  → "คู่ผสม"   ใน DOUBLE = "Male/Female"

### ข้อมูล Age (อายุ):
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

  **การจัดการเรื่องคะแนน (Score):**
  - หากผู้ใช้ระบุคะแนน เช่น "6 คะแนน" ให้หาทีมที่มีค่า Score ใกล้เคียงกับ 6 มากที่สุด (เช่น 5.9, 6.0, 6.1)
  - หากในรายชื่อไม่มีทีมที่มีคะแนนใกล้เคียงหรือสอดคล้องเพียงพอสำหรับการจัดกลุ่มตามที่ผู้ใช้ต้องการเลย ให้รายงานความผิดพลาดผ่าน \`errorMessage\` ทันที

  คำเตือนสุดท้าย: คำสั่งสุ่มคละ เช่น "ที่เหลือสุ่ม" หรือ "ที่เหลือคละๆ" จะใช้ได้เฉพาะกับผู้เล่นกลุ่มที่ไม่ได้ระบุเงื่อนไขพิเศษเท่านั้น หากผู้ใช้ระบุเงื่อนไขพิเศษเฉพาะกลุ่มใดกลุ่มหนึ่ง (เช่น กลุ่ม A อายุ 19 ปี 4 คน) และพบว่าจำนวนผู้เล่นที่มีคุณสมบัตินั้นๆ ไม่เพียงพอที่จะเติมเต็มกลุ่มให้ครบตามเงื่อนไขจำเพาะนั้น คุณต้องใช้ฟิลด์ \`errorMessage\` เพื่อระงับการทำงานทันที ห้ามนำผู้เล่นที่ไม่มีคุณสมบัติไม่ตรงกับเงื่อนไขหลักที่ระบุไปเติมในกลุ่มหลักเหล่านั้นเด็ดขาด!
`.trim();

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const userPrompt = `
detail (คำสั่งที่ถูกขัดเกลาแล้ว): "${processedDetail}"

ทีมทั้งหมด:
${teamList}

Ranked list (แนบโพยเรียงคะแนนมากไปน้อยแล้ว):
${rankedList}

Ranked list (แนบโพยเรียงอายุมากไปน้อย Oldest to Youngest ให้แล้ว):
${rankedByAgeDescList}

${lastError ? ` สัญญาณเตือนจากระบบ (สำคัญมาก ห้ามทำผิดซ้ำ):
${lastError}
* สาเหตุที่เป็นไปได้: คุณอาจจะระบุชื่อกลุ่มไม่ถูกต้อง, หรือมี ID ซ้ำ/หายระหว่างกลุ่ม
* วิธีแก้: ตรวจสอบความถูกต้องของการแบ่ง ID อีกครั้งใน thinking_process ห้ามให้มี ID ซ้ำหรือ ID ตกหล่นจากระบบเด็ดขาด!` : ""}
`.trim();

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "assign_groups" } },
    });

    const toolCall = res.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      lastError = "AI ไม่ได้เรียก tool assign_groups";
      if (attempt === MAX_RETRIES) throw new Error(lastError);
      continue;
    }

    let parsed: any;
    try {
      // Use any cast to bypass TypeScript union type restriction on toolCall
      const functionArgs = (toolCall as any).function?.arguments;
      if (!functionArgs) throw new Error("No arguments in tool call");
      parsed = JSON.parse(functionArgs);
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

      const humanReason = (parsed.user_explanation || "").trim();

      return {
        groups: result,
        reason: requireReason ? humanReason : ""
      };
    } catch (e: any) {
      lastError = e?.message || "validate failed";
      if (attempt === MAX_RETRIES) throw new Error(lastError);
    }
  }

  throw new Error("AI grouping failed unexpectedly");
};