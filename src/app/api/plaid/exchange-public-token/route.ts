import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { plaidService } from '@/lib/services/plaid.service';
import { z } from 'zod';

const exchangeSchema = z.object({
  publicToken: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = exchangeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { publicToken } = result.data;
    const data = await plaidService.exchangePublicToken(session.user.id, publicToken);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error exchanging public token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
