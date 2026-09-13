import React from 'react';
import { Layers } from 'lucide-react';
import type { SalesRecord } from '../../types/sales';

import { getCategoryMatrix } from '../../utils/analytics';

interface MatrixHeatmapProps {
  records: SalesRecord[];
}

export const MatrixHeatmap: React.FC<MatrixHeatmapProps> = ({ records }) => {
  const matrix = getCategoryMatrix(records);

  const categories = Array.from(new Set(matrix.map((m) => m.category)));
  const regions = Array.from(new Set(matrix.map((m) => m.region)));

  const maxRevenue = Math.max(...matrix.map((m) => m.revenue), 1);

  const getCellColor = (rev: number) => {
    if (rev === 0) return 'bg-gray-900/40 text-gray-600 border border-gray-800';
    const ratio = rev / maxRevenue;
    if (ratio > 0.75) return 'bg-blue-600/90 text-white font-black border border-blue-400/50 shadow-md';
    if (ratio > 0.4) return 'bg-blue-700/60 text-blue-100 font-bold border border-blue-500/30';
    if (ratio > 0.15) return 'bg-blue-900/40 text-blue-200 font-medium border border-blue-800/40';
    return 'bg-blue-950/20 text-blue-300 border border-blue-900/30';
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800/80 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Category vs Territory Cross-Tab Heatmap
            </h3>
            <p className="text-xs text-gray-400">Matrix grid showing revenue density across regions</p>
          </div>
        </div>
      </div>

      {/* Cross-Tab Heatmap Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-gray-900/90 text-gray-400 uppercase text-[10px]">
              <th className="p-3 text-left border-b border-r border-gray-800 font-bold">Category \ Region</th>
              {regions.map((r) => (
                <th key={r} className="p-3 border-b border-r border-gray-800 font-bold max-w-[100px]">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat} className="border-b border-gray-800/80">
                <td className="p-3 text-left font-bold text-white bg-gray-900/60 border-r border-gray-800">
                  {cat}
                </td>
                {regions.map((reg) => {
                  const cell = matrix.find((m) => m.category === cat && m.region === reg);
                  const rev = cell ? cell.revenue : 0;
                  const pct = cell ? cell.percentage : 0;

                  return (
                    <td key={reg} className={`p-3 border-r border-gray-800 transition-all ${getCellColor(rev)}`}>
                      <div className="font-mono text-xs">{formatCurrency(rev)}</div>
                      {rev > 0 && <div className="text-[9px] opacity-80">{pct}% share</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
