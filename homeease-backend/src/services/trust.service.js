import prisma from '../config/database.js';

/**
 * Trust Optimization Engine
 * Calculates a weighted performance score for service providers
 */
export const calculateTrustScore = async (providerId) => {
    try {
        const provider = await prisma.provider.findUnique({
            where: { id: providerId },
            include: {
                bookings: {
                    select: { status: true }
                }
            }
        });

        if (!provider) return null;

        const bookings = provider.bookings;
        const total = bookings.length;

        if (total === 0) return 0;

        // 1. Completion Rate (35%)
        const completed = bookings.filter(b => b.status === 'COMPLETED').length;
        const completionScore = (completed / total) * 100;

        // 2. Reliability (No Manual Cancellations) (25%)
        // High penalty for providers cancelling confirmed jobs
        const cancelledByProvider = provider.cancellationRate || 0;
        const reliabilityScore = Math.max(0, 100 - (cancelledByProvider * 2));

        // 3. Customer Satisfaction (Rating) (40%)
        // Convert 1-5 stars to 0-100%
        const ratingScore = (provider.rating / 5) * 100;

        // Weighted Average
        const finalScore = (
            (completionScore * 0.35) +
            (reliabilityScore * 0.25) +
            (ratingScore * 0.40)
        );

        // Update Provider Record
        await prisma.provider.update({
            where: { id: providerId },
            data: {
                reliabilityScore: finalScore,
                completionRate: completionScore
            }
        });

        return finalScore;
    } catch (error) {
        console.error('Trust Score Calculation Error:', error);
        return null;
    }
};

/**
 * Returns Top Rated Badge Status
 */
export const getLeaderboardStatus = (score) => {
    if (score >= 90) return 'ELITE';
    if (score >= 75) return 'TOP_RATED';
    return 'STANDARD';
};

export default {
    calculateTrustScore,
    getLeaderboardStatus
};
