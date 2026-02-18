
import { Request, Response } from "express";
import { prisma } from "../services/prismaClient";

/**
 * Recalculates and updates the summary for a specific tournament.
 * Identifies 1st, 2nd, and both 3rd places.
 */
export const refreshTournamentSummary = async (tournamentId: number) => {
    try {
        // 1. Fetch all bracket matches for this tournament
        const matches = await prisma.bracketMatch.findMany({
            where: { tournamentId },
            include: {
                player1: true,
                player2: true,
                winner: true,
            }
        });

        if (matches.length === 0) return;

        // Group matches by rank (handType)
        const rankGroups = new Map<string, typeof matches>();
        matches.forEach(m => {
            const rank = m.handType || "UNKNOWN";
            if (!rankGroups.has(rank)) rankGroups.set(rank, []);
            rankGroups.get(rank)!.push(m);
        });

        const newSummaries: any[] = [];

        for (const [rank, rankMatches] of rankGroups.entries()) {
            // 🏆 1. UPPER BRACKET (Position 1, 2, 3)
            const upperMatches = rankMatches.filter(m => m.stage === 'UPPER' || m.stage === 'GRAND_FINAL');
            if (upperMatches.length > 0) {
                const maxRound = Math.max(...upperMatches.map(m => m.roundSequence || 0));

                // Final
                const finalMatch =
                    upperMatches.find(m => m.stage === 'GRAND_FINAL') ||
                    upperMatches.find(m => m.roundSequence === maxRound && m.matchSequence === 1);

                if (finalMatch && finalMatch.status === 'FINISHED' && finalMatch.winnerId) {
                    const winnerId = finalMatch.winnerId;
                    const loserId = (winnerId === finalMatch.player1Id) ? finalMatch.player2Id : finalMatch.player1Id;

                    newSummaries.push({ tournamentId, registerId: winnerId, position: 1, shuttleUsed: finalMatch.shuttle || 0 });
                    if (loserId) newSummaries.push({ tournamentId, registerId: loserId, position: 2, shuttleUsed: finalMatch.shuttle || 0 });
                }

                // Semi-Finals
                const semiRound = Math.max(1, maxRound - 1);
                const semiMatches = upperMatches.filter(m => m.roundSequence === semiRound);
                semiMatches.forEach(sm => {
                    if (sm.status === 'FINISHED' && sm.winnerId) {
                        const loserId = (sm.winnerId === sm.player1Id) ? sm.player2Id : sm.player1Id;
                        if (loserId) newSummaries.push({ tournamentId, registerId: loserId, position: 3, shuttleUsed: sm.shuttle || 0 });
                    }
                });
            }

            // 🏆 2. LOWER BRACKET (Position 4, 5, 6)
            const lowerMatches = rankMatches.filter(m => m.stage === 'LOWER');
            if (lowerMatches.length > 0) {
                const maxLowerRound = Math.max(...lowerMatches.map(m => m.roundSequence || 0));

                // Lower Final
                const lowerFinalMatch = lowerMatches.find(m => m.roundSequence === maxLowerRound && m.matchSequence === 1);

                if (lowerFinalMatch && lowerFinalMatch.status === 'FINISHED' && lowerFinalMatch.winnerId) {
                    const winnerId = lowerFinalMatch.winnerId;
                    const loserId = (winnerId === lowerFinalMatch.player1Id) ? lowerFinalMatch.player2Id : lowerFinalMatch.player1Id;

                    newSummaries.push({ tournamentId, registerId: winnerId, position: 4, shuttleUsed: lowerFinalMatch.shuttle || 0 });
                    if (loserId) newSummaries.push({ tournamentId, registerId: loserId, position: 5, shuttleUsed: lowerFinalMatch.shuttle || 0 });
                }

                // Lower Semi-Finals
                const semiLowerRound = Math.max(1, maxLowerRound - 1);
                const semiLowerMatches = lowerMatches.filter(m => m.roundSequence === semiLowerRound);
                semiLowerMatches.forEach(slm => {
                    if (slm.status === 'FINISHED' && slm.winnerId) {
                        const loserId = (slm.winnerId === slm.player1Id) ? slm.player2Id : slm.player1Id;
                        if (loserId) newSummaries.push({ tournamentId, registerId: loserId, position: 6, shuttleUsed: slm.shuttle || 0 });
                    }
                });
            }
        }

        // 2. Clear old summaries and insert new ones
        // We use a transaction to ensure atomicity
        await prisma.$transaction([
            prisma.summary.deleteMany({
                where: { tournamentId }
            }),
            prisma.summary.createMany({
                data: newSummaries
            })
        ]);

        console.log(`[Summary] Refreshed summary for tournament ${tournamentId}. Entries: ${newSummaries.length}`);
    } catch (error) {
        console.error(`[Summary] Error refreshing summary for tournament ${tournamentId}:`, error);
    }
};

/**
 * API Endpoint to fetch the summary for a tournament.
 */
export const getTournamentSummary = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const tId = Number(tournamentId);

        if (isNaN(tId)) {
            return res.status(400).json({ message: "Invalid tournamentId" });
        }

        // 🏆 Automatically refresh summary before returning it
        // This ensures the data is always up-to-date when the page is loaded
        await refreshTournamentSummary(tId);

        const summaries = await prisma.summary.findMany({
            where: { tournamentId: tId },
            include: {
                register: true
            },
            orderBy: [
                { position: 'asc' },
                { register: { playType: 'asc' } } // Group by rank/handType
            ]
        });

        return res.status(200).json({
            message: "Summary fetched successfully",
            data: summaries
        });
    } catch (error) {
        console.error("Get Tournament Summary Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * API Endpoint to manually trigger a summary refresh.
 */
export const refreshTournamentSummaryEndpoint = async (req: Request, res: Response) => {
    try {
        const { tournamentId } = req.params;
        const tId = Number(tournamentId);

        if (isNaN(tId)) {
            return res.status(400).json({ message: "Invalid tournamentId" });
        }

        await refreshTournamentSummary(tId);

        return res.status(200).json({
            message: "Summary refreshed successfully"
        });
    } catch (error) {
        console.error("Refresh Tournament Summary Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
