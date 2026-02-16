import openai from "../config/openAI";

export interface Player {
  id: number;
  score: number;
  comment: string;
  gender: string;
}

// =============================================================
// Step 1: AI อ่าน detail แล้วแปลงเป็นคำสั่ง
// =============================================================
type GroupAction = "sort_desc" | "sort_asc" | "balance" | "custom";

const classifyDetail = async (detail: string): Promise<{ action: GroupAction; detail: string }> => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("[CLASSIFY DETAIL]");
    console.log(`   Input: "${detail}"`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `คุณคือตัวแปลคำสั่งจัดกลุ่มแบดมินตัน
อ่านคำสั่งที่ผู้ใช้พิมพ์มา แล้วตอบเป็น JSON ว่าเป็นคำสั่งประเภทไหน

ประเภทคำสั่ง:
- "sort_desc" = เรียงคะแนนจากมากไปน้อย (กลุ่ม A คะแนนสูงสุด)
- "sort_asc" = เรียงคะแนนจากน้อยไปมาก (กลุ่ม A คะแนนต่ำสุด)
- "balance" = กระจายคะแนนให้สมดุลทุกกลุ่ม / คละคะแนน
- "custom" = คำสั่งซับซ้อน เช่น กำหนดเพศ, จับคู่, แยกคน, หรือคำสั่งที่ไม่ใช่แค่เรียงคะแนน

ตอบ JSON เท่านั้น: { "action": "sort_desc" | "sort_asc" | "balance" | "custom" }

ตัวอย่าง:
- "เรียงคะแนนมากไปน้อย" → { "action": "sort_desc" }
- "เรียงคะแนนน้อยไปมาก" → { "action": "sort_asc" }
- "กระจายคะแนน" / "สมดุล" / "คละ" → { "action": "balance" }
- "กลุ่ม A ผู้หญิงล้วน" → { "action": "custom" }
- "ให้ X อยู่กับ Y" → { "action": "custom" }
- "ไม่มีรายละเอียดเพิ่มเติม" → { "action": "balance" }
`
        },
        { role: "user", content: detail }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    const action: GroupAction = result.action || "custom";

    console.log(`   Result: "${action}"`);
    console.log("=".repeat(60));

    return { action, detail };
  } catch (error) {
    console.error("   Classify error, defaulting to 'custom':", error);
    return { action: "custom", detail };
  }
};

// =============================================================
// Step 2A: Code เรียงคะแนนแล้วหั่นเป็นกลุ่ม (sort_desc / sort_asc)
// =============================================================
const groupBySort = (players: Player[], numGroups: number, order: "asc" | "desc"): number[][] => {
  console.log(`\n[CODE SORT] Sorting by score ${order}...`);

  const sorted = [...players].sort((a, b) =>
    order === "desc" ? b.score - a.score : a.score - b.score
  );

  console.log("   Sorted order:");
  sorted.forEach((p, i) => {
    console.log(`   ${i + 1}. ID:${p.id} Score:${p.score} ${p.gender}`);
  });

  // หั่นทีละ 4 คน
  const groups: number[][] = [];
  for (let i = 0; i < sorted.length; i += 4) {
    groups.push(sorted.slice(i, i + 4).map((p) => p.id));
  }

  // ถ้ากลุ่มน้อยกว่าที่ต้องการ เติมกลุ่มเปล่า
  while (groups.length < numGroups) {
    groups.push([]);
  }

  return groups;
};

