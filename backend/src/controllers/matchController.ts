
import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";
import { HandType } from "@prisma/client";
import crypto from "crypto";
import { signGetObjectUrl, uploadFileToS3 } from "../services/storageService";
import { refreshTournamentSummary } from "./summaryController";

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
    if (setScores && setScores.trim()) {
        // Split by comma, semicolon, or newline to handle multiple sets robustly
        const setParts = setScores.split(/[,;\n\r]+/).map(s => s.trim()).filter(s => s.length > 0);
        
        let p1Score = 0;
        let p2Score = 0;
        let foundValidSet = false;

        setParts.forEach(part => {
            const match = part.match(/(\d+)\s*[:\-]\s*(\d+)/);
            if (match) {
                const s1 = parseInt(match[1]);
                const s2 = parseInt(match[2]);
                if (s1 > s2) {
                    p1Score += 1;
                } else if (s2 > s1) {
                    p2Score += 1;
                } else {
                    // Tie in this set: both get 1 point
                    p1Score += 1;
                    p2Score += 1;
                }
                foundValidSet = true;
            }
        });

        if (foundValidSet) {
            return [p1Score, p2Score];
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

        // Collect forfeited register IDs in this group stage
        const forfeitedRegIds = new Set<number>();
        group.groupMatches.forEach(match => {
            if (match.remark && match.winnerId && match.status === 'FINISHED') {
                const loserId = match.player1Id === match.winnerId ? match.player2Id : match.player1Id;
                if (loserId) {
                    forfeitedRegIds.add(loserId);
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
                t.diff.toString(),
                t.id.toString(),
                forfeitedRegIds.has(t.id) ? "true" : "false" // 9: isForfeited
            ]);

        rankData.sort((a, b) => {
            const idA = Number(a[8]);
            const idB = Number(b[8]);
            const forfeitA = forfeitedRegIds.has(idA);
            const forfeitB = forfeitedRegIds.has(idB);

            if (forfeitA !== forfeitB) {
                return forfeitA ? 1 : -1; // Forfeited team always goes to the bottom
            }

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

        while (pendingMatches.length > 0 && roundCounter < 100) {
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
                matchId,       // 13: Real Match ID (Hidden)
                m.remark || "", // 14: Remark
                m.remark && m.winnerId ? (m.player1Id !== m.winnerId ? "1" : "2") : "" // 15: Forfeiting Team ("1" or "2")
            ];
        });

        // Check if group is finished
        // A group is finished if there are no pending matches AND all organized matches have scores/status
        const isFinished = pendingMatches.length === 0 && organizedMatches.every(m => m.status === 'FINISHED' || (m.score1 !== null && m.score2 !== null));

        // ✅ Find the handType for this group's members
        let groupHandType = group.registers?.[0]?.playType || null;

        // Legacy Fallback: If no handType in registers, check group matches
        if (!groupHandType && group.groupMatches?.length > 0) {
            groupHandType = group.groupMatches[0].handType || null;
        }

        return res.status(200).json({
            rank: rankData,
            matches: matchData,
            handType: groupHandType,
            isFinished: isFinished
        });

    } catch (error) {
        console.error("Get Group Details Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Helper for automatic cascading forfeits
async function applyCascadeForfeit(tournamentId: number, loserId: number, remark: string) {
    if (!loserId || !tournamentId) return;

    const forfeitRemark = `ถอนสิทธิ์/แพ้บายเนื่องจาก: ${remark}`;

    // 1. Forfeit remaining Group Matches
    const remainingGroupMatches = await prisma.groupMatch.findMany({
        where: {
            tournamentId,
            status: { in: ['PENDING', 'RUNNING'] },
            OR: [
                { player1Id: loserId },
                { player2Id: loserId }
            ]
        }
    });

    for (const gm of remainingGroupMatches) {
        const isPlayer1 = gm.player1Id === loserId;
        await prisma.groupMatch.update({
            where: { id: gm.id },
            data: {
                score1: isPlayer1 ? 0 : 42,
                score2: isPlayer1 ? 42 : 0,
                sets: isPlayer1 ? "0 : 21, 0 : 21" : "21 : 0, 21 : 0",
                status: 'FINISHED',
                winnerId: isPlayer1 ? gm.player2Id : gm.player1Id,
                remark: forfeitRemark
            }
        });
    }

    // 2. Forfeit remaining Bracket Matches
    const remainingBracketMatches = await prisma.bracketMatch.findMany({
        where: {
            tournamentId,
            status: { in: ['PENDING', 'RUNNING'] },
            OR: [
                { player1Id: loserId },
                { player2Id: loserId }
            ]
        }
    });

    for (const bm of remainingBracketMatches) {
        const isPlayer1 = bm.player1Id === loserId;
        const opponentId = isPlayer1 ? bm.player2Id : bm.player1Id;
        const winnerId = opponentId;

        const score1 = isPlayer1 ? 0 : 42;
        const score2 = isPlayer1 ? 42 : 0;
        const sets = isPlayer1 ? "0 : 21, 0 : 21" : "21 : 0, 21 : 0";

        await prisma.bracketMatch.update({
            where: { id: bm.id },
            data: {
                score1,
                score2,
                sets,
                status: 'FINISHED',
                winnerId,
                remark: forfeitRemark
            }
        });

        // Advance opponent in bracket
        if (winnerId && bm.winnerNextMatchId) {
            const slotField = bm.winnerNextMatchSlot === 'P1' ? 'player1Id' : 'player2Id';
            await prisma.bracketMatch.update({
                where: { id: bm.winnerNextMatchId },
                data: {
                    [slotField]: winnerId
                }
            });
        }
    }
}

// ==================== GROUP MATCH - UPDATE SCORE ====================

export const updateGroupMatchScore = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { score1, score2, shuttle, time, sets, remark, forfeitTeam } = req.body;

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

        let calculatedWinnerId: number | null = null;
        let loserId: number | null = null;

        if (score1 !== undefined && score2 !== undefined) {
            if (forfeitTeam === "1") {
                calculatedWinnerId = match.player2Id;
                loserId = match.player1Id;
            } else if (forfeitTeam === "2") {
                calculatedWinnerId = match.player1Id;
                loserId = match.player2Id;
            } else {
                const s1 = Number(score1);
                const s2 = Number(score2);
                const setParts = (sets || "").split(/[,;\n\r]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                let s1Wins = 0, s2Wins = 0;
                setParts.forEach((part: string) => {
                    const matchPart = part.match(/(\d+)\s*[:\-]\s*(\d+)/);
                    if (matchPart) {
                        const val1 = parseInt(matchPart[1]);
                        const val2 = parseInt(matchPart[2]);
                        if (val1 > val2) s1Wins++;
                        else if (val2 > val1) s2Wins++;
                    }
                });
                if (s1Wins > s2Wins) {
                    calculatedWinnerId = match.player1Id;
                    loserId = match.player2Id;
                } else if (s2Wins > s1Wins) {
                    calculatedWinnerId = match.player2Id;
                    loserId = match.player1Id;
                } else {
                    if (s1 > s2) {
                        calculatedWinnerId = match.player1Id;
                        loserId = match.player2Id;
                    } else if (s2 > s1) {
                        calculatedWinnerId = match.player2Id;
                        loserId = match.player1Id;
                    }
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
                status: (score1 !== undefined && score2 !== undefined) ? 'FINISHED' : match.status,
                remark: remark !== undefined ? remark : match.remark,
                winnerId: calculatedWinnerId !== null ? calculatedWinnerId : undefined
            }
        });

        // Trigger cascade forfeit if remark is provided
        if (remark && loserId) {
            await applyCascadeForfeit(match.tournamentId, loserId, remark);
        }

        return res.status(200).json({ message: "GroupMatch updated", data: updated });
    } catch (error) {
        console.error("Update GroupMatch Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== BRACKET MATCH - UPDATE SCORE ====================

export const updateBracketMatchScore = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { score1, score2, shuttle, time, sets, player1Id, player2Id, remark, forfeitTeam } = req.body;

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
        let loserId: number | null = null;

        if (newScore1 !== null && newScore2 !== null) {
            status = 'FINISHED';
            const p1Id = player1Id !== undefined ? (player1Id === null ? null : Number(player1Id)) : match.player1Id;
            const p2Id = player2Id !== undefined ? (player2Id === null ? null : Number(player2Id)) : match.player2Id;

            if (forfeitTeam === "1") {
                winnerId = p2Id;
                loserId = p1Id;
            } else if (forfeitTeam === "2") {
                winnerId = p1Id;
                loserId = p2Id;
            } else {
                const [p1, p2] = getPoints(newScore1, newScore2, newSets || "");
                if (p1 > p2) {
                    winnerId = p1Id;
                    loserId = p2Id;
                } else if (p2 > p1) {
                    winnerId = p2Id;
                    loserId = p1Id;
                } else {
                    winnerId = null;
                }
            }
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
                remark: remark !== undefined ? remark : match.remark,
                player1Id: player1Id !== undefined ? (player1Id === null ? null : Number(player1Id)) : match.player1Id,
                player2Id: player2Id !== undefined ? (player2Id === null ? null : Number(player2Id)) : match.player2Id,
            }
        });

        // Trigger cascade forfeit if remark is provided
        if (remark && loserId) {
            await applyCascadeForfeit(match.tournamentId, loserId, remark);
        }

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

        // 🏆 Refresh Tournament Summary if it's a critical match (Semi-Final or Final)
        if (match.roundSequence >= 3) {
            refreshTournamentSummary(match.tournamentId).catch(err => {
                console.error("Async Summary Refresh Error:", err);
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
        const handType = handTypeStr ? mapHandType(handTypeStr) : null;
        const fetchAll = req.query.all === 'true';

        // Count group matches for this handType to offset bracket match numbers
        const activeGroups = await prisma.group.findMany({
            where: { tournamentId: tId },
            select: { id: true }
        });
        const activeGroupIds = activeGroups.map(g => g.id);
        const groupMatchCount = await prisma.groupMatch.count({
            where: {
                tournamentId: tId,
                groupId: { in: activeGroupIds },
                handType: handType || undefined
            }
        });

        // Find all forfeited register IDs in this tournament
        const forfeitedGroupMatches = await prisma.groupMatch.findMany({
            where: {
                tournamentId: tId,
                remark: { notIn: [null, "", " "] },
                winnerId: { not: null }
            },
            select: { player1Id: true, player2Id: true, winnerId: true }
        });
        const forfeitedBracketMatches = await prisma.bracketMatch.findMany({
            where: {
                tournamentId: tId,
                remark: { notIn: [null, "", " "] },
                winnerId: { not: null }
            },
            select: { player1Id: true, player2Id: true, winnerId: true }
        });

        const forfeitedRegisterIds = new Set<number>();
        for (const m of forfeitedGroupMatches) {
            const loserId = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
            if (loserId) forfeitedRegisterIds.add(loserId);
        }
        for (const m of forfeitedBracketMatches) {
            const loserId = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
            if (loserId) forfeitedRegisterIds.add(loserId);
        }
        const forfeitedRegIdsArr = Array.from(forfeitedRegisterIds);

        // 1. Check if matches exist (Filter by HandType if provided AND not fetching all)
        let whereClause: any = { tournamentId: tId };
        if (!fetchAll) {
            whereClause.handType = handType;
        }

        let existingMatches = await prisma.bracketMatch.findMany({
            where: whereClause,
            orderBy: [{ roundSequence: 'asc' }, { matchSequence: 'asc' }],
            include: { player1: true, player2: true, winner: true }
        });

        //  Safe BG Fallback: If viewing BG and nothing found, check for NULL entries (Legacy Data)
        if (existingMatches.length === 0 && handType === 'BG' && !fetchAll) {
            existingMatches = await prisma.bracketMatch.findMany({
                where: { tournamentId: tId, handType: null },
                orderBy: [{ roundSequence: 'asc' }, { matchSequence: 'asc' }],
                include: { player1: true, player2: true, winner: true }
            });
        }

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
                return res.status(200).json({ data: allMatches, groupMatchCount, forfeitedRegisterIds: forfeitedRegIdsArr });
            }

            return res.status(200).json({ data: existingMatches, groupMatchCount, forfeitedRegisterIds: forfeitedRegIdsArr });
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

        return res.status(201).json({ message: "Bracket initialized", data: allMatches, groupMatchCount, forfeitedRegisterIds: forfeitedRegIdsArr });

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

        // Pre-calculate Global Match Numbers for Group Matches
        const activeGroups = await prisma.group.findMany({
            where: { tournamentId: tId },
            select: { id: true }
        });
        const activeGroupIds = activeGroups.map(g => g.id);

        const allTournamentGroupMatches = await prisma.groupMatch.findMany({
            where: {
                tournamentId: tId,
                groupId: { in: activeGroupIds }
            },
            select: { id: true },
            orderBy: [{ scheduledTime: 'asc' }, { id: 'asc' }]
        });
        const allGroupMatchIds = allTournamentGroupMatches.map(m => m.id);

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
        const isSmallBracket = (tournament?.maxPlayers || 32) <= 16;

        const groupMatchCounts: Record<string, number> = {};
        for (const gm of groupMatches) {
            const gmHandType = gm.handType || gm.player1?.playType || "legacy";
            groupMatchCounts[gmHandType] = (groupMatchCounts[gmHandType] || 0) + 1;
        }

        // Process Group Matches
        for (const m of groupMatches) {
            const handType = m.handType ? (HAND_TYPE_DISPLAY[m.handType] || m.handType) : "-";
            let status = MATCH_STATUS_MAP[m.status] || m.status;

            if (m.status === 'PENDING' && m.scheduledTime) {
                const sTime = new Date(m.scheduledTime);
                if (sTime <= new Date()) {
                    status = MATCH_STATUS_MAP['RUNNING'];
                }
            }
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

            const globalMatchNumber = allGroupMatchIds.indexOf(m.id) + 1;
            const displayId = globalMatchNumber > 0 ? `${globalMatchNumber}` : `${m.id}`;

            results.push({
                id: m.id,
                displayId: displayId,
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

        const getBracketIndex = (r: number, s: number) => {
            if (r === 1) return s - 1; // 0-7
            if (r === 2) return 8 + (s - 1); // 8-11
            if (r === 3) return 12 + (s - 1); // 12-13
            if (r === 4) return 14; // 14
            return -1;
        };

        for (const m of bracketMatches) {
            // ซ่อนแมตช์ในรอบสายการแข่งขันที่ยังไม่ได้แข่ง (ผู้เล่นยังไม่ครบ) เว้นแต่จะแข่งเสร็จแล้ว (เช่น ชนะบาย)
            if ((!m.player1Id || !m.player2Id) && m.status !== 'FINISHED') {
                continue;
            }

            const handType = m.handType ? (HAND_TYPE_DISPLAY[m.handType] || m.handType) : "-";
            let status = MATCH_STATUS_MAP[m.status] || m.status;

            if (m.status === 'PENDING' && m.scheduledTime) {
                const sTime = new Date(m.scheduledTime);
                if (sTime <= new Date()) {
                    status = MATCH_STATUS_MAP['RUNNING'];
                }
            }
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

            const bIndex = getBracketIndex(m.roundSequence || 0, m.matchSequence || 0);

            // Map bracket handType exactly like group matches (use player fallback just in case)
            const bracketHandType = m.handType || m.player1?.playType || "legacy";
            const offset = groupMatchCounts[bracketHandType] || 0;
            const sizeOffset = isSmallBracket ? -8 : 0;

            const bracketMatchNumber = bIndex !== -1 ? bIndex + 1 + offset + sizeOffset : m.id;

            const displayId = `${bracketMatchNumber}`;

            results.push({
                id: m.id,
                displayId: displayId,
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
