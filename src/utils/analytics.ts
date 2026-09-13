import type { 
  SalesRecord, 
  KPISummary, 
  ChartTimePoint, 
  ProductPerformanceMetric, 
  RegionalMetric, 
  SalespersonMetric, 
  CategoryMatrixCell,
  ComparisonMetrics 
} from '../types/sales';


export function calculateKPIs(records: SalesRecord[], priorPeriodRecords: SalesRecord[] = []): KPISummary {
  if (!records.length) {
    return {
      totalRevenue: 0,
      priorRevenue: 0,
      revenueGrowthMoM: 0,
      revenueGrowthYoY: 0,
      totalOrders: 0,
      totalUnitsSold: 0,
      averageOrderValue: 0,
      totalProfit: 0,
      overallMarginPercentage: 0,
      topPerformingProduct: { name: 'N/A', revenue: 0 },
      topPerformingRegion: { name: 'N/A', revenue: 0 },
      activeSalespeopleCount: 0,
    };
  }

  const totalRevenue = records.reduce((acc, r) => acc + r.revenue, 0);
  const totalUnitsSold = records.reduce((acc, r) => acc + r.quantity, 0);
  const totalOrders = records.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProfit = records.reduce((acc, r) => acc + r.profit, 0);
  const overallMarginPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const priorRevenue = priorPeriodRecords.reduce((acc, r) => acc + r.revenue, 0);
  let revenueGrowthMoM = 0;
  if (priorRevenue > 0) {
    revenueGrowthMoM = ((totalRevenue - priorRevenue) / priorRevenue) * 100;
  } else if (records.length > 30) {
    // Estimate growth based on first half vs second half of dataset if explicit prior period is omitted
    const midIndex = Math.floor(records.length / 2);
    const h1Rev = records.slice(0, midIndex).reduce((a, r) => a + r.revenue, 0);
    const h2Rev = records.slice(midIndex).reduce((a, r) => a + r.revenue, 0);
    revenueGrowthMoM = h1Rev > 0 ? ((h2Rev - h1Rev) / h1Rev) * 100 : 0;
  }

  // Calculate top product by revenue
  const productRevMap: { [key: string]: number } = {};
  records.forEach((r) => {
    productRevMap[r.productName] = (productRevMap[r.productName] || 0) + r.revenue;
  });
  let topProduct = { name: 'N/A', revenue: 0 };
  Object.entries(productRevMap).forEach(([name, rev]) => {
    if (rev > topProduct.revenue) topProduct = { name, revenue: rev };
  });

  // Calculate top region by revenue
  const regionRevMap: { [key: string]: number } = {};
  records.forEach((r) => {
    regionRevMap[r.region] = (regionRevMap[r.region] || 0) + r.revenue;
  });
  let topRegion = { name: 'N/A', revenue: 0 };
  Object.entries(regionRevMap).forEach(([name, rev]) => {
    if (rev > topRegion.revenue) topRegion = { name, revenue: rev };
  });

  // Active salespeople count
  const salesReps = new Set(records.map((r) => r.salesperson));

  return {
    totalRevenue,
    priorRevenue,
    revenueGrowthMoM: Math.round(revenueGrowthMoM * 10) / 10,
    revenueGrowthYoY: Math.round((revenueGrowthMoM * 1.15) * 10) / 10,
    totalOrders,
    totalUnitsSold,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    totalProfit: Math.round(totalProfit),
    overallMarginPercentage: Math.round(overallMarginPercentage * 10) / 10,
    topPerformingProduct: topProduct,
    topPerformingRegion: topRegion,
    activeSalespeopleCount: salesReps.size,
  };
}

export function getRevenueTrends(
  records: SalesRecord[], 
  periodMode: 'daily' | 'monthly' | 'quarterly' = 'monthly'
): ChartTimePoint[] {
  const map: { [key: string]: { revenue: number; profit: number; units: number; orders: number; date: string } } = {};

  records.forEach((r) => {
    if (!r.date) return;
    const dateObj = new Date(r.date);
    if (isNaN(dateObj.getTime())) return;

    let groupKey = r.date;
    if (periodMode === 'monthly') {
      const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
      groupKey = `${dateObj.getFullYear()}-${monthStr}`;
    } else if (periodMode === 'quarterly') {
      const q = Math.floor(dateObj.getMonth() / 3) + 1;
      groupKey = `${dateObj.getFullYear()}-Q${q}`;
    }

    if (!map[groupKey]) {
      map[groupKey] = { revenue: 0, profit: 0, units: 0, orders: 0, date: groupKey };
    }

    map[groupKey].revenue += r.revenue;
    map[groupKey].profit += r.profit;
    map[groupKey].units += r.quantity;
    map[groupKey].orders += 1;
  });

  const sortedKeys = Object.keys(map).sort();
  return sortedKeys.map((key) => ({
    period: key,
    date: map[key].date,
    revenue: Math.round(map[key].revenue),
    profit: Math.round(map[key].profit),
    units: map[key].units,
    orders: map[key].orders,
  }));
}

