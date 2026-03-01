import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const methods = await prisma.paymentMethod.findMany();
        console.log('Payment Methods in DB:', JSON.stringify(methods, null, 2));
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
