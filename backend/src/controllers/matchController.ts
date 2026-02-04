
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
        // Extract strictly the letter after "Group " (e.g. "BG Group A" -> "A")
        const groupMatch = groupName.match(/Group\s+(\w+)/i);
        const groupLetter = groupMatch ? groupMatch[1] : groupName.replace("Group ", "").trim();

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
                t.code, // Col 0: Code (Displayed in Gray Box)
                t.code, // Col 1: Code (Backup)
                t.name, // Col 2: Name
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

        // Note: Removed the overwriting of row[0] to preserve Team Code display.

        // Re-order matches to ensure valid Round Robin (no team plays twice in same round)
        const totalTeams = group.registers.length;
        const matchesPerRound = totalTeams === 3 ? 1 : Math.floor(totalTeams / 2); // 3 teams->1 match/round (bye), 4->2, 5->2, etc.

        const validPlayerIds = new Set(teamStats.keys());
        // Filter matches to ensure only players currently in this group are shown
        // This removes orphans where a player might have been moved to another group but the match remains
        let pendingMatches = group.matches.filter(m =>
            m.player1Id && validPlayerIds.has(m.player1Id) &&
            m.player2Id && validPlayerIds.has(m.player2Id)
        );
        const organizedMatches = [];

        // Track Round Number dynamically
        let roundCounter = 0;
        const matchRoundMap = new Map<number, string>();

        // Calculate Max Rounds for Single Round Robin to force cycle if matches exceed standard
        // 3 Teams -> 3 Rounds, 4 Teams -> 3 Rounds
        const maxRounds = totalTeams > 0 ? (totalTeams % 2 === 0 ? totalTeams - 1 : totalTeams) : 1;

        while (pendingMatches.length > 0) {
            roundCounter++;
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

            // Assign Round Name to matches in this batch (Cycle if > maxRounds)
            const displayRoundNum = ((roundCounter - 1) % maxRounds) + 1;
            currentRoundMatches.forEach(m => {
                matchRoundMap.set(m.id, `R${displayRoundNum}`);
            });

            // Remove found matches from pending
            pendingMatches = pendingMatches.filter(pm => !currentRoundMatches.includes(pm));

            // Add to final list
            organizedMatches.push(...currentRoundMatches);
        }

        // 3. Format Matches
        // Fetch active groups first to ignore matches from deleted groups (orphan matches)
        const activeGroups = await prisma.group.findMany({
            where: { tournamentId: tId },
            select: { id: true }
        });
        const activeGroupIds = activeGroups.map(g => g.id);

        // Fetch all match IDs from ACTIVE groups to determine global match sequence
        const allTournamentMatches = await prisma.match.findMany({
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

            // Use dynamically assigned Round Name
            const roundName = matchRoundMap.get(m.id) || "-";

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
            // Global Match Number (Sequence in Tournament)
            const globalMatchNumber = allMatchIds.indexOf(m.id) + 1;
            const matchDisplay = globalMatchNumber > 0 ? globalMatchNumber.toString() : "-";

            // Helper to get Code/Name
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

            const [p1, p2] = getPoints(s1, s2);
            // Index 7 (New Set Column Index): Use detailed setScores if available, else standard S1:S2
            const setStr = setScores ? setScores : ((s1 !== null && s2 !== null) ? `${s1} : ${s2}` : " : ");

            return [
                time,          // 0
                roundName,     // 1
                matchDisplay, // 2: Seq Number (Global)
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