// =============================================================
// Step 2B: Code กระจายคะแนนสมดุล (balance)
// =============================================================
const groupByBalance = (players: Player[], numGroups: number): number[][] => {
  console.log("\n[CODE BALANCE] Distributing players evenly...");

  // Sort มากไปน้อยก่อน แล้วกระจายแบบ snake draft
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const groups: number[][] = Array.from({ length: numGroups }, () => []);

  sorted.forEach((player, index) => {
    const round = Math.floor(index / numGroups);
    // Snake draft: รอบคี่ไปกลับ
    const groupIndex = round % 2 === 0
      ? index % numGroups
      : numGroups - 1 - (index % numGroups);
    groups[groupIndex].push(player.id);
  });

  // Log score totals
  groups.forEach((g, i) => {
    const scores = g.map((id) => players.find((p) => p.id === id)?.score || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const letter = String.fromCharCode(65 + i);
    console.log(`   Group ${letter}: [${g.join(", ")}] Scores: [${scores.join(", ")}] Total: ${total}`);
  });

  return groups;
};

// =============================================================
// Step 2C-1: ขยาย detail ให้ชัดเจน (เฉพาะ custom case)
// =============================================================
const expandDetail = async (rawDetail: string, players: Player[], numGroups: number): Promise<string> => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("[EXPAND DETAIL]");
    console.log(`   Raw: "${rawDetail}"`);

    const playerSummary = `
ข้อมูลผู้เล่น:
- จำนวน: ${players.length} คน, จัด ${numGroups} กลุ่ม (กลุ่มละไม่เกิน 4 คน)
- ชาย ${players.filter(p => ["m", "male", "ชาย"].includes(p.gender.trim().toLowerCase())).length} คน
- หญิง ${players.filter(p => ["f", "female", "w", "หญิง"].includes(p.gender.trim().toLowerCase())).length} คน
- คะแนน: ${players.map(p => p.score).sort((a, b) => b - a).join(", ")}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `คุณคือตัวขยายความคำสั่งจัดกลุ่มแบดมินตัน

หน้าที่: อ่านคำสั่งดิบที่ผู้ใช้พิมพ์ แล้วเขียนใหม่ให้ชัดเจนขึ้น

★★★ กฎสำคัญ ★★★
1) ห้ามเพิ่มกฎที่ผู้ใช้ไม่ได้พูดถึง!
   - ถ้าผู้ใช้ไม่ได้พูดถึง "เพศ" → ห้ามเพิ่มกฎเรื่องเพศ
   - ถ้าผู้ใช้ไม่ได้พูดถึง "สมดุล" → ห้ามเพิ่มกฎเรื่องสมดุล
   - ถ้าผู้ใช้ไม่ได้พูดถึง "คะแนน" → ห้ามเพิ่มกฎเรื่องคะแนน
2) แค่ขยายความสิ่งที่ผู้ใช้พิมพ์ให้ละเอียดขึ้นเท่านั้น
3) ตอบเป็นข้อความภาษาไทยสั้นๆ ไม่เกิน 3 บรรทัด

${playerSummary}`
        },
        { role: "user", content: rawDetail }
      ],
    });

    const expanded = response.choices[0].message.content?.trim() || rawDetail;
    console.log(`   Expanded: "${expanded}"`);
    console.log("=".repeat(60));
    return expanded;
  } catch (error) {
    console.error("   Expand error, using raw:", error);
    return rawDetail;
  }
};

// =============================================================
// Step 2C-2: AI จัดกลุ่ม (custom - กรณีซับซ้อน)
// =============================================================
const groupByAI = async (players: Player[], detail: string, numGroups: number): Promise<number[][]> => {
  // ขยาย detail ก่อนส่ง AI
  const expandedDetail = await expandDetail(detail, players, numGroups);

  const validIds = players.map((p) => p.id);
  const playerList = players
    .map((i) => {
      let g = i.gender.trim().toLowerCase();
      if (g === "f" || g === "w" || g === "หญิง") g = "Female";
      else if (g === "m" || g === "ชาย") g = "Male";
      return `ID:${i.id} | Gender:${g} | Score:${i.score} | Note:${i.comment}`;
    })
    .join("\n");

  const systemPrompt = `
คุณคือผู้ช่วยจัดกลุ่มนักกีฬาแบดมินตัน
แบ่ง ${players.length} คน เป็น ${numGroups} กลุ่ม

กฏเหล็ก:
1) ตอบเป็น JSON เท่านั้น
2) แต่ละกลุ่มห้ามเกิน 4 คน
3) ID ที่ใช้ได้: [${validIds.join(", ")}] — ห้ามแต่ง ID เอง ห้ามซ้ำ ต้องครบทุกคน
4) ทำตาม detail: "${expandedDetail}"

