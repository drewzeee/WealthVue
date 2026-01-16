import { investmentRepository } from '../src/lib/db/repositories/investments';
import { getLatestStockPrices } from '../src/lib/integrations/yahoo-finance';
import { getLatestCryptoPrices } from '../src/lib/integrations/coingecko';
import { AssetClass } from '@prisma/client';

async function main() {
    console.log('[ForceUpdate] Starting manual price update...');

    try {
        // 1. Get all investments that need update (manualPrice = false)
        const investments = await investmentRepository.getInvestmentsForPriceUpdate();

        if (investments.length === 0) {
            console.log('[ForceUpdate] No investments to update.');
            return;
        }

        console.log(`[ForceUpdate] Found ${investments.length} investments to update.`);

        // 2. Group by type
        const yahooAssets = investments.filter(i =>
            ([AssetClass.STOCK, AssetClass.ETF, AssetClass.MUTUAL_FUND, AssetClass.BOND, AssetClass.COMMODITY] as AssetClass[]).includes(i.assetClass)
        );

        const cryptoAssets = investments.filter(i => i.assetClass === AssetClass.CRYPTO);

        const updates: any[] = [];

        // 3. Fetch Yahoo Finance Prices
        if (yahooAssets.length > 0) {
            const symbols = yahooAssets.map(i => i.symbol).filter((s): s is string => !!s);
            if (symbols.length > 0) {
                console.log(`[ForceUpdate] Fetching Yahoo prices for symbols: ${symbols.join(', ')}`);
                const prices = await getLatestStockPrices(symbols);

                yahooAssets.forEach(asset => {
                    if (asset.symbol) {
                        const data = prices[asset.symbol];
                        if (data !== undefined) {
                            updates.push({
                                id: asset.id,
                                price: data.price,
                                change: data.change,
                                changePercent: data.changePercent,
                                source: 'yahoo-manual'
                            });
                        }
                    }
                });
            }
        }

        // 4. Fetch CoinGecko Prices
        if (cryptoAssets.length > 0) {
            const ids = cryptoAssets.map(i => i.symbol).filter((s): s is string => !!s);
            if (ids.length > 0) {
                console.log(`[ForceUpdate] Fetching CoinGecko prices for ids: ${ids.join(', ')}`);
                const prices = await getLatestCryptoPrices(ids);

                cryptoAssets.forEach(crypto => {
                    if (crypto.symbol) {
                        const data = prices[crypto.symbol.toLowerCase()];
                        if (data !== undefined) {
                            updates.push({
                                id: crypto.id,
                                price: data.price,
                                change: 0,
                                changePercent: data.change24h,
                                source: 'coingecko-manual'
                            });
                        }
                    }
                });
            }
        }

        // 5. Bulk Update
        if (updates.length > 0) {
            console.log(`[ForceUpdate] Updating ${updates.length} records in database...`);
            await investmentRepository.bulkUpdatePrices(updates);
            console.log('[ForceUpdate] Successfully updated all prices.');
        } else {
            console.log('[ForceUpdate] No updates found.');
        }

    } catch (error) {
        console.error('[ForceUpdate] Failed:', error);
    }
}

main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
