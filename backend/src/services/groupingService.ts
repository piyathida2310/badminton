
import { prisma } from "./prismaClient";
import { HandType } from "@prisma/client"; // Import Enum
import { groupPlayers, Player } from "./openai";
import { getGroupColor, getGroupHeaderColor } from "../utils/groupUtils";

export const organizeTournamentGroups = async (
    tournamentId: number,
    playType: string,
    detail: string
) => {
    console.log("\n" + "#".repeat(60));
    console.log("[GROUPING SERVICE] START");
    console.log("#".repeat(60));
    console.log(`   Tournament ID: ${tournamentId}`);
    console.log(`   PlayType: ${playType}`);
    console.log(`   Detail: "${detail}"`);

    // Fix: Map display string (P+, P-) to Prisma Enum Key (P_PLUS, P_MINUS)
    let prismaHandType: HandType;
    if (playType === "P+") {
        prismaHandType = HandType.P_PLUS;
    } else if (playType === "P-") {
        prismaHandType = HandType.P_MINUS;
    } else {
        prismaHandType = playType as HandType;
    }
    console.log(`   [MAPPING] Input "${playType}" => Enum "${prismaHandType}"`);
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
    console.log(`\n[REGISTRATIONS] Total: ${tournament.registrations.length}`);
    const targetRegistrations = tournament.registrations.filter(
        (r) => r.playType === prismaHandType
    );
    console.log(`   Filtered for ${playType}: ${targetRegistrations.length} registrations`);
    targetRegistrations.forEach((r) => {
        console.log(`   [Reg ID:${r.id}] ${r.player1Name}${r.player2Name ? ' & ' + r.player2Name : ''} | Gender: ${r.player1Gender}${r.player2Gender ? '/' + r.player2Gender : ''} | Score: ${r.score}`);
    });

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
    console.log(`\n[NUM GROUPS] maxPlayers=${tournament.maxPlayers} => numGroups=${numGroups}`);

    // 5. Run AI
    console.log("\n[CALLING AI] Sending players to AI for grouping...");
    const groupedIds = await groupPlayers(players, detail, numGroups);
    console.log(`[AI RETURNED] ${groupedIds.length} groups from AI`);

    // 6. Map to groupsMap & Failsafe
    console.log("\n[MAPPING] Mapping AI result to groups...");
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
            console.log(`   Extra group ${index} merged into last group`);
            groupsMap[numGroups - 1].players.push(...ids);
        }
    });

    console.log("\n[GROUPS MAP] After mapping:");
    groupsMap.forEach((g) => {
        console.log(`   Group ${g.name}: [${g.players.join(", ")}] (${g.players.length} players)`);
    });

    // Failsafe: Check for missing players
    const allInputIds = new Set(players.map((p) => p.id));
    const currentGroupedIds = new Set(groupsMap.flatMap((g) => g.players));
    const missingIds = players
        .filter((p) => !currentGroupedIds.has(p.id))
        .map((p) => p.id);

    if (missingIds.length > 0) {
        console.log(`\n[SERVICE FAILSAFE] ${missingIds.length} missing players: [${missingIds.join(", ")}]`);
    } else {
        console.log("\n[SERVICE FAILSAFE] No missing players!");
    }

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
        console.log(`   Adding ID ${id} to Group ${groupsMap[targetGroupIndex].name} (smallest group)`);
        groupsMap[targetGroupIndex].players.push(id);
    });

    // Filter invalid IDs
    groupsMap.forEach((g) => {
        const before = g.players.length;
        g.players = g.players.filter((id) => allInputIds.has(id));
        if (g.players.length < before) {
            console.log(`   Group ${g.name}: removed ${before - g.players.length} invalid IDs`);
        }
    });

    // 7. Cleanup OLD Groups for this PlayType ONLY
    console.log("\n[DB CLEANUP] Deleting old groups for this playType...");
    const groupsToDelete = await prisma.group.findMany({
        where: {
            tournamentId,
            registers: {
                some: { playType: prismaHandType },
            },
        },
        select: { id: true },
    });

    const groupIdsToDelete = groupsToDelete.map((g) => g.id);
    console.log(`   Found ${groupIdsToDelete.length} old groups to delete: [${groupIdsToDelete.join(", ")}]`);

    if (groupIdsToDelete.length > 0) {
        await prisma.register.updateMany({
            where: { groupId: { in: groupIdsToDelete } },
            data: { groupId: null },
        });

        await prisma.groupMatch.deleteMany({
            where: { groupId: { in: groupIdsToDelete } },
        });

        await prisma.group.deleteMany({
            where: { id: { in: groupIdsToDelete } },
        });
        console.log("   Old groups cleaned up!");
    }

    // 8. Create NEW Groups into DB
    console.log("\n[DB CREATE] Creating new groups in database...");
    for (const groupData of groupsMap) {
        const groupName = `${playType} Group ${groupData.name}`;

        const newGroup = await prisma.group.create({
            data: {
                name: groupName,
                tournamentId: tournamentId,
            },
        });
        console.log(`   Created "${groupName}" (DB ID: ${newGroup.id}) with ${groupData.players.length} players: [${groupData.players.join(", ")}]`);

        if (groupData.players.length > 0) {
            await prisma.register.updateMany({
                where: { id: { in: groupData.players } },
                data: { groupId: newGroup.id },
            });

            const groupPlayers = groupData.players;
            let matchCount = 0;

            // Get Current Max Match Sequence
            const lastMatch = await prisma.groupMatch.findFirst({
                where: { tournamentId },
                orderBy: { matchSequence: 'desc' },
                select: { matchSequence: true }
            });
            let currentSeq = (lastMatch?.matchSequence || 0) + 1;

            // Round Robin Algorithm
            let rotation = [...groupPlayers];
            if (rotation.length % 2 !== 0) {
                rotation.push(-1); // Dummy player for odd number of teams
            }

            const numTeams = rotation.length;
            const numRounds = numTeams - 1;
            const half = numTeams / 2;

            for (let r = 0; r < numRounds; r++) {
                const roundName = `R${r + 1}`;

                for (let i = 0; i < half; i++) {
                    const p1 = rotation[i];
                    const p2 = rotation[numTeams - 1 - i];

                    if (p1 !== -1 && p2 !== -1) {
                        await prisma.groupMatch.create({
                            data: {
                                tournamentId,
                                groupId: newGroup.id,
                                player1Id: p1,
                                player2Id: p2,
                                handType: prismaHandType,
                                status: "PENDING",
                                scheduledTime: tournament.startDate,
                                roundName: roundName,
                                matchSequence: currentSeq++, // ✅ Save Sequence
                            },
                        });
                        matchCount++;
                    }
                }

                // Rotate teams (keep first fixed)
                const fixed = rotation[0];
                const moving = rotation.slice(1);
                const last = moving.pop();
                if (last !== undefined) moving.unshift(last);
                rotation = [fixed, ...moving];
            }
            console.log(`      → Created ${matchCount} matches for this group`);
        }
    }

    // 7. Success - Fetch ALL groups to return
    const updatedGroups = await prisma.group.findMany({
        where: { tournamentId },
        include: {
            registers: {
                orderBy: { score: "desc" },
            },
        },
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

    console.log("\n" + "#".repeat(60));
    console.log("[GROUPING SERVICE] FINAL RESULT");
    console.log("#".repeat(60));
    console.log(`Total groups returned: ${enrichedGroups.length}`);
    enrichedGroups.forEach((g) => {
        console.log(`   ${g.name} (ID:${g.id}): ${g.teams.length} teams => ${JSON.stringify(g.teams)}`);
    });
    console.log("#".repeat(60) + "\n");

    return enrichedGroups;
};
