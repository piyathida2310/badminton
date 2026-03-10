import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clerkId = 'user_38SPkwB7KDnLVUEZUMb3w4atDem';
    const tournamentId = 2; // user requested tournament ID 2

    // 1. Get the user
    const user = await prisma.user.findFirst({
        where: { clerkId: clerkId },
    });

    if (!user) {
        console.error(`User with clerkId ${clerkId} not found`);
        process.exit(1);
    }

    // 2. Get the tournament
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
    });

    if (!tournament) {
        console.error(`Tournament with id ${tournamentId} not found`);
        process.exit(1);
    }

    // 3. Register 32 teams
    console.log(`Registering 32 teams for Tournament ${tournament.name} by User ${user.userName || user.firstName}...`);
    const genders = ['MALE', 'FEMALE'];

    let count = 0;
    for (let i = 1; i <= 32; i++) {
        const isDouble = tournament.playType === 'DOUBLE';
        const numStr = i.toString().padStart(2, '0');

        // Calculate an alternating gender and handType for variety
        const gIndex = i % 2;

        const teamLetter = String.fromCharCode(97 + ((i - 1) % 26)); // 'a' is 97

        await prisma.register.create({
            data: {
                userId: user.id,
                tournamentId: tournament.id,
                teamName: teamLetter,
                playType: 'P_PLUS', 
                phoneNumber: `08000000${numStr}`,
                status: 'PASSED', // Set to PASSED so they can be grouped immediately if needed
                score: Math.floor(Math.random() * 10) + 1, // mock score 1-10
                managerName: 'มินจี',
                comment: 'ดี',
                player1Name: `Test Player One ${numStr}`,
                player1Gender: genders[gIndex] as any,
                player2Name: isDouble ? `Test Player Two ${numStr}` : null,
                player2Gender: isDouble ? genders[gIndex] as any : null,
            }
        });
        count++;
    }

    console.log(`Successfully registered ${count} teams.`);
}

main()
    .catch(e => {
        console.error("Error running script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
