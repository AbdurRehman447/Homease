import prisma from '../config/database.js';

export const processMockPayment = async (bookingId, methodId, details) => {
    // 1. Fetch payment method details
    const method = await prisma.paymentMethod.findUnique({
        where: { id: methodId }
    });

    if (!method) throw new Error('Invalid payment method');

    // 2. Fetch or create the Payment record for this booking
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) throw new Error('Booking not found');

    // Create or update payment
    const payment = await prisma.payment.upsert({
        where: { bookingId },
        update: {
            methodId,
            amount: booking.totalAmount,
            status: method.type === 'offline' ? 'PENDING' : 'PROCESSING'
        },
        create: {
            bookingId,
            methodId,
            amount: booking.totalAmount,
            platformFee: booking.platformFee,
            providerAmount: booking.price,
            status: method.type === 'offline' ? 'PENDING' : 'PROCESSING'
        }
    });

    // 3. Simulated Response Logic
    let gatewayResponse = { success: true, message: 'Simulated Gateway Response' };
    let finalStatus = 'COMPLETED';

    // Strategy A: Wallets (JazzCash/Easypaisa)
    if (method.type === 'wallet') {
        // Simulate 80% success rate for natural feeling
        const isSuccess = Math.random() > 0.15;
        if (!isSuccess) {
            gatewayResponse = { success: false, error: 'Low Balance or PIN Timeout' };
            finalStatus = 'FAILED';
        }
    }
    // Strategy B: Bank Transfer (Manual)
    else if (method.type === 'bank') {
        gatewayResponse = { success: true, message: 'Reference submitted for verification' };
        finalStatus = 'ON_HOLD'; // Admin must verify reference
    }
    // Strategy C: COD
    else {
        gatewayResponse = { success: true, message: 'Pay cash after service' };
        finalStatus = 'PENDING';
    }

    // 4. Log the Transaction for Audit Trail (FYP Requirement)
    await prisma.transaction.create({
        data: {
            paymentId: payment.id,
            amount: booking.totalAmount,
            status: finalStatus,
            reference: details.reference || details.phone || 'N/A',
            gatewayResponse
        }
    });

    // 5. Update final Payment status
    const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: finalStatus,
            transactionRef: details.reference || details.phone || undefined,
            paidAt: finalStatus === 'COMPLETED' ? new Date() : null
        }
    });

    return {
        success: finalStatus !== 'FAILED',
        status: finalStatus,
        message: gatewayResponse.message || gatewayResponse.error,
        payment: updatedPayment
    };
};

export default {
    processMockPayment
};