ถ้า detail ไม่พูดถึงเพศ → ห้ามแบ่งตามเพศ

OUTPUT: { "groups": [[id,id,id,id], [id,id,id,id], ...] }
`;

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`\n[AI ATTEMPT ${attempt}/${MAX_RETRIES}]`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: playerList },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content || "{}";
      console.log("[AI RAW RESPONSE]:", content);

      const result = JSON.parse(content);
      if (!result.groups || !Array.isArray(result.groups)) continue;

      const groups: number[][] = result.groups;
      const validIdSet = new Set(validIds);
      const allReturned = groups.flat();

      const fakeIds = allReturned.filter((id) => !validIdSet.has(id));
      const seen = new Set<number>();
      const dupes: number[] = [];
      for (const id of allReturned) {
        if (seen.has(id)) dupes.push(id);
        seen.add(id);
      }
      const missing = validIds.filter((id) => !new Set(allReturned).has(id));

      if (fakeIds.length > 0) console.log(`   Fake IDs: [${fakeIds.join(", ")}]`);
      if (dupes.length > 0) console.log(`   Duplicate IDs: [${dupes.join(", ")}]`);
      if (missing.length > 0) console.log(`   Missing IDs: [${missing.join(", ")}]`);

      if (fakeIds.length === 0 && dupes.length === 0 && missing.length === 0) {
        console.log("   All IDs valid!");
        return groups;
      }

      if (attempt < MAX_RETRIES) {
        console.log("   Retrying...");
      }
    } catch (error) {
      console.error(`   Error:`, error);
    }
  }

  // Fallback
  console.log("   AI failed, using balance fallback");
  return groupByBalance(players, numGroups);
};

// =============================================================
// Main Function
// =============================================================
export const groupPlayers = async (players: Player[], detail: string, numGroups: number): Promise<number[][]> => {
  console.log("\n" + "=".repeat(60));
  console.log("[GROUP PLAYERS] START");
  console.log("=".repeat(60));
  console.log(`   Players: ${players.length} | Groups: ${numGroups} | Detail: "${detail}"`);
  console.log("\n Player List:");
  players.forEach((p) => {
    console.log(`   [ID:${p.id}] Gender:${p.gender} | Score:${p.score} | Comment:${p.comment}`);
  });

  // Step 1: AI อ่าน detail
  const { action } = await classifyDetail(detail);

  // Step 2: ทำตามคำสั่ง
  let groups: number[][];

  switch (action) {
    case "sort_desc":
      groups = groupBySort(players, numGroups, "desc");
      break;
    case "sort_asc":
      groups = groupBySort(players, numGroups, "asc");
      break;
    case "balance":
      groups = groupByBalance(players, numGroups);
      break;
    case "custom":
      groups = await groupByAI(players, detail, numGroups);
      break;
    default:
      groups = groupByBalance(players, numGroups);
  }

  // Enforce max 4 per group
  const finalGroups: number[][] = [];
  for (const group of groups) {
    if (group.length <= 4) {
      finalGroups.push(group);
    } else {
      for (let i = 0; i < group.length; i += 4) {
        finalGroups.push(group.slice(i, i + 4));
      }
    }
  }

  // Log final result
  console.log("\n" + "=".repeat(60));
  console.log("[FINAL GROUPS RESULT]");
  console.log("=".repeat(60));
  console.log(`Action: ${action} | Total Groups: ${finalGroups.length}`);
  const totalPlayers = finalGroups.reduce((sum, g) => sum + g.length, 0);
  console.log(`Total Players: ${totalPlayers} / ${players.length}`);
  finalGroups.forEach((g, i) => {
    const letter = String.fromCharCode(65 + i);
    const details = g.map((id) => {
      const p = players.find((pl) => pl.id === id);
      return p ? `ID:${p.id}(${p.gender},S:${p.score})` : `ID:${id}(?)`;
    });
    console.log(`   Group ${letter}: [${details.join(", ")}]`);
  });
  console.log("=".repeat(60) + "\n");

  return finalGroups;
};
