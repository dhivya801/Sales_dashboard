import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';
import type { SalesRecord } from '../types/sales';
import { getComparisonMetrics, getProductPerformance } from '../utils/analytics';


interface ComparisonViewProps {
  records: SalesRecord[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ records }) => {
  const [compareMode, setCompareMode] = useState<'period' | 'product'>('period');

  const midIndex = Math.floor(records.length / 2);

  
  const periodARecords = records.slice(0, midIndex);
  const periodBRecords = records.slice(midIndex);

  const metrics = getComparisonMetrics(
    periodARecords, 
    periodBRecords, 
    'First Half (H1 Baseline)', 
    'Second Half (H2 Performance)'
  );

  // Product comparison state
  const productsList = getProductPerformance(records);
  const [prodA, setProdA] = useState<string>(productsList[0]?.name || '');
  const [prodB, setProdB] = useState<string>(productsList[1]?.name || '');

  const productAMetric = productsList.find((p) => p.name === prodA) || productsList[0];
  const productBMetric = productsList.find((p) => p.name === prodB) || productsList[1];

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Side-by-Side Performance Comparison</h2>
            <p className="text-xs text-gray-400">Evaluate period-over-period growth or compare product lines head-to-head</p>
          </div>
        </div>

        <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setCompareMode('period')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              compareMode === 'period' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Time Period A vs B
          </button>
          <button
            onClick={() => setCompareMode('product')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              compareMode === 'product' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Product A vs Product B
          </button>
        </div>
      </div>

      {compareMode === 'period' ? (
        /* Period A vs Period B View */
        <div className="space-y-6">
          
          {/* Key Metric Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Period A Card */}
            <div className="glass-panel rounded-2xl p-5 border border-blue-500/30 relative">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                Baseline (Period A)
              </div>
              <div className="text-sm font-semibold text-white">{metrics.periodA.name}</div>
              <div className="text-[10px] text-gray-400 font-mono mb-4">{metrics.periodA.startDate} to {metrics.periodA.endDate}</div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Total Revenue:</span>
                  <strong className="text-white">{formatCurrency(metrics.periodA.revenue)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Units Sold:</span>
                  <strong className="text-white">{metrics.periodA.units.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Total Orders:</span>
                  <strong className="text-white">{metrics.periodA.orders.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Avg Order Value:</span>
                  <strong className="text-white">${metrics.periodA.aov.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Variance Diff Card */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-500/30 flex flex-col justify-center items-center text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Variance & Growth Delta
              </div>
              
              <div className="my-2">
                <div className="text-2xl font-black text-white">
                  {metrics.revenueDiff >= 0 ? `+${formatCurrency(metrics.revenueDiff)}` : formatCurrency(metrics.revenueDiff)}
                </div>
                <div className="mt-1">
                  {metrics.revenuePercentDiff >= 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 font-extrabold text-xs border border-emerald-500/40">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{metrics.revenuePercentDiff}% Net Expansion
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950 text-rose-400 font-extrabold text-xs border border-rose-500/40">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {metrics.revenuePercentDiff}% Contraction
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 mt-3">
                Volume difference: <strong>{metrics.unitsDiff > 0 ? `+${metrics.unitsDiff}` : metrics.unitsDiff} units</strong>
              </div>
            </div>

            {/* Period B Card */}
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 relative">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Target (Period B)
              </div>
              <div className="text-sm font-semibold text-white">{metrics.periodB.name}</div>
              <div className="text-[10px] text-gray-400 font-mono mb-4">{metrics.periodB.startDate} to {metrics.periodB.endDate}</div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Total Revenue:</span>
                  <strong className="text-emerald-400 font-bold">{formatCurrency(metrics.periodB.revenue)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Units Sold:</span>
                  <strong className="text-white">{metrics.periodB.units.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Total Orders:</span>
                  <strong className="text-white">{metrics.periodB.orders.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Avg Order Value:</span>
                  <strong className="text-white">${metrics.periodB.aov.toLocaleString()}</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Product A vs Product B View */
        <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-6">
          
          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-gray-800">
            <div>
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                Select Product A
              </label>
              <select
                value={prodA}
                onChange={(e) => setProdA(e.target.value)}
                className="glass-input w-full rounded-xl p-2.5 text-xs bg-gray-900 text-white border border-gray-700"
              >
                {productsList.map((p) => (
                  <option key={p.name} value={p.name}>{p.name} ({formatCurrency(p.revenue)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                Select Product B
              </label>
              <select
                value={prodB}
                onChange={(e) => setProdB(e.target.value)}
                className="glass-input w-full rounded-xl p-2.5 text-xs bg-gray-900 text-white border border-gray-700"
              >
                {productsList.map((p) => (
                  <option key={p.name} value={p.name}>{p.name} ({formatCurrency(p.revenue)})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Comparison Cards */}
          {productAMetric && productBMetric && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product A */}
              <div className="p-5 rounded-2xl bg-gray-900/60 border border-blue-500/40 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400">Product Line A</span>
                    <h3 className="text-base font-bold text-white">{productAMetric.name}</h3>
                    <p className="text-xs text-gray-400">{productAMetric.category}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-300 font-bold text-xs">
                    {productAMetric.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Total Revenue:</span>
                    <strong className="text-emerald-400 font-bold">{formatCurrency(productAMetric.revenue)}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Units Sold:</span>
                    <strong className="text-white">{productAMetric.unitsSold.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Avg Unit Price:</span>
                    <strong className="text-white">${productAMetric.avgPrice}</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">Profit Margin:</span>
                    <strong className="text-emerald-400">{productAMetric.marginPercent}%</strong>
                  </div>
                </div>
              </div>

              {/* Product B */}
              <div className="p-5 rounded-2xl bg-gray-900/60 border border-indigo-500/40 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400">Product Line B</span>
                    <h3 className="text-base font-bold text-white">{productBMetric.name}</h3>
                    <p className="text-xs text-gray-400">{productBMetric.category}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-300 font-bold text-xs">
                    {productBMetric.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Total Revenue:</span>
                    <strong className="text-emerald-400 font-bold">{formatCurrency(productBMetric.revenue)}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Units Sold:</span>
                    <strong className="text-white">{productBMetric.unitsSold.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Avg Unit Price:</span>
                    <strong className="text-white">${productBMetric.avgPrice}</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">Profit Margin:</span>
                    <strong className="text-emerald-400">{productBMetric.marginPercent}%</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
