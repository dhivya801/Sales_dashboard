import React, { useState } from 'react';
import { Database, Play, X, Terminal } from 'lucide-react';
import type { SalesRecord } from '../types/sales';


interface MockSqlRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  records: SalesRecord[];
}

export const MockSqlRunner: React.FC<MockSqlRunnerProps> = ({ isOpen, onClose, records }) => {
  const PRESET_QUERIES = [
    {
      title: 'Revenue & Orders by Sales Region',
      query: 'SELECT region, COUNT(id) AS orders, SUM(quantity) AS units, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC',
    },
    {
      title: 'Top 5 Best-Selling Products',
      query: 'SELECT productName, category, SUM(revenue) AS revenue, AVG(profitMargin) AS avg_margin FROM sales GROUP BY productName ORDER BY revenue DESC LIMIT 5',
    },
    {
      title: 'Salesperson Quota Performance',
      query: 'SELECT salesperson, region, COUNT(id) AS deals, SUM(revenue) AS revenue FROM sales GROUP BY salesperson ORDER BY revenue DESC',
    },
  ];

  const [currentQuery, setCurrentQuery] = useState(PRESET_QUERIES[0].query);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const executeQuery = (queryText: string) => {
    const q = queryText.toLowerCase();

    // Query 1: Group by region
    if (q.includes('group by region')) {
      const map: { [r: string]: { region: string; orders: number; units: number; total_revenue: number } } = {};
      records.forEach((r) => {
        const reg = r.region || 'Unassigned';
        if (!map[reg]) map[reg] = { region: reg, orders: 0, units: 0, total_revenue: 0 };
        map[reg].orders += 1;
        map[reg].units += r.quantity;
        map[reg].total_revenue += r.revenue;
      });
      const res = Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue);
      setQueryResult(res.map((row) => ({ ...row, total_revenue: `$${Math.round(row.total_revenue).toLocaleString()}` })));
      return;
    }

    // Query 2: Top 5 products
    if (q.includes('group by productname')) {
      const map: { [p: string]: { productName: string; category: string; revenue: number; marginTotal: number; count: number } } = {};
      records.forEach((r) => {
        if (!map[r.productName]) map[r.productName] = { productName: r.productName, category: r.category, revenue: 0, marginTotal: 0, count: 0 };
        map[r.productName].revenue += r.revenue;
        map[r.productName].marginTotal += r.profitMargin;
        map[r.productName].count += 1;
      });
      const res = Object.values(map)
        .map((p) => ({
          productName: p.productName,
          category: p.category,
          revenue: `$${Math.round(p.revenue).toLocaleString()}`,
          avg_margin: `${(p.marginTotal / p.count).toFixed(1)}%`,
        }))
        .sort((a, b) => parseFloat(b.revenue.replace(/[\$,]/g, '')) - parseFloat(a.revenue.replace(/[\$,]/g, '')))
        .slice(0, 5);
      setQueryResult(res);
      return;
    }

    // Query 3: Salesperson performance
    if (q.includes('group by salesperson')) {
      const map: { [s: string]: { salesperson: string; region: string; deals: number; revenue: number } } = {};
      records.forEach((r) => {
        const s = r.salesperson || 'Unassigned';
        if (!map[s]) map[s] = { salesperson: s, region: r.region, deals: 0, revenue: 0 };
        map[s].deals += 1;
        map[s].revenue += r.revenue;
      });
      const res = Object.values(map)
        .map((row) => ({ ...row, revenue: `$${Math.round(row.revenue).toLocaleString()}` }))
        .sort((a, b) => parseFloat(b.revenue.replace(/[\$,]/g, '')) - parseFloat(a.revenue.replace(/[\$,]/g, '')));
      setQueryResult(res);
      return;
    }

    // Default fallback query output
    setQueryResult(records.slice(0, 10).map((r) => ({
      id: r.id,
      date: r.date,
      product: r.productName,
      revenue: `$${r.revenue}`,
      region: r.region,
    })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-gray-700/80 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive SQL Analytics Console</h2>
              <p className="text-xs text-gray-400">Query connected sales database table in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Console Body */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESET_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQuery(pq.query);
                  executeQuery(pq.query);
                }}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
              >
                Preset {idx + 1}: {pq.title}
              </button>
            ))}
          </div>

          {/* SQL Editor Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-purple-400" /> SQL Query Command</span>
              <button
                onClick={() => executeQuery(currentQuery)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" /> Execute SQL Query
              </button>
            </div>
            <textarea
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              rows={3}
              className="w-full font-mono text-xs p-3 rounded-xl bg-gray-950 border border-gray-800 text-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Result Table */}
          {queryResult && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2">
                <span>Query Result Output ({queryResult.length} rows returned)</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/60 max-h-56">
                <table className="w-full text-xs text-left text-gray-300 font-mono">
                  <thead className="bg-gray-800/80 text-gray-400 uppercase text-[10px]">
                    <tr>
                      {Object.keys(queryResult[0] || {}).map((col) => (
                        <th key={col} className="px-3 py-2">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/40">
                        {Object.values(row).map((val: any, colIdx) => (
                          <td key={colIdx} className="px-3 py-2">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
