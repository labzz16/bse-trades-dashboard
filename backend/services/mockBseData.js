// Generate 3,000 mock BSE trades

const symbols = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "WIPRO",
  "ITC",
  "SBIN"
];

const clients = [
  "Client A",
  "Client B",
  "Client C",
  "Client D",
  "Client E"
];

const trades = Array.from({ length: 3000 }, (_, index) => ({
  tradeId: `BSE-${String(index + 1).padStart(6, "0")}`,
  client: clients[index % clients.length],
  symbol: symbols[index % symbols.length],
  quantity: Math.floor(Math.random() * 1000) + 1,
  price: Number((100 + Math.random() * 2900).toFixed(2)),
  timestamp: new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
  )
}));

module.exports = trades;