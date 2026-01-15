const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function getLatestCryptoPrices(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {};

  const uniqueIds = Array.from(new Set(ids.map(id => id.toLowerCase())));
  
  // CoinGecko allows up to 50 IDs per request in the free tier usually. 
  // For safety, we should maybe chunk it, but for MVP let's assume < 50 items or simple usage.
  
  const params = new URLSearchParams({
    ids: uniqueIds.join(','),
    vs_currencies: 'usd',
  });

  try {
    const response = await fetch(`${COINGECKO_API_URL}/simple/price?${params}`);
    if (!response.ok) {
        // Handle rate limiting specifically if needed (429)
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const prices: Record<string, number> = {};

    // data format: { "bitcoin": { "usd": 50000 }, "ethereum": { "usd": 3000 } }
    Object.entries(data).forEach(([id, quote]: [string, any]) => {
      if (quote.usd) {
        prices[id] = quote.usd;
      }
    });

    return prices;
  } catch (error) {
    console.error('Failed to fetch crypto prices from CoinGecko:', error);
    return {};
  }
}
