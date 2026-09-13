import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { Package, AlertTriangle, Sparkles } from 'lucide-react';
import type { SalesRecord } from '../../types/sales';

import { getProductPerformance } from '../../utils/analytics';

interface ProductPerformanceChartProps {
  records: SalesRecord[];
}

export const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ records }) => {
  const [viewBy, setViewBy] = useState<'revenue' | 'units'>('revenue');
  const products = getProductPerformance(records);

  const top10 = products.slice(0, 10);


  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800/80 shadow-xl space-y-5">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400">
              <Package className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top & Underperforming Product Performance
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Ranked products by total gross sales, volume velocity, and net margin health
          </p>
        </div>

        <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setViewBy('revenue')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewBy === 'revenue' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            By Revenue ($)
          </button>
          <button
            onClick={() => setViewBy('units')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewBy === 'units' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            By Units Sold
          </button>
        </div>
      </div>

      {/* Top 10 Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis type="number" stroke="#6b7280" fontSize={11} tickFormatter={(v) => viewBy === 'revenue' ? `$${(v/1000).toFixed(0)}k` : v} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} width={140} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="glass-panel p-3 rounded-xl border border-gray-700 text-xs shadow-2xl space-y-1">
                      <div className="font-bold text-white border-b border-gray-800 pb-1">{d.name}</div>
                      <div className="text-gray-400">Category: {d.category}</div>
                      <div className="text-amber-400 font-semibold">Revenue: {formatCurrency(d.revenue)}</div>
                      <div className="text-purple-400 font-semibold">Units Sold: {d.unitsSold.toLocaleString()}</div>
                      <div className="text-emerald-400 font-semibold">Margin: {d.marginPercent}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={viewBy === 'revenue' ? 'revenue' : 'unitsSold'} radius={[0, 6, 6, 0]}>
              {top10.map((_, idx) => (
                <Cell 
                  key={`cell-${idx}`} 
                  fill={idx === 0 ? '#f59e0b' : idx < 3 ? '#3b82f6' : '#6366f1'} 
                />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranked Product Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
        <table className="w-full text-xs text-left text-gray-300">
          <thead className="bg-gray-800/80 uppercase text-[10px] text-gray-400 font-semibold">
            <tr>
              <th className="px-3 py-2.5">Rank</th>
              <th className="px-3 py-2.5">Product Name</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5 text-right">Avg Price</th>
              <th className="px-3 py-2.5 text-right">Units Sold</th>
              <th className="px-3 py-2.5 text-right">Total Revenue</th>
              <th className="px-3 py-2.5 text-right">Profit Margin</th>
              <th className="px-3 py-2.5 text-center">Health Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-mono">
            {products.map((p, idx) => (
              <tr key={p.name} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-3 py-2 text-gray-500 font-bold">#{idx + 1}</td>
                <td className="px-3 py-2 font-sans font-medium text-white">{p.name}</td>
                <td className="px-3 py-2 font-sans text-gray-400">{p.category}</td>
                <td className="px-3 py-2 text-right">${p.avgPrice}</td>
                <td className="px-3 py-2 text-right">{p.unitsSold.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-semibold text-emerald-400">{formatCurrency(p.revenue)}</td>
                <td className="px-3 py-2 text-right text-gray-300">{p.marginPercent}%</td>
                <td className="px-3 py-2 text-center font-sans">
                  {p.status === 'star' && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                      <Sparkles className="h-3 w-3" />
                      Star Seller
                    </span>
                  )}
                  {p.status === 'underperforming' && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                      <AlertTriangle className="h-3 w-3" />
                      Underperforming
                    </span>
                  )}
                  {p.status === 'steady' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-medium">
                      Steady
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
