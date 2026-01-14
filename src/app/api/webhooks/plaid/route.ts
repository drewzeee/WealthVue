import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { plaidService } from '@/lib/services/plaid.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhook_type, webhook_code, item_id } = body;

    console.log('Received Plaid webhook:', { webhook_type, webhook_code, item_id });

    if (webhook_type === 'TRANSACTIONS') {
        // SYNC_UPDATES_AVAILABLE: New transactions are available
        // INITIAL_UPDATE: Initial sync is complete
        // HISTORICAL_UPDATE: Historical transactions are available
        // DEFAULT_UPDATE: New transactions (legacy)
        const relevantCodes = ['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE', 'DEFAULT_UPDATE'];
        
        if (relevantCodes.includes(webhook_code)) {
            const plaidItem = await prisma.plaidItem.findUnique({
                where: { itemId: item_id },
            });

            if (plaidItem) {
                console.log(`Triggering sync for item ${plaidItem.id}`);
                // Run sync in background (don't await)
                plaidService.syncTransactions(plaidItem.id).catch(err => {
                    console.error('Error syncing transactions from webhook:', err);
                });
            } else {
                console.warn(`Plaid Item not found for item_id: ${item_id}`);
            }
        }
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error handling Plaid webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