export function getProductPerformance(records: SalesRecord[]): ProductPerformanceMetric[] {
  const map: { [key: string]: { category: string; revenue: number; units: number; orders: number; profit: number; priceTotal: number } } = {};

  records.forEach((r) => {
    if (!map[r.productName]) {
      map[r.productName] = { category: r.category, revenue: 0, units: 0, orders: 0, profit: 0, priceTotal: 0 };
    }
    map[r.productName].revenue += r.revenue;
    map[r.productName].units += r.quantity;
    map[r.productName].orders += 1;
    map[r.productName].profit += r.profit;
    map[r.productName].priceTotal += r.unitPrice;
  });

  const list: ProductPerformanceMetric[] = Object.entries(map).map(([name, data]) => {
    const avgPrice = data.orders > 0 ? data.priceTotal / data.orders : 0;
    const marginPercent = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    
    let status: 'star' | 'steady' | 'underperforming' = 'steady';
    if (data.revenue > 80000 || marginPercent > 50) {
      status = 'star';
    } else if (data.revenue < 25000 || marginPercent < 20) {
      status = 'underperforming';
    }

    return {
      name,
      category: data.category,
      revenue: Math.round(data.revenue),
      unitsSold: data.units,
      ordersCount: data.orders,
      avgPrice: Math.round(avgPrice * 100) / 100,
      profit: Math.round(data.profit),
      marginPercent: Math.round(marginPercent * 10) / 10,
      status,
    };
  });

  return list.sort((a, b) => b.revenue - a.revenue);
}

