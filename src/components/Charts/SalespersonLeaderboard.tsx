import React from 'react';
import { Users, Award } from 'lucide-react';
import type { SalesRecord } from '../../types/sales';

import { getSalespersonLeaderboard } from '../../utils/analytics';

interface SalespersonLeaderboardProps {
  records: SalesRecord[];
}

export const SalespersonLeaderboard: React.FC<SalespersonLeaderboardProps> = ({ records }) => {
  const reps = getSalespersonLeaderboard(records);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800/80 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Sales Representative Quota Leaderboard
            </h3>
            <p className="text-xs text-gray-400">Target attainment ($150k quota) & deal volume</p>
          </div>
        </div>
      </div>

      {/* Rep List Cards */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {reps.map((rep, idx) => (
          <div
            key={rep.name}
            className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-indigo-500/40 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-amber-500 text-gray-950 glow-amber' : 'bg-gray-800 text-gray-300'
                }`}>
                  #{idx + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {rep.name}
                    {idx === 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Award className="h-3 w-3" /> Top Rep
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400">{rep.region} • {rep.dealsClosed} deals closed (Avg ${rep.avgDealSize.toLocaleString()})</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-indigo-400">{formatCurrency(rep.revenue)}</div>
                <div className="text-[10px] text-gray-400 font-bold">{rep.achievementRate}% of target</div>
              </div>
            </div>

            {/* Target Progress Meter Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rep.achievementRate >= 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(rep.achievementRate, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
