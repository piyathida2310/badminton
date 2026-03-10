import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // ดึง registrations ที่ไม่มี player1Birthday
    const registrations = await prisma.register.findMany({
        where: {
            player1Birthday: null,
        },
        select: {
            id: true,
            player1Name: true,
            player2Name: true,
        },
    });

    console.log(`Found ${registrations.length} registrations without birthday`);

    for (const reg of registrations) {
        // สุ่มอายุ 18-45 ปี
        const randomAge1 = Math.floor(Math.random() * 28) + 18;
        const birthday1 = new Date();
        birthday1.setFullYear(birthday1.getFullYear() - randomAge1);
        birthday1.setMonth(Math.floor(Math.random() * 12));
        birthday1.setDate(Math.floor(Math.random() * 28) + 1);

        const updateData: any = {
            player1Birthday: birthday1,
        };

        // ถ้ามีผู้เล่นคนที่ 2 ให้สุ่ม birthday ด้วย
        if (reg.player2Name) {
            const randomAge2 = Math.floor(Math.random() * 28) + 18;
            const birthday2 = new Date();
            birthday2.setFullYear(birthday2.getFullYear() - randomAge2);
            birthday2.setMonth(Math.floor(Math.random() * 12));
            birthday2.setDate(Math.floor(Math.random() * 28) + 1);
            updateData.player2Birthday = birthday2;
        }

        await prisma.register.update({
            where: { id: reg.id },
            data: updateData,
        });

        console.log(`Updated Reg #${reg.id} (${reg.player1Name}) → Age ~${randomAge1}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
