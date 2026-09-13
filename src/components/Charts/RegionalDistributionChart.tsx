import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { Globe, MapPin } from 'lucide-react';
import type { SalesRecord } from '../../types/sales';

import { getRegionalDistribution } from '../../utils/analytics';

interface RegionalDistributionChartProps {
  records: SalesRecord[];
}

const REGION_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export const RegionalDistributionChart: React.FC<RegionalDistributionChartProps> = ({ records }) => {
  const regions = getRegionalDistribution(records);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800/80 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Regional Sales Distribution
            </h3>
            <p className="text-xs text-gray-400">Territory share and market penetration</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Donut + Territory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Donut Chart */}
        <div className="h-60 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={regions}
                dataKey="revenue"
                nameKey="region"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
              >
                {regions.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} stroke="none" />
                ))}

              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-panel p-3 rounded-xl border border-gray-700 text-xs shadow-2xl space-y-1">
                        <div className="font-bold text-white border-b border-gray-800 pb-1">{data.region}</div>
                        <div className="text-emerald-400 font-semibold">Revenue: {formatCurrency(data.revenue)}</div>
                        <div className="text-blue-400 font-semibold">Share: {data.percentage}%</div>
                        <div className="text-purple-400 font-semibold">Units: {data.unitsSold.toLocaleString()}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-gray-400">Territories</span>
            <span className="text-lg font-black text-white">{regions.length}</span>
          </div>
        </div>

        {/* Territory Cards */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {regions.map((r, idx) => (
            <div
              key={r.region}
              className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: REGION_COLORS[idx % REGION_COLORS.length] }}
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {r.region}
                  </div>
                  <div className="text-[10px] text-gray-400">Top category: {r.topCategory}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-emerald-400">{formatCurrency(r.revenue)}</div>
                <div className="text-[10px] font-bold text-gray-400">{r.percentage}% of total</div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