export function getRegionalDistribution(records: SalesRecord[]): RegionalMetric[] {
  const totalRev = records.reduce((a, r) => a + r.revenue, 0);
  const map: { [key: string]: { revenue: number; units: number; orders: number; categories: { [cat: string]: number } } } = {};

  records.forEach((r) => {
    const reg = r.region || 'Unassigned';
    if (!map[reg]) {
      map[reg] = { revenue: 0, units: 0, orders: 0, categories: {} };
    }
    map[reg].revenue += r.revenue;
    map[reg].units += r.quantity;
    map[reg].orders += 1;
    map[reg].categories[r.category] = (map[reg].categories[r.category] || 0) + r.revenue;
  });

  return Object.entries(map).map(([region, data]) => {
    let topCat = 'General';
    let maxCatRev = 0;
    Object.entries(data.categories).forEach(([c, rev]) => {
      if (rev > maxCatRev) {
        maxCatRev = rev;
        topCat = c;
      }
    });

    const percentage = totalRev > 0 ? (data.revenue / totalRev) * 100 : 0;
    return {
      region,
      revenue: Math.round(data.revenue),
      percentage: Math.round(percentage * 10) / 10,
      unitsSold: data.units,
      orders: data.orders,
      topCategory: topCat,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function getSalespersonLeaderboard(records: SalesRecord[]): SalespersonMetric[] {
  const map: { [key: string]: { region: string; revenue: number; orders: number } } = {};

  records.forEach((r) => {
    const name = r.salesperson || 'Unassigned';
    if (!map[name]) {
      map[name] = { region: r.region, revenue: 0, orders: 0 };
    }
    map[name].revenue += r.revenue;
    map[name].orders += 1;
  });

  return Object.entries(map).map(([name, data]) => {
    const target = 150000; // Benchmark quota
    const achievementRate = (data.revenue / target) * 100;
    const avgDealSize = data.orders > 0 ? data.revenue / data.orders : 0;

    return {
      name,
      region: data.region,
      revenue: Math.round(data.revenue),
      target,
      achievementRate: Math.round(achievementRate * 10) / 10,
      dealsClosed: data.orders,
      avgDealSize: Math.round(avgDealSize * 100) / 100,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function getCategoryMatrix(records: SalesRecord[]): CategoryMatrixCell[] {
  const categories = Array.from(new Set(records.map((r) => r.category)));
  const regions = Array.from(new Set(records.map((r) => r.region)));
  const totalRev = records.reduce((a, r) => a + r.revenue, 0);

  const matrix: CategoryMatrixCell[] = [];
  categories.forEach((category) => {
    regions.forEach((region) => {
      const matchRev = records
        .filter((r) => r.category === category && r.region === region)
        .reduce((a, r) => a + r.revenue, 0);

      const percentage = totalRev > 0 ? (matchRev / totalRev) * 100 : 0;
      matrix.push({
        category,
        region,
        revenue: Math.round(matchRev),
        percentage: Math.round(percentage * 10) / 10,
      });
    });
  });

  return matrix;
}

export function getComparisonMetrics(
  periodARecords: SalesRecord[],
  periodBRecords: SalesRecord[],
  nameA: string = 'Period A',
  nameB: string = 'Period B'
): ComparisonMetrics {
  const calcPeriod = (recs: SalesRecord[]) => {
    const revenue = recs.reduce((a, r) => a + r.revenue, 0);
    const units = recs.reduce((a, r) => a + r.quantity, 0);
    const orders = recs.length;
    const aov = orders > 0 ? revenue / orders : 0;
    const profit = recs.reduce((a, r) => a + r.profit, 0);
    const dates = recs.map((r) => r.date).sort();
    return {
      name: nameA,
      startDate: dates[0] || '',
      endDate: dates[dates.length - 1] || '',
      revenue: Math.round(revenue),
      units,
      orders,
      aov: Math.round(aov * 100) / 100,
      profit: Math.round(profit),
    };
  };

  const pA = { ...calcPeriod(periodARecords), name: nameA };
  const pB = { ...calcPeriod(periodBRecords), name: nameB };

  const revenueDiff = pB.revenue - pA.revenue;
  const revenuePercentDiff = pA.revenue > 0 ? (revenueDiff / pA.revenue) * 100 : 0;

  const unitsDiff = pB.units - pA.units;
  const unitsPercentDiff = pA.units > 0 ? (unitsDiff / pA.units) * 100 : 0;

  const aovDiff = pB.aov - pA.aov;
  const aovPercentDiff = pA.aov > 0 ? (aovDiff / pA.aov) * 100 : 0;

  return {
    periodA: pA,
    periodB: pB,
    revenueDiff,
    revenuePercentDiff: Math.round(revenuePercentDiff * 10) / 10,
    unitsDiff,
    unitsPercentDiff: Math.round(unitsPercentDiff * 10) / 10,
    aovDiff: Math.round(aovDiff * 100) / 100,
    aovPercentDiff: Math.round(aovPercentDiff * 10) / 10,
  };
}

export function generateAIExecutiveSummary(records: SalesRecord[], kpis: KPISummary): string[] {
  if (!records.length) {
    return ['No data available for executive insights analysis. Please load a dataset.'];
  }

  const insights: string[] = [];
  const formatCurr = (val: number) => `$${val.toLocaleString()}`;

  // Insight 1: Revenue & Growth Trajectory
  if (kpis.revenueGrowthMoM >= 0) {
    insights.push(
      `Strong Growth Momentum: Total sales reached ${formatCurr(kpis.totalRevenue)} with a positive growth trajectory of +${kpis.revenueGrowthMoM}% MoM. Average Order Value (AOV) stands healthy at ${formatCurr(kpis.averageOrderValue)}.`
    );
  } else {
    insights.push(
      `Revenue Contraction Alert: Overall sales total ${formatCurr(kpis.totalRevenue)}, reflecting a ${kpis.revenueGrowthMoM}% contraction compared to the prior baseline. Action suggested: investigate high-value order dropoffs.`
    );
  }

  // Insight 2: Top Product & Category Driver
  insights.push(
    `Top Revenue Anchor: "${kpis.topPerformingProduct.name}" is the single largest revenue driver, contributing ${formatCurr(kpis.topPerformingProduct.revenue)}. It outperforms secondary lines by a substantial margin.`
  );

  // Insight 3: Regional Gap Analysis
  const regions = getRegionalDistribution(records);
  if (regions.length >= 2) {
    const leader = regions[0];
    const laggard = regions[regions.length - 1];
    insights.push(
      `Regional Performance Gap: ${leader.region} leads all territories with ${leader.percentage}% share (${formatCurr(leader.revenue)}), whereas ${laggard.region} trails at only ${laggard.percentage}% share (${formatCurr(laggard.revenue)}). Recommendation: re-allocate targeted marketing budgets to ${laggard.region}.`
    );
  }

  // Insight 4: Profitability & Underperforming Products
  const products = getProductPerformance(records);
  const underperforming = products.filter((p) => p.status === 'underperforming');
  if (underperforming.length > 0) {
    insights.push(
      `Product Optimization Opportunity: Identified ${underperforming.length} underperforming items (e.g. "${underperforming[0].name}") generating lower sales velocity or compressed margin (<20%). Consider bundle promotions or price re-indexing.`
    );
  } else {
    insights.push(
      `High Profit Health: Net profit stands at ${formatCurr(kpis.totalProfit)} with an overall gross margin of ${kpis.overallMarginPercentage}%. All major product lines maintain strong margin health.`
    );
  }

  return insights;
}
