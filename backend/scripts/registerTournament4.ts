import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clerkId = 'user_38SPkwB7KDnLVUEZUMb3w4atDem';
    const tournamentId = 4;

    const user = await prisma.user.findFirst({
        where: { clerkId: clerkId },
    });

    if (!user) {
        console.error(`User with clerkId ${clerkId} not found`);
        process.exit(1);
    }

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
    });

    if (!tournament) {
        console.error(`Tournament with id ${tournamentId} not found`);
        process.exit(1);
    }

    const isDouble = tournament.playType === 'DOUBLE';
    console.log(`Registering 16 teams for Tournament "${tournament.name}" (${tournament.playType}) by User ${user.userName || user.firstName}...`);

    const thaiNames = [
        'สมชาย', 'สมหญิง', 'วิชัย', 'วิมล', 'ประเสริฐ', 'ประภา',
        'ธนากร', 'ธนิดา', 'กิตติ', 'กัญญา', 'อนุชา', 'อนุสรา',
        'ภูมิ', 'ภัทรา', 'ชนะ', 'ชนิดา',
    ];

    const thaiNames2 = [
        'พิชัย', 'พิมพ์', 'เกรียงศักดิ์', 'เกศริน', 'นพดล', 'นภาพร',
        'สุรชัย', 'สุรีย์', 'ไกรศร', 'ศิริพร', 'อภิชาต', 'อภิญญา',
        'วรพล', 'วรรณี', 'ศักดิ์ชัย', 'ศิริรัตน์',
    ];

    type GenderPair = { g1: 'MALE' | 'FEMALE'; g2: 'MALE' | 'FEMALE' };
    const genderPairs: GenderPair[] = [
        // 4 ทีม Male/Male
        { g1: 'MALE', g2: 'MALE' },
        { g1: 'MALE', g2: 'MALE' },
        { g1: 'MALE', g2: 'MALE' },
        { g1: 'MALE', g2: 'MALE' },
        // 4 ทีม Female/Female
        { g1: 'FEMALE', g2: 'FEMALE' },
        { g1: 'FEMALE', g2: 'FEMALE' },
        { g1: 'FEMALE', g2: 'FEMALE' },
        { g1: 'FEMALE', g2: 'FEMALE' },
        // 8 ทีม Male/Female
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
        { g1: 'MALE', g2: 'FEMALE' },
    ];

    const scores = [10, 9, 8, 7, 6, 5, 4, 3, 10, 9, 8, 7, 6, 5, 4, 3];

    let count = 0;
    for (let i = 0; i < 16; i++) {
        const numStr = (i + 1).toString().padStart(2, '0');
        const genderPair = genderPairs[i];
        const score = scores[i];

        const g1Label = genderPair.g1 === 'MALE' ? 'M' : 'F';
        const g2Label = genderPair.g2 === 'MALE' ? 'M' : 'F';
        const teamName = isDouble
            ? `Team${numStr}_${g1Label}${g2Label}_S${score}`
            : `Team${numStr}_${g1Label}_S${score}`;

        const phone1 = `08${String(i).padStart(8, '0')}`;
        const phone2 = `09${String(i).padStart(8, '0')}`;

        const age1 = Math.floor(Math.random() * 23) + 18;
        const age2 = Math.floor(Math.random() * 23) + 18;
        const bday1 = new Date(2026 - age1, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const bday2 = new Date(2026 - age2, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

        const name1 = thaiNames[i];
        const name2 = thaiNames2[i];

        await prisma.register.create({
            data: {
                userId: user.id,
                tournamentId: tournament.id,
                teamName: teamName,
                playType: 'S',
                phoneNumber: phone1,
                status: 'PASSED',
                score: score,
                comment: 'ดี',
                managerName: `ผจก.${name1}`,
                player1Name: `${name1} ${numStr}`,
                player1Gender: genderPair.g1,
                player1Birthday: bday1,
                player2Name: isDouble ? `${name2} ${numStr}` : null,
                player2Gender: isDouble ? genderPair.g2 : null,
                player2Birthday: isDouble ? bday2 : null,
                player2Phone: isDouble ? phone2 : null,
            }
        });

        count++;
        console.log(`  ✔ [${count}/16] "${teamName}" | P1:${name1}(${genderPair.g1},${age1}ปี) ${isDouble ? `P2:${name2}(${genderPair.g2},${age2}ปี)` : ''} | Score:${score}`);
    }

    console.log(`\n✅ ลงทะเบียนสำเร็จ ${count} ทีม สำหรับ tournament ${tournamentId}`);
}

main()
    .catch(e => {
        console.error('Error running script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
