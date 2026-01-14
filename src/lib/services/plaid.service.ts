import { CountryCode, Products, LinkTokenCreateRequest, ItemPublicTokenExchangeRequest, AccountsGetRequest, TransactionsSyncRequest, AccountBase, Transaction as PlaidTransaction } from 'plaid';
import { plaidClient } from '@/lib/integrations/plaid';
import { prisma } from '@/lib/db/client';
import { AccountType, TransactionSource } from '@prisma/client';

export class PlaidService {
  /**
   * Creates a Link Token for the client to initialize Plaid Link
   */
  async createLinkToken(userId: string) {
    const request: LinkTokenCreateRequest = {
      user: { client_user_id: userId },
      client_name: 'WealthVue',
      products: [Products.Transactions],
      language: 'en',
      country_codes: [CountryCode.Us],
    };

    const response = await plaidClient.linkTokenCreate(request);
    return response.data;
  }

  /**
   * Exchanges a public token for an access token and persists the Item and Accounts
   */
  async exchangePublicToken(userId: string, publicToken: string) {
    // 1. Exchange public token
    const exchangeRequest: ItemPublicTokenExchangeRequest = {
      public_token: publicToken,
    };
    const exchangeResponse = await plaidClient.itemPublicTokenExchange(exchangeRequest);
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // 2. Fetch Item details (institution)
    // We can get institution_id from the accounts request or item get request.
    // Let's get accounts directly, it returns item info too.
    const accountsRequest: AccountsGetRequest = {
      access_token: accessToken,
    };
    const accountsResponse = await plaidClient.accountsGet(accountsRequest);
    const institutionId = accountsResponse.data.item.institution_id;
    
    let institutionName = 'Unknown Bank';
    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = instResponse.data.institution.name;
      } catch (error) {
        console.warn('Failed to fetch institution details', error);
      }
    }

    // 3. Create PlaidItem in DB
    const plaidItem = await prisma.plaidItem.create({
      data: {
        userId,
        itemId,
        accessToken,
        institutionId,
        institutionName,
      },
    });

    // 4. Create Accounts in DB
    const accounts = accountsResponse.data.accounts;
    await this.upsertAccounts(userId, plaidItem.id, accounts);

    // 5. Trigger initial transaction sync
    // We do this asynchronously or simply await it if we want the user to see data immediately.
    // For now, let's await it to ensure data is there.
    await this.syncTransactions(plaidItem.id);

    return { plaidItem };
  }

  /**
   * Syncs transactions for a given Plaid Item
   */
  async syncTransactions(plaidItemId: string) {
    const plaidItem = await prisma.plaidItem.findUnique({
      where: { id: plaidItemId },
    });

    if (!plaidItem) throw new Error('Plaid Item not found');

    let cursor = plaidItem.cursor || undefined;
    let hasMore = true;
    let added: PlaidTransaction[] = [];
    let modified: PlaidTransaction[] = [];
    let removed: { transaction_id: string }[] = [];

    // Iterate through pages
    while (hasMore) {
      const request: TransactionsSyncRequest = {
        access_token: plaidItem.accessToken,
        cursor,
      };

      const response = await plaidClient.transactionsSync(request);
      const data = response.data;

      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    // Process updates
    // 1. Added
    for (const txn of added) {
      const account = await prisma.account.findUnique({
        where: { plaidAccountId: txn.account_id },
      });
      
      if (account) {
        await prisma.transaction.create({
          data: {
            accountId: account.id,
            plaidTransactionId: txn.transaction_id,
            date: new Date(txn.date),
            description: txn.name,
            merchant: txn.merchant_name,
            amount: txn.amount, // Plaid: positive = spent. DB: positive = spent (usually). 
            // NOTE: Check if we want negative for income? 
            // Convention: Expense is positive, Income is negative in Plaid? 
            // Actually Plaid: Positive means money leaving account. Negative means money entering.
            // WealthVue should probably follow this or store income as positive in 'Income' category.
            // Let's stick to raw value for now.
            pending: txn.pending,
            source: TransactionSource.PLAID,
            // categoryId: try to map later
          },
        });
      }
    }

    // 2. Modified
    for (const txn of modified) {
        await prisma.transaction.updateMany({
            where: { plaidTransactionId: txn.transaction_id },
            data: {
                date: new Date(txn.date),
                description: txn.name,
                merchant: txn.merchant_name,
                amount: txn.amount,
                pending: txn.pending,
            }
        });
    }

    // 3. Removed
    for (const rem of removed) {
        await prisma.transaction.deleteMany({
            where: { plaidTransactionId: rem.transaction_id }
        });
    }

    // Update cursor
    await prisma.plaidItem.update({
      where: { id: plaidItemId },
      data: { cursor },
    });

    return { addedCount: added.length, modifiedCount: modified.length, removedCount: removed.length };
  }

  private async upsertAccounts(userId: string, plaidItemId: string, accounts: AccountBase[]) {
    for (const acc of accounts) {
      const type = this.mapAccountType(acc.type, acc.subtype);
      
      await prisma.account.upsert({
        where: { plaidAccountId: acc.account_id },
        update: {
          currentBalance: acc.balances.current || 0,
          availableBalance: acc.balances.available,
          creditLimit: acc.balances.limit,
          name: acc.name,
        },
        create: {
          userId,
          plaidItemId,
          plaidAccountId: acc.account_id,
          name: acc.name,
          type,
          subtype: acc.subtype || null,
          currentBalance: acc.balances.current || 0,
          availableBalance: acc.balances.available,
          creditLimit: acc.balances.limit,
        },
      });
    }
  }

  private mapAccountType(plaidType: string, subtype: string | null | undefined): AccountType {
    if (plaidType === 'investment') return AccountType.INVESTMENT;
    if (plaidType === 'credit') return AccountType.CREDIT_CARD;
    if (plaidType === 'loan') return AccountType.LOAN;
    if (plaidType === 'depository') {
      if (subtype === 'checking') return AccountType.CHECKING;
      if (subtype === 'savings') return AccountType.SAVINGS;
    }
    return AccountType.OTHER;
  }
}

export const plaidService = new PlaidService();
