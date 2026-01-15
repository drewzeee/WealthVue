const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

const COMMON_CRYPTO_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  ada: 'cardano',
  dot: 'polkadot',
  doge: 'dogecoin',
  usdt: 'tether',
  usdc: 'usd-coin',
  xrp: 'ripple',
  bnb: 'binancecoin',
  link: 'chainlink',
  matic: 'matic-network',
  ltc: 'litecoin',
  algo: 'algorand',
  atom: 'cosmos',
  uni: 'uniswap',
  avax: 'avalanche-2'
};

export async function getLatestCryptoPrices(inputs: string[]): Promise<Record<string, number>> {
  if (inputs.length === 0) return {};

  // Map inputs (symbols or IDs) to CoinGecko IDs
  const idMap: Record<string, string> = {}; // input -> coingeckoId
  const uniqueIds = new Set<string>();

  inputs.forEach(input => {
    const lowerInput = input.toLowerCase();
    const mappedId = COMMON_CRYPTO_MAP[lowerInput] || lowerInput;
    idMap[lowerInput] = mappedId;
    uniqueIds.add(mappedId);
  });
  
  const params = new URLSearchParams({
    ids: Array.from(uniqueIds).join(','),
    vs_currencies: 'usd',
  });

  try {
    const response = await fetch(`${COINGECKO_API_URL}/simple/price?${params}`);
    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const prices: Record<string, number> = {};

    // Map results back to original inputs
    // data format: { "bitcoin": { "usd": 50000 }, "ethereum": { "usd": 3000 } }
    inputs.forEach(input => {
        const lowerInput = input.toLowerCase();
        const mappedId = idMap[lowerInput];
        
        if (data[mappedId] && data[mappedId].usd) {
            prices[lowerInput] = data[mappedId].usd;
        }
    });

    return prices;
  } catch (error) {
    console.error('Failed to fetch crypto prices from CoinGecko:', error);
    return {};
  }
}
