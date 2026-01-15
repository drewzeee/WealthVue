import { createQueue, createWorker } from './queue';
import { investmentRepository } from '@/lib/db/repositories/investments';
import { getLatestStockPrices } from '@/lib/integrations/yahoo-finance';
import { getLatestCryptoPrices } from '@/lib/integrations/coingecko';
import { AssetClass } from '@prisma/client';

export const PRICE_UPDATE_QUEUE_NAME = 'price-update';

export const priceUpdateQueue = createQueue(PRICE_UPDATE_QUEUE_NAME);

export const priceUpdateWorker = createWorker(PRICE_UPDATE_QUEUE_NAME, async (job) => {
  console.log(`[PriceUpdate] Starting job ${job.id}`);
  
  try {
    // 1. Get all investments that need update (manualPrice = false)
    const investments = await investmentRepository.getInvestmentsForPriceUpdate();
    
    if (investments.length === 0) {
        console.log('[PriceUpdate] No investments to update.');
        return { updated: 0 };
    }

    // 2. Group by type
    // Yahoo Finance handles Stocks, ETFs, Mutual Funds, and potentially others if symbol is valid
    const yahooAssets = investments.filter(i => 
        ([AssetClass.STOCK, AssetClass.ETF, AssetClass.MUTUAL_FUND, AssetClass.BOND, AssetClass.COMMODITY] as AssetClass[]).includes(i.assetClass)
    );
    
    // CoinGecko for Crypto
    const cryptoAssets = investments.filter(i => i.assetClass === AssetClass.CRYPTO);
    
    const updates: { id: string; price: number; source: string }[] = [];

    // 3. Fetch Yahoo Finance Prices
    if (yahooAssets.length > 0) {
        const symbols = yahooAssets.map(i => i.symbol);
        console.log(`[PriceUpdate] Fetching Yahoo prices for ${symbols.length} assets...`);
        const prices = await getLatestStockPrices(symbols);
        
        yahooAssets.forEach(asset => {
            const price = prices[asset.symbol];
            if (price !== undefined) {
                updates.push({
                    id: asset.id,
                    price,
                    source: 'yahoo'
                });
            }
        });
    }

    // 4. Fetch CoinGecko Prices
    if (cryptoAssets.length > 0) {
        const ids = cryptoAssets.map(i => i.symbol);
        console.log(`[PriceUpdate] Fetching CoinGecko prices for ${ids.length} assets...`);
        const prices = await getLatestCryptoPrices(ids);
        
        cryptoAssets.forEach(crypto => {
            // CoinGecko IDs are lowercase
            const price = prices[crypto.symbol.toLowerCase()];
            if (price !== undefined) {
                updates.push({
                    id: crypto.id,
                    price,
                    source: 'coingecko'
                });
            }
        });
    }

    // 5. Bulk Update
    if (updates.length > 0) {
        await investmentRepository.bulkUpdatePrices(updates);
        console.log(`[PriceUpdate] Successfully updated ${updates.length} investment prices.`);
    } else {
        console.log('[PriceUpdate] No new prices found to update.');
    }

    return { updated: updates.length };

  } catch (error) {
    console.error('[PriceUpdate] Job failed:', error);
    throw error;
  }
});
