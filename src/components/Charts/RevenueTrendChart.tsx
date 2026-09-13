import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { SalesRecord } from '../../types/sales';

import { getRevenueTrends } from '../../utils/analytics';

interface RevenueTrendChartProps {
  records: SalesRecord[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ records }) => {
  const [periodMode, setPeriodMode] = useState<'daily' | 'monthly' | 'quarterly'>('monthly');
  const [metricView, setMetricView] = useState<'revenue' | 'profit' | 'units'>('revenue');

  const trendData = getRevenueTrends(records, periodMode);

  const formatYAxis = (val: number) => {
    if (metricView === 'units') return val.toLocaleString();
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800/80 shadow-xl space-y-4">
      
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Revenue & Financial Performance Over Time
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Time-series analysis of sales trajectory and profit margin flow
          </p>
        </div>

        {/* Aggregation & Metric Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric View Switcher */}
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setMetricView('revenue')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricView === 'revenue' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setMetricView('profit')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricView === 'profit' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Profit ($)
            </button>
            <button
              onClick={() => setMetricView('units')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricView === 'units' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Units Sold
            </button>
          </div>

          {/* Period Mode Switcher */}
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setPeriodMode('daily')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                periodMode === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriodMode('monthly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                periodMode === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriodMode('quarterly')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                periodMode === 'quarterly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={formatYAxis} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel p-3 rounded-xl border border-gray-700 text-xs shadow-2xl space-y-1">
                      <div className="font-bold text-white border-b border-gray-800 pb-1">{label}</div>
                      <div className="text-blue-400 font-semibold">Revenue: ${data.revenue.toLocaleString()}</div>
                      <div className="text-emerald-400 font-semibold">Profit: ${data.profit.toLocaleString()}</div>
                      <div className="text-purple-400 font-semibold">Units Sold: {data.units.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">{data.orders} orders processed</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {metricView === 'revenue' && (
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            )}

            {metricView === 'profit' && (
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            )}

            {metricView === 'units' && (
              <Area
                type="monotone"
                dataKey="units"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorUnits)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
