import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import type { SalesRecord, KPISummary } from '../types/sales';

import { generateAIExecutiveSummary } from '../utils/analytics';

interface ExecutiveInsightsProps {
  records: SalesRecord[];
  kpis: KPISummary;
}

export const ExecutiveInsights: React.FC<ExecutiveInsightsProps> = ({ records, kpis }) => {
  const insights = generateAIExecutiveSummary(records, kpis);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-blue-500/30 shadow-2xl relative overflow-hidden mb-6">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-800">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md glow-blue">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            AI Executive Intelligence Briefing
          </h3>
          <p className="text-xs text-gray-400">Automated strategic observations & business performance diagnosis</p>
        </div>
      </div>

      {/* Insight Bullet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-blue-500/30 transition-all flex items-start gap-3 group"
          >
            <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              {insight}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
