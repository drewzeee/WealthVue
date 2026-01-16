import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export interface StockPriceData {
  price: number;
  change: number;
  changePercent: number;
}

export async function getLatestStockPrices(symbols: string[]): Promise<Record<string, StockPriceData>> {
  if (symbols.length === 0) return {};

  const uniqueSymbols = Array.from(new Set(symbols));

  try {
    const results = await yahooFinance.quote(uniqueSymbols);
    const data: Record<string, StockPriceData> = {};

    if (Array.isArray(results)) {
      results.forEach((quote) => {
        if (quote.regularMarketPrice !== undefined) {
          data[quote.symbol] = {
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0
          };
        }
      });
    } else {
      const quote = results as any;
      if (quote.regularMarketPrice !== undefined) {
        data[quote.symbol] = {
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0
        };
      }
    }

    return data;
  } catch (error) {
    // Suppress the known "Call new YahooFinance()" error to avoid cluttering logs for now,
    // or just log as warning.
    console.warn('Failed to fetch stock prices from Yahoo Finance:', error);
    return {};
  }
}