
import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";
import { HandType } from "@prisma/client";

// Helper for HandType Mapping
const mapHandType = (ht: string): HandType | undefined => {
    switch (ht) {
        case 'S': return 'S';
        case 'N': return 'N';
        case 'P-': return 'P_MINUS';
        case 'P+': return 'P_PLUS';
        case 'NB': return 'NB';
        case 'BG': return 'BG';
        default: return undefined;
    }
};

// Helper to calculate points
function getPoints(score1: number | null, score2: number | null, setScores: string = ""): [number, number] {
    // Priority: Calculate based on Set Wins
    if (setScores) {
        const matches = setScores.match(/(\d+)[:\-](\d+)/g);

        if (matches && matches.length > 0) {
            let p1Sets = 0;
            let p2Sets = 0;

            matches.forEach(m => {
                const parts = m.split(/[:\-]/);
                const s1 = parseInt(parts[0]);
                const s2 = parseInt(parts[1]);
                if (s1 > s2) p1Sets++;
                else if (s2 > s1) p2Sets++;
            });

            if (p1Sets > p2Sets) return [2, 0];
            if (p2Sets > p1Sets) return [0, 2];
            return [1, 1]; // Draw in Sets
        }
    }

    // Fallback: Total Score comparison (if entered)
    if (score1 === null || score2 === null) return [0, 0];
    if (score1 > score2) return [2, 0];
    if (score2 > score1) return [0, 2];
    if (score1 === score2 && score1 > 0) return [1, 1];

    return [0, 0];
}

