import React from 'react';
import { 
  BarChart3, 
  Upload, 
  Table, 
  Database, 
  Download, 
  Printer, 
  FileSpreadsheet
} from 'lucide-react';
import type { DatasetPresetKey, QualityReport } from '../types/sales';
import { DATASET_PRESETS } from '../utils/dataGenerator';


interface NavbarProps {
  currentPreset: DatasetPresetKey;
  onSelectPreset: (preset: DatasetPresetKey) => void;
  onOpenImporter: () => void;
  onOpenDataGrid: () => void;
  onOpenSqlRunner: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  qualityReport: QualityReport;
  activeView: 'dashboard' | 'comparison';
  onChangeView: (view: 'dashboard' | 'comparison') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPreset,
  onSelectPreset,
  onOpenImporter,
  onOpenDataGrid,
  onOpenSqlRunner,
  onExportExcel,
  onExportCSV,
  onPrintReport,
  qualityReport,
  activeView,
  onChangeView,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-gray-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & View Switcher */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg glow-blue">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-wide">RevenuePulse</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Analytics v2.5
                </span>
              </div>
              <p className="text-xs text-gray-400">Sales & Revenue Intelligence Suite</p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <div className="hidden sm:flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Main Dashboard
            </button>
            <button
              onClick={() => onChangeView('comparison')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'comparison'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Side-by-Side Compare
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Dataset Selector */}
          <div className="relative">
            <select
              value={currentPreset}
              onChange={(e) => onSelectPreset(e.target.value as DatasetPresetKey)}
              className="glass-input text-xs rounded-xl px-3 py-2 bg-gray-900/90 text-gray-200 border border-gray-700/80 focus:border-blue-500 cursor-pointer pr-8 font-medium"
            >
              {DATASET_PRESETS.map((p) => (
                <option key={p.key} value={p.key} className="bg-gray-900 text-white">
                  Preset: {p.title} ({p.recordCount} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Import Data Button */}
          <button
            onClick={onOpenImporter}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Import Excel / CSV
          </button>

          {/* Data Cleaning Grid Button */}
          <button
            onClick={onOpenDataGrid}
            className="relative flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all cursor-pointer"
          >
            <Table className="h-3.5 w-3.5 text-emerald-400" />
            <span>Data Grid & Cleaning</span>
            {qualityReport.errorRows + qualityReport.warningRows > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          {/* Mock SQL Query Console */}
          <button
            onClick={onOpenSqlRunner}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all cursor-pointer"
          >
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span>SQL Console</span>
          </button>

          {/* Export & Report Group */}
          <div className="flex items-center gap-1 border-l border-gray-800 pl-2">
            <button
              onClick={onExportExcel}
              title="Export to Excel (.xlsx)"
              className="p-2 rounded-lg bg-gray-800/60 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-gray-700/60 transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onExportCSV}
              title="Export to CSV (.csv)"
              className="p-2 rounded-lg bg-gray-800/60 hover:bg-blue-950/40 text-blue-400 hover:text-blue-300 border border-gray-700/60 transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onPrintReport}
              title="Print Executive PDF Summary"
              className="p-2 rounded-lg bg-gray-800/60 hover:bg-purple-950/40 text-purple-400 hover:text-purple-300 border border-gray-700/60 transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
