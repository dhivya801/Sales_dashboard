import React, { useState } from 'react';
import { 
  Table, 
  X, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  Download
} from 'lucide-react';
import type { SalesRecord, QualityReport, QualityStatus } from '../types/sales';


interface DataGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SalesRecord[];
  qualityReport: QualityReport;
  onAutoClean: () => void;
  onExportCSV: () => void;
}

export const DataGridModal: React.FC<DataGridModalProps> = ({
  isOpen,
  onClose,
  records,
  qualityReport,
  onAutoClean,
  onExportCSV,
}) => {
  const [filterTab, setFilterTab] = useState<QualityStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    // Filter tab rule
    if (filterTab === 'clean' && (r.hasErrors || r.hasWarnings)) return false;
    if (filterTab === 'warnings' && !r.hasWarnings) return false;
    if (filterTab === 'errors' && !r.hasErrors) return false;

    // Search term rule
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.productName.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        r.region.toLowerCase().includes(term) ||
        r.salesperson.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term)
      );
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-6xl rounded-2xl border border-gray-700/80 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Table className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sales Data Grid & Quality Suite</h2>
              <p className="text-xs text-gray-400">
                Inspect raw rows, audit validation warnings, and execute automated data cleaning
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onAutoClean}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              One-Click Auto-Clean
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quality Audit Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-gray-800">
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">Total Records</span>
            <strong className="text-base text-white">{qualityReport.totalRows}</strong>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Clean</span>
            <strong className="text-base text-emerald-400">{qualityReport.cleanRows}</strong>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-amber-400 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Warnings</span>
            <strong className="text-base text-amber-400">{qualityReport.warningRows}</strong>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
            <span className="text-xs text-rose-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Errors</span>
            <strong className="text-base text-rose-400">{qualityReport.errorRows}</strong>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3">
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            {(['all', 'clean', 'warnings', 'errors'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  filterTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full rounded-xl pl-9 pr-3 py-1 text-xs bg-gray-900 border border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Interactive Data Table */}
        <div className="overflow-x-auto overflow-y-auto flex-1 rounded-xl border border-gray-800 bg-gray-900/40">
          <table className="w-full text-xs text-left text-gray-300">
            <thead className="bg-gray-800/90 text-gray-400 uppercase text-[10px] sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5">Order ID</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Product Name</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Unit Price</th>
                <th className="px-3 py-2.5 text-right">Total Revenue</th>
                <th className="px-3 py-2.5">Region</th>
                <th className="px-3 py-2.5">Salesperson</th>
                <th className="px-3 py-2.5 text-center">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filteredRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-3 py-2 text-gray-400 font-bold">{r.id}</td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2 font-sans font-medium text-white max-w-[160px] truncate" title={r.productName}>
                    {r.productName}
                  </td>
                  <td className="px-3 py-2 font-sans text-gray-400">{r.category}</td>
                  <td className="px-3 py-2 text-right">{r.quantity}</td>
                  <td className="px-3 py-2 text-right">${r.unitPrice}</td>
                  <td className="px-3 py-2 text-right text-emerald-400 font-semibold">${r.revenue}</td>
                  <td className="px-3 py-2 font-sans">{r.region}</td>
                  <td className="px-3 py-2 font-sans text-gray-400">{r.salesperson}</td>
                  <td className="px-3 py-2 text-center font-sans">
                    {r.hasErrors ? (
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 font-bold" title={r.errorMessages?.join(', ')}>
                        <XCircle className="h-3 w-3" /> Error
                      </span>
                    ) : r.hasWarnings ? (
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-bold" title={r.warningMessages?.join(', ')}>
                        <AlertTriangle className="h-3 w-3" /> Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Clean
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Showing {filteredRecords.length} of {records.length} records
          </span>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Download Table CSV
          </button>
        </div>

      </div>
    </div>
  );
};
