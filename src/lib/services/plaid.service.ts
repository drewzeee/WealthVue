import { CountryCode, Products, LinkTokenCreateRequest, ItemPublicTokenExchangeRequest, AccountsGetRequest, TransactionsSyncRequest, AccountBase, Transaction as PlaidTransaction } from 'plaid';
import { plaidClient } from '@/lib/integrations/plaid';
import { prisma } from '@/lib/db/client';
import { AccountType, TransactionSource, Prisma } from '@prisma/client';
import { transferDetectionService } from './transfer-detection.service';
import { categorizationEngine } from './categorization.engine';
import { ruleRepository } from '@/lib/db/repositories/rules';

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
    try {
      await this.syncTransactions(plaidItem.id);
    } catch (error) {
      console.error('Initial transaction sync failed:', error);
      // We don't want to fail the entire linking process if sync fails
    }

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

    // Predeterministically fetch rules for categorization
    const rules = await ruleRepository.findMany(plaidItem.userId);

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
        // Use upsert to handle potential duplicates/re-syncs without crashing
        await prisma.transaction.upsert({
          where: { plaidTransactionId: txn.transaction_id },
          create: {
            accountId: account.id,
            plaidTransactionId: txn.transaction_id,
            date: new Date(txn.date),
            description: txn.name,
            merchant: txn.merchant_name,
            amount: -txn.amount, // Standardized: Negative = spent. Plaid: Positive = spent.
            pending: txn.pending,

            source: TransactionSource.PLAID,
            // Apply categorization
            categoryId: await categorizationEngine.categorize({
              description: txn.name,
              amount: new Prisma.Decimal(-txn.amount), // Use Decimal for consistency with engine
              merchant: txn.merchant_name || null
            }, plaidItem.userId, rules)
          },
          update: {
            // Update mutable fields if it already exists
            date: new Date(txn.date),
            description: txn.name,
            merchant: txn.merchant_name,
            amount: new Prisma.Decimal(-txn.amount),
            pending: txn.pending,
          }
        });

        // We only categorize new transactions in the CREATE block above. 
        // For updates, should we re-categorize? 
        // Usually, if user manually changed it, we shouldn't overwrite.
        // But if it was never categorized, maybe we should?
        // Current logic in 'create' block only sets it on insert.
        // If we want to re-run rules on updates, we need to check if it's already categorized manually.
        // For now, let's stick to categorizing on creation.
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
          amount: -txn.amount,
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

    // Run transfer detection
    await transferDetectionService.detectAndLinkTransfers(plaidItem.userId);

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
          // Ensure these are set in case it was an orphaned account or re-link
          userId,
          plaidItemId,
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
