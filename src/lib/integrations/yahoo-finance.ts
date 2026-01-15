import yahooFinance from 'yahoo-finance2';

export async function getLatestStockPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  // Deduplicate symbols
  const uniqueSymbols = Array.from(new Set(symbols));

  try {
    // yahoo-finance2's quote method can accept an array of symbols
    const results = await yahooFinance.quote(uniqueSymbols);
    const prices: Record<string, number> = {};

    if (Array.isArray(results)) {
        (results as any[]).forEach((quote) => {
          if (quote.regularMarketPrice) {
            prices[quote.symbol] = quote.regularMarketPrice;
          }
        });
    } else {
        // Single result
        const quote = results as any;
         if (quote.regularMarketPrice) {
            prices[quote.symbol] = quote.regularMarketPrice;
          }
    }

    return prices;
  } catch (error) {
    console.error('Failed to fetch stock prices from Yahoo Finance:', error);
    // Return partial results or empty object. 
    // Ideally we might want to throw or handle partial failures, but for now safe fail.
    return {};
  }
}
