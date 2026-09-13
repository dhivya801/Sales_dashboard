export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number; // percentage e.g. 25.5
  region: 'North America' | 'Europe' | 'Asia Pacific' | 'Latin America' | 'Middle East & Africa' | string;
  salesperson: string;
  customerType: 'Enterprise' | 'SMB' | 'Consumer' | string;
  status: 'Completed' | 'Pending' | 'Cancelled' | string;
  rawDate?: string;
  hasErrors?: boolean;
  errorMessages?: string[];
  hasWarnings?: boolean;
  warningMessages?: string[];
}

export type QualityStatus = 'all' | 'clean' | 'warnings' | 'errors';

export interface QualityReport {
  totalRows: number;
  cleanRows: number;
  warningRows: number;
  errorRows: number;
  missingValuesCount: number;
  negativeValuesCount: number;
  outlierCount: number;
  invalidDatesCount: number;
}

export interface FilterState {
  datePreset: '7d' | '30d' | 'mtd' | 'ytd' | 'custom' | 'all';
  startDate: string;
  endDate: string;
  categories: string[];
  regions: string[];
  salespersons: string[];
  customerTypes: string[];
  searchTerm: string;
}

export interface KPISummary {
  totalRevenue: number;
  priorRevenue: number;
  revenueGrowthMoM: number;
  revenueGrowthYoY: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  totalProfit: number;
  overallMarginPercentage: number;
  topPerformingProduct: { name: string; revenue: number };
  topPerformingRegion: { name: string; revenue: number };
  activeSalespeopleCount: number;
}

export interface ChartTimePoint {
  period: string; // e.g. "2026-01" or "2026-W05" or "2026-01-15"
  date: string;
  revenue: number;
  priorRevenue?: number;
  profit: number;
  units: number;
  orders: number;
}

export interface ProductPerformanceMetric {
  name: string;
  category: string;
  revenue: number;
  unitsSold: number;
  ordersCount: number;
  avgPrice: number;
  profit: number;
  marginPercent: number;
  status: 'star' | 'steady' | 'underperforming';
}

export interface RegionalMetric {
  region: string;
  revenue: number;
  percentage: number;
  unitsSold: number;
  orders: number;
  topCategory: string;
}

export interface SalespersonMetric {
  name: string;
  region: string;
  revenue: number;
  target: number;
  achievementRate: number;
  dealsClosed: number;
  avgDealSize: number;
}

export interface CategoryMatrixCell {
  category: string;
  region: string;
  revenue: number;
  percentage: number;
}

export interface ComparisonMetrics {
  periodA: {
    name: string;
    startDate: string;
    endDate: string;
    revenue: number;
    units: number;
    orders: number;
    aov: number;
    profit: number;
  };
  periodB: {
    name: string;
    startDate: string;
    endDate: string;
    revenue: number;
    units: number;
    orders: number;
    aov: number;
    profit: number;
  };
  revenueDiff: number;
  revenuePercentDiff: number;
  unitsDiff: number;
  unitsPercentDiff: number;
  aovDiff: number;
  aovPercentDiff: number;
}

export type DatasetPresetKey = 'saas' | 'ecommerce' | 'b2b' | 'retail';

export interface DatasetPreset {
  key: DatasetPresetKey;
  title: string;
  description: string;
  industry: string;
  recordCount: number;
}
