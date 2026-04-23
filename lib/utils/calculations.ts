export function calcPnl(quantity: number, avgBuyPrice: number, currentPrice: number) {
  const costBasis = quantity * avgBuyPrice;
  const currentValue = quantity * currentPrice;
  const pnlAmount = currentValue - costBasis;
  const pnlPercent = costBasis === 0 ? 0 : (pnlAmount / costBasis) * 100;
  return { costBasis, currentValue, pnlAmount, pnlPercent };
}

export function calcPortfolioStats(
  holdings: { quantity: number; avgBuyPrice: number; currentPrice: number; change24h?: number }[]
) {
  const totals = holdings.reduce(
    (acc, h) => {
      const { costBasis, currentValue, pnlAmount } = calcPnl(h.quantity, h.avgBuyPrice, h.currentPrice);
      const prevValue =
        h.change24h !== undefined && h.change24h !== 0
          ? currentValue / (1 + h.change24h / 100)
          : currentValue;
      acc.totalValue += currentValue;
      acc.totalCost += costBasis;
      acc.totalPnl += pnlAmount;
      acc.prevTotalValue += prevValue;
      return acc;
    },
    { totalValue: 0, totalCost: 0, totalPnl: 0, prevTotalValue: 0 }
  );
  const change24hAmount = totals.totalValue - totals.prevTotalValue;
  const change24hPercent =
    totals.prevTotalValue === 0 ? 0 : (change24hAmount / totals.prevTotalValue) * 100;
  const totalPnlPercent =
    totals.totalCost === 0 ? 0 : (totals.totalPnl / totals.totalCost) * 100;
  return { ...totals, change24hAmount, change24hPercent, totalPnlPercent };
}

export function calcNewAvgBuyPrice(
  prevQty: number,
  prevAvg: number,
  addQty: number,
  addPrice: number
): number {
  const totalQty = prevQty + addQty;
  if (totalQty === 0) return 0;
  return (prevQty * prevAvg + addQty * addPrice) / totalQty;
}
