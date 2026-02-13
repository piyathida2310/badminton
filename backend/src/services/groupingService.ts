
import { prisma } from "./prismaClient";
import { HandType } from "@prisma/client"; // Import Enum
import { groupPlayers, Player } from "./openai";
import { getGroupColor, getGroupHeaderColor } from "../utils/groupUtils";

export const organizeTournamentGroups = async (
    tournamentId: number,
    playType: string,
    detail: string
) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            registrations: {
                where: { status: { not: "FAILED" } },
                select: {
                    id: true,
                    score: true,
                    comment: true,
                    userId: true,
                    playType: true,
                    player1Name: true,
                    player2Name: true,
                    teamName: true,
                    player1Gender: true,
                    player2Gender: true,
                },
            },
        },
    });

    if (!tournament) {
        throw new Error("Tournament not found");
    }

    // 1. Filter specific playType
    const targetRegistrations = tournament.registrations.filter(
        (r) => r.playType === (playType as HandType)
    );

    // 3. Prepare AI players
    const players: Player[] = targetRegistrations.map((reg) => ({
        id: reg.id,
        score: reg.score ?? 0,
        comment: reg.comment ?? "",
        gender:
            tournament.playType === "SINGLE"
                ? reg.player1Gender ?? "Unknown"
                : `${reg.player1Gender ?? "?"}/${reg.player2Gender ?? "?"}`,
    }));

    // 4. Calculate numGroups
    let numGroups = 4;
    if (tournament.maxPlayers > 24) {
        numGroups = 8;
    } else {
        numGroups = Math.max(1, Math.floor(tournament.maxPlayers / 4));
    }

    // 5. Run AI
    const groupedIds = await groupPlayers(players, detail, numGroups);

    // 6. Map to groupsMap & Failsafe
    const groupsMap: { name: string; players: number[] }[] = Array.from(
        { length: numGroups },
        (_, i) => ({
            name: String.fromCharCode(65 + i), // 'A', 'B', 'C'...
            players: [],
        })
    );

    groupedIds.forEach((ids, index) => {
        if (index < numGroups) {
            groupsMap[index].players = ids;
        } else {
            groupsMap[numGroups - 1].players.push(...ids);
        }
    });

    // Failsafe: Check for missing players
    const allInputIds = new Set(players.map((p) => p.id));
    const currentGroupedIds = new Set(groupsMap.flatMap((g) => g.players));
    const missingIds = players
        .filter((p) => !currentGroupedIds.has(p.id))
        .map((p) => p.id);

    missingIds.forEach((id) => {
        let targetGroupIndex = 0;
        let minCount = Infinity;

        for (let i = 0; i < numGroups; i++) {
            const count = groupsMap[i].players.length;
            if (count < minCount) {
                minCount = count;
                targetGroupIndex = i;
            }
        }
        groupsMap[targetGroupIndex].players.push(id);
    });

    // Filter invalid IDs
    groupsMap.forEach((g) => {
        g.players = g.players.filter((id) => allInputIds.has(id));
    });

    // 7. Cleanup OLD Groups for this PlayType ONLY
    const groupsToDelete = await prisma.group.findMany({
        where: {
            tournamentId,
            registers: {
                some: { playType: playType as HandType },
            },
        },
        select: { id: true },
    });

    const groupIdsToDelete = groupsToDelete.map((g) => g.id);

    if (groupIdsToDelete.length > 0) {
        await prisma.register.updateMany({
            where: { groupId: { in: groupIdsToDelete } },
            data: { groupId: null },
        });

        await prisma.match.deleteMany({
            where: { groupId: { in: groupIdsToDelete } },
        });

        await prisma.group.deleteMany({
            where: { id: { in: groupIdsToDelete } },
        });
    }

    // 8. Create NEW Groups into DB
    for (const groupData of groupsMap) {
        const groupName = `${playType} Group ${groupData.name}`;

        const newGroup = await prisma.group.create({
            data: {
                name: groupName,
                tournamentId: tournamentId,
            },
        });

        if (groupData.players.length > 0) {
            await prisma.register.updateMany({
                where: { id: { in: groupData.players } },
                data: { groupId: newGroup.id },
            });

            const groupPlayers = groupData.players;
            for (let i = 0; i < groupPlayers.length; i++) {
                for (let j = i + 1; j < groupPlayers.length; j++) {
                    await prisma.match.create({
                        data: {
                            tournamentId,
                            groupId: newGroup.id,
                            player1Id: groupPlayers[i],
                            player2Id: groupPlayers[j],
                            handType: playType as HandType,
                            status: "PENDING",
                            scheduledTime: tournament.startDate,
                        },
                    });
                }
            }
        }
    }

    // 7. Success - Fetch ALL groups to return
    const updatedGroups = await prisma.group.findMany({
        where: { tournamentId },
        include: { registers: true },
        orderBy: { name: "asc" },
    });

    const enrichedGroups = updatedGroups.map((group) => {
        const teamNames = group.registers.map((reg) => {
            if (reg.teamName) return reg.teamName;
            if (reg.player2Name) return [reg.player1Name, reg.player2Name];
            return reg.player1Name;
        });

        const groupLetter = group.name.split(" ").pop() || "A";

        return {
            id: group.id,
            name: group.name,
            handType: group.registers[0]?.playType || null,
            color: getGroupColor(groupLetter),
            header: getGroupHeaderColor(groupLetter),
            teams: teamNames,
            summary: "",
        };
    });

    return enrichedGroups;
};
