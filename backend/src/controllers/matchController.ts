
import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";

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

        return res.status(200).json({
            rank: rankData,
            matches: matchData
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

export const updateBracketMatchScore = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { score1, score2, shuttle, time, sets } = req.body;

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

        const updated = await prisma.bracketMatch.update({
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

        return res.status(200).json({ message: "BracketMatch updated", data: updated });
    } catch (error) {
        console.error("Update BracketMatch Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