// ==================== GROUP MATCH ====================

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
                registers: true,
                groupMatches: {
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
            return res.status(404).json({ message: "Group not found" });
        }

        // 2. Calculate Rankings
        const teamStats = new Map<number, {
            id: number;
            code: string;
            name: string;
            players: string;
            totalScore: number;
            won: number;
            lost: number;
            diff: number;
        }>();

        group.registers.sort((a, b) => a.id - b.id);
        const groupMatch = groupName.match(/Group\s+(\w+)/i);
        const groupLetter = groupMatch ? groupMatch[1] : groupName.replace("Group ", "").trim();

        const getHandTypeDisplay = (pt: string) => {
            if (pt === "P_MINUS") return "P-";
            if (pt === "P_PLUS") return "P+";
            return pt;
        };

        group.registers.forEach((reg, index) => {
            let players = reg.player1Name || "";
            if (reg.player2Name) players += ` - ${reg.player2Name}`;
            let teamName = reg.teamName || players;

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
        group.groupMatches.forEach(match => {
            if (match.status === 'FINISHED' || (match.score1 !== null && match.score2 !== null)) {
                const p1 = match.player1Id;
                const p2 = match.player2Id;
                const s1 = match.score1 || 0;
                const s2 = match.score2 || 0;

                const setScores = match.sets || "";
                const [pts1, pts2] = getPoints(s1, s2, setScores);

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
                t.code,
                t.code,
                t.name,
                t.players,
                t.totalScore.toString(),
                t.won.toString(),
                t.lost.toString(),
                t.diff.toString()
            ]);

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

            return a[1].localeCompare(b[1]);
        });

        rankData.forEach((row, index) => {
            const teamCode = row[1] as string;
            const prefixMatch = teamCode.match(/^([A-Za-z]+)/);
            const prefix = prefixMatch ? prefixMatch[1] : "";
            row[0] = `${prefix}${index + 1}`;
        });

        // Re-order matches to ensure valid Round Robin
        const totalTeams = group.registers.length;
        const matchesPerRound = totalTeams === 3 ? 1 : Math.floor(totalTeams / 2);

        const validPlayerIds = new Set(teamStats.keys());
        let pendingMatches = group.groupMatches.filter(m =>
            m.player1Id && validPlayerIds.has(m.player1Id) &&
            m.player2Id && validPlayerIds.has(m.player2Id)
        );
        const organizedMatches = [];

        let roundCounter = 0;
        const matchRoundMap = new Map<number, string>();

        const maxRounds = totalTeams > 0 ? (totalTeams % 2 === 0 ? totalTeams - 1 : totalTeams) : 1;

        while (pendingMatches.length > 0) {
            roundCounter++;
            const currentRoundMatches: typeof group.groupMatches = [];
            const teamsInRound = new Set<number>();

            for (let i = 0; i < pendingMatches.length; i++) {
                if (currentRoundMatches.length >= matchesPerRound) break;

                const m = pendingMatches[i];
                const p1 = m.player1Id;
                const p2 = m.player2Id;

                if (p1 && teamsInRound.has(p1)) continue;
                if (p2 && teamsInRound.has(p2)) continue;

                currentRoundMatches.push(m);
                if (p1) teamsInRound.add(p1);
                if (p2) teamsInRound.add(p2);
            }

            if (currentRoundMatches.length === 0 && pendingMatches.length > 0) {
                currentRoundMatches.push(pendingMatches[0]);
            }

            const displayRoundNum = ((roundCounter - 1) % maxRounds) + 1;
            currentRoundMatches.forEach(m => {
                matchRoundMap.set(m.id, `R${displayRoundNum}`);
            });

            pendingMatches = pendingMatches.filter(pm => !currentRoundMatches.includes(pm));
            organizedMatches.push(...currentRoundMatches);
        }

        // 3. Format Matches
        const activeGroups = await prisma.group.findMany({
            where: { tournamentId: tId },
            select: { id: true }
        });
        const activeGroupIds = activeGroups.map(g => g.id);

        const allTournamentMatches = await prisma.groupMatch.findMany({
            where: {
                tournamentId: tId,
                groupId: { in: activeGroupIds }
            },
            select: { id: true },
            orderBy: [{ scheduledTime: 'asc' }, { id: 'asc' }]
        });
        const allMatchIds = allTournamentMatches.map(m => m.id);

        const matchData = organizedMatches.map((m, index) => {
            const time = m.scheduledTime ? new Date(m.scheduledTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : "";

            const roundName = matchRoundMap.get(m.id) || "-";

            const shuttle = m.shuttle !== null ? m.shuttle.toString() : "";
            const setScores = m.sets || "";

            const matchId = m.id.toString();
            const globalMatchNumber = allMatchIds.indexOf(m.id) + 1;
            const matchDisplay = globalMatchNumber > 0 ? globalMatchNumber.toString() : "-";

            const getTeamData = (pid: number | null, fallbackName: string | null, fallbackP1: string | null) => {
                if (!pid) return { code: "-", name: "-" };
                const stats = teamStats.get(pid);
                if (stats) {
                    return { code: stats.code, name: stats.name };
                }
                return { code: "-", name: fallbackName || fallbackP1 || "-" };
            };

            const t1 = m.player1;
            const t1Data = getTeamData(m.player1Id, t1?.teamName || null, t1?.player1Name || null);
            const t1Players = t1 ? (t1.player2Name ? `${t1.player1Name} - ${t1.player2Name}` : t1.player1Name) : "-";

            const t2 = m.player2;
            const t2Data = getTeamData(m.player2Id, t2?.teamName || null, t2?.player1Name || null);
            const t2Players = t2 ? (t2.player2Name ? `${t2.player1Name} - ${t2.player2Name}` : t2.player1Name) : "-";

            const s1 = m.score1;
            const s2 = m.score2;

            const [p1, p2] = getPoints(s1, s2, setScores);
            const setStr = setScores ? setScores : ((s1 !== null && s2 !== null) ? `${s1} : ${s2}` : " : ");

            return [
                time,          // 0
                roundName,     // 1
                matchDisplay,  // 2: Seq Number (Global)
                t1Data.code,   // 3 (Code)
                t1Data.name,   // 4 (Name)
                t1Players,     // 5
                s1 !== null ? p1.toString() : "", // 6
                setStr,        // 7
                s2 !== null ? p2.toString() : "", // 8
                t2Data.code,   // 9 (Code)
                t2Data.name,   // 10 (Name)
                t2Players,     // 11
                shuttle,       // 12
                matchId        // 13: Real Match ID (Hidden)
            ];
        });

        // Check if group is finished
        // A group is finished if there are no pending matches AND all organized matches have scores/status
        const isFinished = pendingMatches.length === 0 && organizedMatches.every(m => m.status === 'FINISHED' || (m.score1 !== null && m.score2 !== null));

        return res.status(200).json({
            rank: rankData,
            matches: matchData,
            isFinished: isFinished // ✅ New Flag
        });

    } catch (error) {
        console.error("Get Group Details Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== GROUP MATCH - UPDATE SCORE ====================

export const updateGroupMatchScore = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { score1, score2, shuttle, time, sets } = req.body;

        const match = await prisma.groupMatch.findUnique({
            where: { id: Number(matchId) },
            include: { tournament: true }
        });
        if (!match) return res.status(404).json({ message: "GroupMatch not found" });

        let newScheduledTime = match.scheduledTime;
        if (time && typeof time === 'string') {
            const parts = time.split(':');
            if (parts.length === 2) {
                const h = parseInt(parts[0]);
                const m = parseInt(parts[1]);
                if (!isNaN(h) && !isNaN(m)) {
                    const baseDate = match.scheduledTime ? new Date(match.scheduledTime) : new Date(match.tournament.startDate);
                    baseDate.setHours(h);
                    baseDate.setMinutes(m);
                    baseDate.setSeconds(0);
                    baseDate.setMilliseconds(0);
                    newScheduledTime = baseDate;
                }
            }
        }

        const updated = await prisma.groupMatch.update({
            where: { id: Number(matchId) },
            data: {
                score1: score1 !== undefined ? Number(score1) : match.score1,
                score2: score2 !== undefined ? Number(score2) : match.score2,
                sets: sets !== undefined ? sets : match.sets,
                shuttle: shuttle !== undefined ? Number(shuttle) : match.shuttle,
                scheduledTime: newScheduledTime,
                status: (score1 !== undefined && score2 !== undefined) ? 'FINISHED' : match.status
            }
        });

        return res.status(200).json({ message: "GroupMatch updated", data: updated });
    } catch (error) {
        console.error("Update GroupMatch Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== BRACKET MATCH - UPDATE SCORE ====================

// ==================== BRACKET MATCH - UPDATE SCORE ====================

// ==================== BRACKET MATCH - UPDATE SCORE ====================

export const updateBracketMatchScore = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { score1, score2, shuttle, time, sets, player1Id, player2Id } = req.body;

        const match = await prisma.bracketMatch.findUnique({
            where: { id: Number(matchId) },
            include: { tournament: true }
        });
        if (!match) return res.status(404).json({ message: "BracketMatch not found" });

        let newScheduledTime = match.scheduledTime;
        if (time && typeof time === 'string') {
            const parts = time.split(':');
            if (parts.length === 2) {
                const h = parseInt(parts[0]);
                const m = parseInt(parts[1]);
                if (!isNaN(h) && !isNaN(m)) {
                    const baseDate = match.scheduledTime ? new Date(match.scheduledTime) : new Date(match.tournament.startDate);
                    baseDate.setHours(h);
                    baseDate.setMinutes(m);
                    baseDate.setSeconds(0);
                    baseDate.setMilliseconds(0);
                    newScheduledTime = baseDate;
                }
            }
        }

        const newScore1 = score1 !== undefined ? Number(score1) : match.score1;
        const newScore2 = score2 !== undefined ? Number(score2) : match.score2;
        const newSets = sets !== undefined ? sets : match.sets;
        const newShuttle = shuttle !== undefined ? Number(shuttle) : match.shuttle;

        // Determine Winner
        let winnerId = match.winnerId;
        let status = match.status;

        if (newScore1 !== null && newScore2 !== null) {
            status = 'FINISHED';
            const [p1, p2] = getPoints(newScore1, newScore2, newSets || "");
            if (p1 > p2) winnerId = match.player1Id; // Note: Uses current/new player IDs?
            // Actually if we update player1Id in the SAME call, we should use the new one?
            // Let's assume standard update. Ideally player update and score update are separate.
            // But if we do update player, logic below uses `match.player1Id which is OLD`.
            // Let's rely on stored IDs for winner calculation unless updated.
            const p1Id = player1Id !== undefined ? Number(player1Id) : match.player1Id;
            const p2Id = player2Id !== undefined ? Number(player2Id) : match.player2Id;

            if (p1 > p2) winnerId = p1Id;
            else if (p2 > p1) winnerId = p2Id;
            else winnerId = null;
        }

        const updated = await prisma.bracketMatch.update({
            where: { id: Number(matchId) },
            data: {
                score1: newScore1,
                score2: newScore2,
                sets: newSets,
                shuttle: newShuttle,
                scheduledTime: newScheduledTime,
                status: status,
                winnerId: winnerId,
                player1Id: player1Id !== undefined ? Number(player1Id) : match.player1Id,
                player2Id: player2Id !== undefined ? Number(player2Id) : match.player2Id,
            }
        });

        // Advance Winner
        if (winnerId && match.winnerNextMatchId) {
            const slotField = match.winnerNextMatchSlot === 'P1' ? 'player1Id' : 'player2Id';
            await prisma.bracketMatch.update({
                where: { id: match.winnerNextMatchId },
                data: {
                    [slotField]: winnerId
                }
            });
        }

        return res.status(200).json({ message: "BracketMatch updated", data: updated });
    } catch (error) {
        console.error("Update BracketMatch Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
// ==================== BRACKET MATCH - GET / INITIALIZE ====================

export const getBracketMatches = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const handTypeStr = req.query.handType as string;
        const tId = Number(tournamentId);

        if (!tId) return res.status(400).json({ message: "Invalid Tournament ID" });

        // Map HandType
        const handType = handTypeStr ? mapHandType(handTypeStr) : undefined;

        // 1. Check if matches exist (Filter by HandType if provided)
        const whereClause: any = { tournamentId: tId };
        if (handType) {
            whereClause.handType = handType;
        }

        const existingMatches = await prisma.bracketMatch.findMany({
            where: whereClause,
            orderBy: [{ roundSequence: 'asc' }, { matchSequence: 'asc' }],
            include: {
                player1: true,
                player2: true,
                winner: true
            }
        });

        if (existingMatches.length > 0) {
            // Check if we need to initialize Lower Bracket (Legacy Fix)
            const tournament = await prisma.tournament.findUnique({ where: { id: tId } });

            // Robust check for isLowerBracket
            const rawLower = tournament?.isLowerBracket as any;
            const isLowerEnabled = rawLower === true || rawLower === "true";

            const hasLowerMatches = existingMatches.some(m => m.stage === 'LOWER');

            if (isLowerEnabled && !hasLowerMatches) {
                // Initialize Lower Bracket
                // Respect tournament size
                const isSmall = (tournament?.maxPlayers || 32) <= 16;
                const lowerMatches = [];

                // L-Final (Round 4)
                const lFinal = await prisma.bracketMatch.create({
                    data: { tournamentId: tId, roundSequence: 4, matchSequence: 1, stage: 'LOWER', handType: handType || null }
                });

                // L-SF (Round 3)
                const lSFs = [];
                for (let i = 0; i < 2; i++) {
                    const parent = lFinal;
                    const slot = (i % 2 === 0) ? 'P1' : 'P2';
                    const m = await prisma.bracketMatch.create({
                        data: { tournamentId: tId, roundSequence: 3, matchSequence: i + 1, stage: 'LOWER', winnerNextMatchId: parent.id, winnerNextMatchSlot: slot, handType: handType || null }
                    });
                    lSFs.push(m);
                }

                // L-QF (Round 2)
                const lQFs = [];
                for (let i = 0; i < 4; i++) {
                    const parent = lSFs[Math.floor(i / 2)];
                    const slot = (i % 2 === 0) ? 'P1' : 'P2';
                    const m = await prisma.bracketMatch.create({
                        data: { tournamentId: tId, roundSequence: 2, matchSequence: i + 1, stage: 'LOWER', winnerNextMatchId: parent.id, winnerNextMatchSlot: slot, handType: handType || null }
                    });
                    lQFs.push(m);
                }

                // L-R16 (Round 1) - ONLY if Not Small
                if (!isSmall) {
                    for (let i = 0; i < 8; i++) {
                        const parent = lQFs[Math.floor(i / 2)];
                        const slot = (i % 2 === 0) ? 'P1' : 'P2';
                        await prisma.bracketMatch.create({
                            data: { tournamentId: tId, roundSequence: 1, matchSequence: i + 1, stage: 'LOWER', winnerNextMatchId: parent.id, winnerNextMatchSlot: slot, handType: handType || null }
                        });
                    }
                }


                // Fetch again to include new matches (With HandType Filter)
                const allMatches = await prisma.bracketMatch.findMany({
                    where: whereClause,
                    orderBy: [{ roundSequence: 'asc' }, { matchSequence: 'asc' }],
                    include: { player1: true, player2: true, winner: true }
                });
                return res.status(200).json({ data: allMatches });
            }

            return res.status(200).json({ data: existingMatches });
        }

        // 2. Initialize Bracket (If NO matches found for this HandType)
        // Determine Size
        const tournament = await prisma.tournament.findUnique({ where: { id: tId } });
        const isSmallBracket = (tournament?.maxPlayers || 32) <= 16;

        // Check if lower bracket is enabled for this tournament
        const rawLower = tournament?.isLowerBracket as any;
        const isLowerEnabled = rawLower === true || rawLower === "true";

        // Structure: 
        // R4: Final (1 Match)
        // R3: SF (2 Matches)
        // R2: QF (4 Matches)
        // R1: R16 (8 Matches) - Optional

        // Round 4: Final (1 Match)
        const final = await prisma.bracketMatch.create({
            data: {
                tournamentId: tId,
                roundSequence: 4,
                matchSequence: 1,
                stage: 'GRAND_FINAL',
                handType: handType || null
            }
        });

        // Round 3: Semi Finals (2 Matches)
        const sf1 = await prisma.bracketMatch.create({
            data: {
                tournamentId: tId,
                roundSequence: 3,
                matchSequence: 1,
                stage: 'UPPER',
                winnerNextMatchId: final.id,
                winnerNextMatchSlot: 'P1',
                handType: handType || null
            }
        });
        const sf2 = await prisma.bracketMatch.create({
            data: {
                tournamentId: tId,
                roundSequence: 3,
                matchSequence: 2,
                stage: 'UPPER',
                winnerNextMatchId: final.id,
                winnerNextMatchSlot: 'P2',
                handType: handType || null
            }
        });
        const sfs = [sf1, sf2];

        // Round 2: Quarter Finals (4 Matches)
        const qfs = [];
        for (let i = 0; i < 4; i++) {
            const parent = sfs[Math.floor(i / 2)];
            const slot = (i % 2 === 0) ? 'P1' : 'P2';
            const qf = await prisma.bracketMatch.create({
                data: {
                    tournamentId: tId,
                    roundSequence: 2,
                    matchSequence: i + 1,
                    stage: 'UPPER',
                    winnerNextMatchId: parent.id,
                    winnerNextMatchSlot: slot,
                    handType: handType || null
                }
            });
            qfs.push(qf);
        }

        // Round 1: Round of 16 (8 Matches) - Only for Large Brackets
        if (!isSmallBracket) {
            const r16s = [];
            for (let i = 0; i < 8; i++) {
                const parent = qfs[Math.floor(i / 2)];
                const slot = (i % 2 === 0) ? 'P1' : 'P2';
                const r16 = await prisma.bracketMatch.create({
                    data: {
                        tournamentId: tId,
                        roundSequence: 1,
                        matchSequence: i + 1,
                        stage: 'UPPER',
                        winnerNextMatchId: parent.id,
                        winnerNextMatchSlot: slot,
                        handType: handType || null
                    }
                });
                r16s.push(r16);
            }
        }

        // Initialize Lower Bracket IF enabled (Recursive-ish but inline)
        if (isLowerEnabled) {
            // L-Final (1)
            const lFinal = await prisma.bracketMatch.create({
                data: { tournamentId: tId, roundSequence: 4, matchSequence: 1, stage: 'LOWER', handType: handType || null }
            });

            // L-SF (2)
            const lSFs = [];
            for (let i = 0; i < 2; i++) {
                const parent = lFinal;
                const slot = (i % 2 === 0) ? 'P1' : 'P2';
                const m = await prisma.bracketMatch.create({
                    data: { tournamentId: tId, roundSequence: 3, matchSequence: i + 1, stage: 'LOWER', winnerNextMatchId: parent.id, winnerNextMatchSlot: slot, handType: handType || null }
                });
                lSFs.push(m);
            }

            // L-QF (4)
            const lQFs = [];
            for (let i = 0; i < 4; i++) {
                const parent = lSFs[Math.floor(i / 2)];
                const slot = (i % 2 === 0) ? 'P1' : 'P2';
                const m = await prisma.bracketMatch.create({
                    data: { tournamentId: tId, roundSequence: 2, matchSequence: i + 1, stage: 'LOWER', winnerNextMatchId: parent.id, winnerNextMatchSlot: slot, handType: handType || null }
                });
                lQFs.push(m);
            }

            // L-R16 (8)
            for (let i = 0; i < 8; i++) {
                const parent = lQFs[Math.floor(i / 2)];
                const slot = (i % 2 === 0) ? 'P1' : 'P2';
                await prisma.bracketMatch.create({
                    data: { tournamentId: tId, roundSequence: 1, matchSequence: i + 1, stage: 'LOWER', winnerNextMatchId: parent.id, winnerNextMatchSlot: slot, handType: handType || null }
                });
            }
        }

        // Fetch all newly created
        const allMatches = await prisma.bracketMatch.findMany({
            where: whereClause,
            orderBy: [{ roundSequence: 'asc' }, { matchSequence: 'asc' }],
            include: {
                player1: true,
                player2: true,
                winner: true
            }
        });

        return res.status(201).json({ message: "Bracket initialized", data: allMatches });

    } catch (error) {
        console.error("Get Bracket Matches Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== MATCH HISTORY (ALL MATCHES) ====================

const HAND_TYPE_DISPLAY: Record<string, string> = {
    BG: "BG", NB: "NB", N: "N", S: "S", P_MINUS: "P-", P_PLUS: "P+"
};

const MATCH_STATUS_MAP: Record<string, string> = {
    PENDING: "รอแข่ง",
    RUNNING: "กำลังแข่ง",
    FINISHED: "แข่งสำเร็จ",
    CANCELLED: "ยกเลิก",
};

export const getMatchHistory = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const tId = Number(tournamentId);
        if (!tId) return res.status(400).json({ message: "Invalid Tournament ID" });

        const tournament = await prisma.tournament.findUnique({ where: { id: tId } });
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });

        const isDouble = tournament.playType === "DOUBLE";

        // Fetch all group matches
        const groupMatches = await prisma.groupMatch.findMany({
            where: { tournamentId: tId },
            include: {
                player1: true,
                player2: true,
                group: true,
            },
            orderBy: [{ scheduledTime: "asc" }, { id: "asc" }],
        });

        // Fetch all bracket matches
        const bracketMatches = await prisma.bracketMatch.findMany({
            where: { tournamentId: tId },
            include: {
                player1: true,
                player2: true,
            },
            orderBy: [{ roundSequence: "asc" }, { matchSequence: "asc" }, { id: "asc" }],
        });

        const results: any[] = [];

        // Process Group Matches
        for (const m of groupMatches) {
            const handType = m.handType ? (HAND_TYPE_DISPLAY[m.handType] || m.handType) : "-";
            const status = MATCH_STATUS_MAP[m.status] || m.status;
            const groupName = m.group?.name || "-";
            const roundName = m.roundName || "-";

            const timeIn = m.scheduledTime
                ? new Date(m.scheduledTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
                : "-";

            // Player 1
            const team1 = m.player1?.teamName || "-";
            const player1A = m.player1?.player1Name || "-";
            const player1B = isDouble ? (m.player1?.player2Name || undefined) : undefined;

            // Player 2
            const team2 = m.player2?.teamName || "-";
            const player2A = m.player2?.player1Name || "-";
            const player2B = isDouble ? (m.player2?.player2Name || undefined) : undefined;

            const score = (m.score1 !== null && m.score2 !== null)
                ? `${m.score1} : ${m.score2}`
                : (m.sets || "-");

            results.push({
                id: m.id,
                court: "-",
                status,
                matchType: isDouble ? "double" : "single",
                timeIn,
                timeOut: "-",
                duration: "-",
                type: handType,
                round: roundName,
                group: groupName,
                team1,
                player1A,
                player1B,
                vsGroup: "-",
                team2,
                player2A,
                player2B,
                score,
                shuttle: m.shuttle ?? null,
                stage: "group",
            });
        }

        // Process Bracket Matches
        const roundNameMap: Record<number, string> = {
            1: "R16",
            2: "QF",
            3: "Semi-Final",
            4: "Final",
        };

        for (const m of bracketMatches) {
            const handType = m.handType ? (HAND_TYPE_DISPLAY[m.handType] || m.handType) : "-";
            const status = MATCH_STATUS_MAP[m.status] || m.status;
            const stageLabel = m.stage === "LOWER" ? "Lower" : m.stage === "GRAND_FINAL" ? "Grand Final" : "Upper";
            const roundName = `${stageLabel} ${roundNameMap[m.roundSequence || 0] || `R${m.roundSequence}`}`;

            const timeIn = m.scheduledTime
                ? new Date(m.scheduledTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
                : "-";

            // Player 1
            const team1 = m.player1?.teamName || "-";
            const player1A = m.player1?.player1Name || "-";
            const player1B = isDouble ? (m.player1?.player2Name || undefined) : undefined;

            // Player 2
            const team2 = m.player2?.teamName || "-";
            const player2A = m.player2?.player1Name || "-";
            const player2B = isDouble ? (m.player2?.player2Name || undefined) : undefined;

            const score = (m.score1 !== null && m.score2 !== null)
                ? `${m.score1} : ${m.score2}`
                : (m.sets || "-");

            results.push({
                id: m.id,
                court: "-",
                status,
                matchType: isDouble ? "double" : "single",
                timeIn,
                timeOut: "-",
                duration: "-",
                type: handType,
                round: roundName,
                group: "-",
                team1,
                player1A,
                player1B,
                vsGroup: "-",
                team2,
                player2A,
                player2B,
                score,
                shuttle: m.shuttle ?? null,
                stage: stageLabel,
            });
        }

        return res.status(200).json({
            message: "Match history fetched successfully",
            data: results,
            meta: {
                totalGroupMatches: groupMatches.length,
                totalBracketMatches: bracketMatches.length,
                total: results.length,
            },
        });
    } catch (error) {
        console.error("Get Match History Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
