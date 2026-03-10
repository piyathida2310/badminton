import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clerkId = 'user_38SPkwB7KDnLVUEZUMb3w4atDem';
    const tournamentId = 3;

    // 1. หา user
    const user = await prisma.user.findFirst({
        where: { clerkId: clerkId },
    });

    if (!user) {
        console.error(`User with clerkId ${clerkId} not found`);
        process.exit(1);
    }

    // 2. หา tournament
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
    });

    if (!tournament) {
        console.error(`Tournament with id ${tournamentId} not found`);
        process.exit(1);
    }

    console.log(`Registering 16 double teams for Tournament "${tournament.name}" by User ${user.userName || user.firstName}...`);

    // 16 ทีม ชื่อ a-p  | rank S | comment ดี
    // score 10 → ทีม a, b, c, d    (4 ทีม)
    // score 5  → ทีม e, f, g, h    (4 ทีม)
    // score 7  → ทีม i, j, k, l    (4 ทีม)
    // score 8  → ทีม m, n, o, p    (4 ทีม)

    const teams = [
        { teamName: 'a', score: 10 },
        { teamName: 'b', score: 10 },
        { teamName: 'c', score: 10 },
        { teamName: 'd', score: 10 },
        { teamName: 'e', score: 5 },
        { teamName: 'f', score: 5 },
        { teamName: 'g', score: 5 },
        { teamName: 'h', score: 5 },
        { teamName: 'i', score: 7 },
        { teamName: 'j', score: 7 },
        { teamName: 'k', score: 7 },
        { teamName: 'l', score: 7 },
        { teamName: 'm', score: 8 },
        { teamName: 'n', score: 8 },
        { teamName: 'o', score: 8 },
        { teamName: 'p', score: 8 },
    ];

    const genders: ['MALE', 'FEMALE'] = ['MALE', 'FEMALE'];

    let count = 0;
    for (const team of teams) {
        const phone1 = `08${String(count).padStart(8, '0')}`;
        const phone2 = `09${String(count).padStart(8, '0')}`;

        await prisma.register.create({
            data: {
                userId: user.id,
                tournamentId: tournament.id,
                teamName: team.teamName,
                playType: 'S',            // Rank S
                phoneNumber: phone1,
                status: 'PASSED',
                score: team.score,
                comment: 'ดี',
                player1Name: `${team.teamName} Player 1`,
                player1Gender: 'MALE',
                player1Birthday: new Date('2000-01-01'),
                player2Name: `${team.teamName} Player 2`,
                player2Gender: 'FEMALE',
                player2Birthday: new Date('2001-01-01'),
                player2Phone: phone2,
            }
        });

        count++;
        console.log(`  ✔ [${count}/16] ทีม "${team.teamName}"  score: ${team.score}`);
    }

    console.log(`\n✅ ลงทะเบียนสำเร็จ ${count} ทีม (แบบคู่) สำหรับ tournament ${tournamentId}`);
}

main()
    .catch(e => {
        console.error('Error running script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
