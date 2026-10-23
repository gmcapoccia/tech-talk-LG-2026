// mockMarketData.js

const baseCompanies = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "TSLA", name: "Tesla, Inc." },
];

export const generateMockTimeSeries = (count = 4) => {
  const items = [];

  for (let i = 0; i < count; i++) {
    const base = baseCompanies[i % baseCompanies.length];
    const symbol = i < 4 ? base.symbol : `SYM${i}`;
    const name = i < 4 ? base.name : `Company ${i} Corp.`;

    let currentPrice = 100 + ((i * 15.5) % 400);

    const trend = [];
    for (let day = 30; day >= 0; day--) {
      const fluctuation = Math.sin(day + i) * 3 + (Math.random() * 2 - 1);
      currentPrice = Math.max(10, currentPrice + fluctuation);

      trend.push({
        datetime: new Date(Date.now() - day * 86400000)
          .toISOString()
          .split("T")[0],
        price: Number(currentPrice.toFixed(2)),
        volume: Math.floor(100000 + Math.random() * 5000000),
      });
    }

    const current = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    const changePercent =
      ((current.price - previous.price) / previous.price) * 100;

    items.push({
      symbol,
      name,
      price: current.price,
      changePercent,
      volume: current.volume,
      trend,
    });
  }

  return items;
};
