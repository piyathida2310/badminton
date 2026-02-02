
import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";

// Helper to calculate points
function getPoints(score1: number | null, score2: number | null): [number, number] {
    if (score1 === null || score2 === null) return [0, 0];
    if (score1 > score2) return [2, 0];
    if (score2 > score1) return [0, 2];
    return [1, 1];
}

export const getGroupDetails = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const groupName = req.query.groupName as string;

        if (!tournamentId || !groupName) {
            return res.status(400).json({ message: "Missing tournamentId or groupName" });
        }

        const tId = Number(tournamentId);

        // 1. Fetch Group
        const group = await prisma.group.findFirst({
            where: {
                tournamentId: tId,
                name: groupName,
            },
            include: {
                registers: true, // Teams in this group
                matches: {
                    include: {
                        player1: true,
                        player2: true,
                    },
                    orderBy: {
                        id: 'asc'
                    }
                }
            },
        });

        if (!group) {
            // Return empty structure if group not found found (or handle error)
            // Check if tournament exists to be sure?
            return res.status(404).json({ message: "Group not found" });
        }

        // 2. Calculate Rankings
        // Map teams
        const teamStats = new Map<number, {
            id: number;
            code: string; // e.g. "BG" + ..
            name: string; // Team Name
            players: string;
            totalScore: number; // Points (P)
            won: number; // Sets/Points Won
            lost: number; // Sets/Points Lost
            diff: number;
        }>();

        // Initialize stats for each register in group
        // Sort first to ensure consistent Index for code generation
        group.registers.sort((a, b) => a.id - b.id);
        const groupLetter = groupName.replace("Group ", "").trim();

        // Helper for mapping HandType to string (if needed, or just use playType)
        const getHandTypeDisplay = (pt: string) => {
            // Basic mapping if needed, otherwise just use as is if it matches "BG", "S", etc.
            // If Prisma enum is used, it might be keys.
            if (pt === "P_MINUS") return "P-";
            if (pt === "P_PLUS") return "P+";
            return pt;
        };

        group.registers.forEach((reg, index) => {
            let players = reg.player1Name || "";
            if (reg.player2Name) players += ` - ${reg.player2Name}`;
            let teamName = reg.teamName || players;

            // Generate code: {Rank}{Group}{Index} -> e.g. BGA1
            const hType = getHandTypeDisplay(reg.playType);
            const teamIndex = index + 1;
            const code = `${hType}${groupLetter}${teamIndex}`;

            teamStats.set(reg.id, {
                id: reg.id,
                code: code,
                name: teamName,
                players: players,
                totalScore: 0,
                won: 0,
                lost: 0,
                diff: 0
            });
        });

        // Process Matches for Stats
        group.matches.forEach(match => {
            if (match.status === 'FINISHED' || (match.score1 !== null && match.score2 !== null)) {
                const p1 = match.player1Id;
                const p2 = match.player2Id;
                const s1 = match.score1 || 0;
                const s2 = match.score2 || 0;

                const [pts1, pts2] = getPoints(s1, s2);

                if (p1 && teamStats.has(p1)) {
                    const stats = teamStats.get(p1)!;
                    stats.totalScore += pts1;
                    stats.won += s1;
                    stats.lost += s2;
                    stats.diff += (s1 - s2);
                }
                if (p2 && teamStats.has(p2)) {
                    const stats = teamStats.get(p2)!;
                    stats.totalScore += pts2;
                    stats.won += s2;
                    stats.lost += s1;
                    stats.diff += (s2 - s1);
                }
            }
        });

        // Convert to Array and Sort for Rank Table
        const rankData = Array.from(teamStats.values())
            .map(t => [
                "", // Will be Rank Code (Col 0)
                t.code, // Team Code (Col 1) -> e.g. BGA1
                t.name, // Team Name
                t.players,
                t.totalScore.toString(),
                t.won.toString(),
                t.lost.toString(),
                t.diff.toString()
            ]);

        // Sort: TotalScore DESC, Diff DESC, Won DESC, then by Code ASC (Tie-breaker)
        rankData.sort((a, b) => {
            const scoreA = parseFloat(a[4]);
            const scoreB = parseFloat(b[4]);
            if (scoreB !== scoreA) return scoreB - scoreA;

            const diffA = parseFloat(a[7]);
            const diffB = parseFloat(b[7]);
            if (diffB !== diffA) return diffB - diffA;

            const wonA = parseFloat(a[5]);
            const wonB = parseFloat(b[5]);
            if (wonB !== wonA) return wonB - wonA;

            // Fallback to Code string compare
            return a[1].localeCompare(b[1]);
        });

        // Fill Rank Number (Col 0)
        // User might want "Rank Code" here? 
        // Mock Col 0: "BG3A". Mock Col 1: "BGA1".
        // "BG3A" might mean "Rank(BG) + Position(3) + Group(A)" ?
        // Or "BG" + "3" + "A".
        // If sorting gives 1st, 2nd, 3rd place.
        // Row 0 = 1st Place.
        // Code = HandType + (Index+1) + GroupLetter.
        // Let's assume Col 0 is Placement ID.
        rankData.forEach((row, index) => {
            // We need HandType. We can extract from Col 1 (BGA1 -> BG) or just take from first match row lookup.
            // Let's parse Col 1 "BGA1" -> "BG" is prefix? But length varies ("P-").
            // Easier: We know Group is last char? Or Group is "A" -> length 1.
            // TeamIndex is integer at end?
            // Actually, let's just grab the HandType from the first teamStat.
            // But HandType might differ? No, a group usually has same HandType.
            // However, to be safe, let's look at the team code in row[1].
            // Pattern: {HandType}{Letter}{Index}. 
            // RegEx to finding GroupLetter?
            // Safe bet: just construct it again if we have the data.

            // BUT, we want "Rank" not "Team ID".
            // 1st place -> 1.
            // Mock used "BG3A" for a team. Wait.
            // Look at Mock Rank Table:
            // Row 1: ["BG3A", "BGA1", ...] -> This team is "BGA1". Rank ID "BG3A"?
            // Row 2: ["BG2A", "BGA2", ...]
            // Row 3: ["BG1A", "BGA3", ...]
            // Row 4: ["BG4A", "BGA4", ...]

            // This implies Column 0 is NOT just "1", "2", "3".
            // It is "BG" + (Original Team Index?) + "A".
            // Wait, if "BGA1" (Team 1) is in Row 1. Code "BG3A".
            // If "BGA3" (Team 3) is in Row 3. Code "BG1A".

            // Actually, it looks like Column 0 is a unique ID for the *Slot* in the bracket?
            // Or maybe "BG" + "Rank Position" + "A"?
            // If Row 1 (Rank 1): "BG3A".
            // If Row 3 (Rank 3): "BG1A".
            // This doesn't match "Rank 1 -> 1".

            // Let's look at Validated Mock:
            // Team "BGA1" (Team 1) -> Col 0 "BG3A".
            // Team "BGA3" (Team 3) -> Col 0 "BG1A".

            // Maybe it's random/hash? Or maybe Col 0 is "Team Code" and Col 1 is "Team Name"?
            // Mock Header: ["Rank", "Team", "ผู้เล่น", ...]
            // Col 0: Rank. Col 1: Team.
            // IF Col 0 is "Rank", usually it's "1", "2", "3".
            // Why "BG3A"?
            // Maybe it's "BG" + "3" (Team Number) + "A"? -> Team 3?
            // But Team 3 is in Row 3 (Rank 3)?

            // User Request: "Change to Rank that competes with that group and followed by team rank 1-4".
            // "เปลี่ยนเป็นแรงค์ที่แข่งกับกรุ๊ปนั้นๆ (Rank competing) และต่อด้วยอับดับทีม1-4 (Team Rank 1-4)".
            // "Team Rank 1-4" could mean "Placement"?
            // If "Rank competing" = "BG".
            // If "Placement" = "1".
            // Then Rank Column = "BG1A"? or "BG1"?

            // If the user meant "T100" (Col 1 in my code) was wrong. 
            // Col 1 is "Team".
            // I generated "T100".
            // User wants "BGA1" (Rank+Group+TeamIndex).
            // This is handled by `code` variable above.

            // Now Column 0 "Rank".
            // If User didn't complain about Col 0 (which I set formatted as `BG${index+1}${Group}` in previous code), 
            // I produced "BG1A" for Rank 1?
            // Previous code: `row[0] = BG${index + 1}${groupName...}`. 
            // Index 0 -> "BG1A".

            // If the user says "Change to Rank... followed by team rank 1-4".
            // Maybe they mean Column 0 should be "1", "2", "3", "4"?
            // Or maybe they mean the *Team Code* (T100) was wrong and needs to be fixed.

            // Given "T100-T105อะ คือผิด" (T100-T105 is wrong), and I put T100 in Col 1.
            // So I fix Col 1 to be `BGA1` etc.

            // What about Col 0?
            // I will set Col 0 to be explicit Rank Number (1, 2, 3, 4) or `BG1A` (Rank Code).
            // Let's generate a "Rank ID" similar to user request just in case.
            // If "Team Rank 1-4" means Position.
            // `BG` + `Group` + `Position`? or `BG` + `Position` + `Group`?
            // Mock had `BG3A` in top row. Maybe random?
            // I will stick to a logical ID for Col 0: `BG` + `Group` + `Position`.
            // But actually, usually Rank is just 1, 2, 3.
            // I will generate straightforward "1", "2", "3" if possible, BUT the mock was string.
            // Let's use `BG` + `Group` + `Position` for Col 0.
            // Or maybe just use the Team Code `BGA1` in Col 0 and Team Name in Col 1?
            // No, Col 1 `Team` usually implies Name or Code.
            // The Mock had: Col 0 `BG3A` (Code?), Col 1 `BGA1` (Code?), Col 2 `Team Name`.

            // Let's assume Col 0 is just an ID.
            // I will update Col 1 (`BGA1`) as requested.
            // And Col 0 I will set to `${HandType}${GroupLetter}${Index+1}` (Placement Code).

            const rankCode = `${getHandTypeDisplay(group.registers[0]?.playType || "BG")}${groupLetter}${index + 1}`;
            row[0] = rankCode;
        });

        // Re-order matches to ensure valid Round Robin (no team plays twice in same round)
        const totalTeams = group.registers.length;
        const matchesPerRound = totalTeams === 3 ? 1 : Math.floor(totalTeams / 2); // 3 teams->1 match/round (bye), 4->2, 5->2, etc.

        let pendingMatches = [...group.matches];
        const organizedMatches = [];

        while (pendingMatches.length > 0) {
            const currentRoundMatches: typeof group.matches = [];
            const teamsInRound = new Set<number>();

            // Try to fill this round
            for (let i = 0; i < pendingMatches.length; i++) {
                // If round is full, stop adding
                if (currentRoundMatches.length >= matchesPerRound) break;

                const m = pendingMatches[i];
                const p1 = m.player1Id;
                const p2 = m.player2Id;

                // Check if players already playing in this round
                if (p1 && teamsInRound.has(p1)) continue;
                if (p2 && teamsInRound.has(p2)) continue;

                // Add to round
                currentRoundMatches.push(m);
                if (p1) teamsInRound.add(p1);
                if (p2) teamsInRound.add(p2);
            }

            // If we couldn't find ANY match for a round but pending exists, 
            // force add the first one to avoid infinite loop (fallback)
            if (currentRoundMatches.length === 0 && pendingMatches.length > 0) {
                currentRoundMatches.push(pendingMatches[0]);
            }

            // Remove found matches from pending
            pendingMatches = pendingMatches.filter(pm => !currentRoundMatches.includes(pm));

            // Add to final list
            organizedMatches.push(...currentRoundMatches);
        }

        // 3. Format Matches
        const matchData = organizedMatches.map((m, index) => {
            const time = m.scheduledTime ? new Date(m.scheduledTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : "";

            // Calculate Round Label: R1, R2, R3...
            const roundNum = Math.floor(index / matchesPerRound) + 1;
            let roundName = `R${roundNum}`;

            let shuttle = "";
            let setScores = "";
            try {
                const dbRound = m.round || "";
                if (dbRound.includes("|")) {
                    const parts = dbRound.split("|");
                    shuttle = parts[1] || "";
                    setScores = parts[2] || "";
                } else if (dbRound.startsWith("{")) {
                    const parsed = JSON.parse(dbRound);
                    shuttle = parsed.shuttle || "";
                }
            } catch (e) { }

            const matchId = m.id.toString();

            // Helper to get Code+Name
            const getTeamDisplay = (pid: number | null, fallbackName: string | null, fallbackP1: string | null) => {
                if (!pid) return "-";
                const stats = teamStats.get(pid);
                if (stats) {
                    return `${stats.code} ${stats.name}`;
                }
                return fallbackName || fallbackP1 || "-";
            };

            const t1 = m.player1;
            const t1Display = getTeamDisplay(m.player1Id, t1?.teamName || null, t1?.player1Name || null);
            const t1Players = t1 ? (t1.player2Name ? `${t1.player1Name} - ${t1.player2Name}` : t1.player1Name) : "-";

            const t2 = m.player2;
            const t2Display = getTeamDisplay(m.player2Id, t2?.teamName || null, t2?.player1Name || null);
            const t2Players = t2 ? (t2.player2Name ? `${t2.player1Name} - ${t2.player2Name}` : t2.player1Name) : "-";

            const s1 = m.score1;
            const s2 = m.score2;

            const [p1, p2] = getPoints(s1, s2);
            // Index 6 (Set Column): Use detailed setScores if available, else standard S1:S2
            const setStr = setScores ? setScores : ((s1 !== null && s2 !== null) ? `${s1} : ${s2}` : " : ");

            return [
                time,          // 0
                roundName,     // 1
                matchId,       // 2
                t1Display,     // 3
                t1Players,     // 4
                s1 !== null ? p1.toString() : "", // 5
                setStr,        // 6
                s2 !== null ? p2.toString() : "", // 7
                t2Display,     // 8
                t2Players,     // 9
                shuttle        // 10
            ];
        });

        return res.status(200).json({
            rank: rankData,
            matches: matchData
        });

    } catch (error) {
        console.error("Get Group Details Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateMatchScore = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { score1, score2, shuttle, time, roundName, sets } = req.body;

        // Fetch existing to preserve round name if we use JSON trick
        const match = await prisma.match.findUnique({
            where: { id: Number(matchId) },
            include: { tournament: true }
        });
        if (!match) return res.status(404).json({ message: "Match not found" });

        let newRound = match.round;
        // We update round string if shuttle OR sets OR roundName provided
        if (shuttle !== undefined || sets !== undefined || roundName) {
            let rName = match.round || "";
            let currentShuttle = "";
            let currentSets = "";

            // Parse existing
            if (rName.startsWith("{")) {
                try { const p = JSON.parse(rName); rName = p.name || ""; currentShuttle = p.shuttle || ""; } catch (e) { }
            } else if (rName.includes("|")) {
                const parts = rName.split("|");
                rName = parts[0];
                currentShuttle = parts[1] || "";
                currentSets = parts[2] || "";
            }

            // Overwrite with new values if provided
            if (roundName) rName = roundName;
            if (shuttle !== undefined) currentShuttle = shuttle;
            if (sets !== undefined) currentSets = sets;

            newRound = `${rName}|${currentShuttle}|${currentSets}`;
        }

        let newScheduledTime = match.scheduledTime;
        if (time && typeof time === 'string') {
            const parts = time.split(':');
            if (parts.length === 2) {
                const h = parseInt(parts[0]);
                const m = parseInt(parts[1]);
                if (!isNaN(h) && !isNaN(m)) {
                    // Use existing date or tournament start date
                    const baseDate = match.scheduledTime ? new Date(match.scheduledTime) : new Date(match.tournament.startDate);
                    baseDate.setHours(h);
                    baseDate.setMinutes(m);
                    baseDate.setSeconds(0);
                    baseDate.setMilliseconds(0);
                    newScheduledTime = baseDate;
                }
            }
        }

        const updated = await prisma.match.update({
            where: { id: Number(matchId) },
            data: {
                score1: score1 !== undefined ? Number(score1) : match.score1,
                score2: score2 !== undefined ? Number(score2) : match.score2,
                round: newRound,
                scheduledTime: newScheduledTime,
                // Automatically set status to FINISHED if scores are present?
                status: (score1 !== undefined && score2 !== undefined) ? 'FINISHED' : match.status
            }
        });

        return res.status(200).json({ message: "Match updated", data: updated });
    } catch (error) {
        console.error("Update Match Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
