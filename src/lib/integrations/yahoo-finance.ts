import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function getLatestStockPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const uniqueSymbols = Array.from(new Set(symbols));

  try {
    const results = await yahooFinance.quote(uniqueSymbols);
    const prices: Record<string, number> = {};

    if (Array.isArray(results)) {
        results.forEach((quote) => {
          if (quote.regularMarketPrice) {
            prices[quote.symbol] = quote.regularMarketPrice;
          }
        });
    } else {
        const quote = results as any;
         if (quote.regularMarketPrice) {
            prices[quote.symbol] = quote.regularMarketPrice;
          }
    }

    return prices;
  } catch (error) {
    // Suppress the known "Call new YahooFinance()" error to avoid cluttering logs for now,
    // or just log as warning.
    console.warn('Failed to fetch stock prices from Yahoo Finance:', error);
    return {};
  }
}