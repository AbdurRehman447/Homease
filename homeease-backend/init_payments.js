import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const methods = [
        { name: 'JazzCash', type: 'wallet', description: 'Instant mobile wallet payment' },
        { name: 'Easypaisa', type: 'wallet', description: 'Fast mobile wallet transfer' },
        { name: 'Bank Transfer', type: 'bank', description: 'Manual verification (24-48 hours)', metadata: { accountName: 'Homease Pvt Ltd', accountNumber: '0123456789', bankName: 'Alfalah Bank', branchCode: '0451' } },
        { name: 'COD', type: 'offline', description: 'Pay cash after service completion' }
    ];

    for (const m of methods) {
        await prisma.paymentMethod.upsert({
            where: { name: m.name },
            update: m,
            create: m
        });
    }
    console.log('✅ Payment methods initialized');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
