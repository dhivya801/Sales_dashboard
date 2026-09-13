import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  PieChart, 
  Award, 
  Globe 
} from 'lucide-react';
import type { KPISummary } from '../types/sales';


interface KPISectionProps {
  kpis: KPISummary;
}

export const KPISection: React.FC<KPISectionProps> = ({ kpis }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      
      {/* KPI 1: Total Revenue */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Sales Revenue</span>
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          {formatCurrency(kpis.totalRevenue)}
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          {kpis.revenueGrowthMoM >= 0 ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
              <TrendingUp className="h-3 w-3" />
              +{kpis.revenueGrowthMoM}% MoM
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-400 text-[11px] font-bold border border-rose-500/30">
              <TrendingDown className="h-3 w-3" />
              {kpis.revenueGrowthMoM}% MoM
            </span>
          )}
          <span className="text-[10px] text-gray-500 font-medium">vs prior period</span>
        </div>
      </div>

      {/* KPI 2: Total Units Sold */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Units Sold</span>
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          {kpis.totalUnitsSold.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[11px] font-semibold text-purple-300">
            {kpis.totalOrders} total orders
          </span>
        </div>
      </div>

      {/* KPI 3: Average Order Value (AOV) */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          ${kpis.averageOrderValue.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="text-[11px] text-indigo-300 font-medium">per transaction</span>
        </div>
      </div>

      {/* KPI 4: Gross Profit & Margin % */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Net Gross Profit</span>
          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <PieChart className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          {formatCurrency(kpis.totalProfit)}
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
            {kpis.overallMarginPercentage}% Margin
          </span>
        </div>
      </div>

      {/* KPI 5: Top Performing Product */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Top Product</span>
          <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="text-sm font-bold text-white truncate max-w-[170px]" title={kpis.topPerformingProduct.name}>
          {kpis.topPerformingProduct.name}
        </div>
        <div className="text-xs text-amber-400 font-extrabold mt-1">
          {formatCurrency(kpis.topPerformingProduct.revenue)} revenue
        </div>
      </div>

      {/* KPI 6: Top Territory */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Top Territory</span>
          <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Globe className="h-4 w-4" />
          </div>
        </div>
        <div className="text-sm font-bold text-white truncate">
          {kpis.topPerformingRegion.name}
        </div>
        <div className="text-xs text-rose-300 font-semibold mt-1">
          {kpis.activeSalespeopleCount} Active Representatives
        </div>
      </div>

    </div>
  );
};
