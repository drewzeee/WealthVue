import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { plaidService } from '@/lib/services/plaid.service';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find all Plaid Items for this user
        const plaidItems = await prisma.plaidItem.findMany({
            where: { userId: session.user.id },
        });

        if (plaidItems.length === 0) {
            return NextResponse.json({ message: 'No Plaid items to sync' });
        }

        // Sync all items
        const results = await Promise.allSettled(
            plaidItems.map((item) => plaidService.syncTransactions(item.id))
        );

        const summary = results.reduce(
            (acc, res) => {
                if (res.status === 'fulfilled') {
                    acc.success++;
                    acc.added += res.value.addedCount;
                    acc.modified += res.value.modifiedCount;
                } else {
                    acc.failed++;
                    console.error('Manual sync failed for an item:', res.reason);
                }
                return acc;
            },
            { success: 0, failed: 0, added: 0, modified: 0 }
        );

        return NextResponse.json({
            message: 'Sync complete',
            summary,
        });
    } catch (error: any) {
        console.error('Error triggering manual sync:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to trigger sync' },
            { status: 500 }
        );
    }
}
