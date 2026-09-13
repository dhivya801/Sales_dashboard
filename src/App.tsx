import { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { KPISection } from './components/KPISection';
import { ExecutiveInsights } from './components/ExecutiveInsights';
import { RevenueTrendChart } from './components/Charts/RevenueTrendChart';
import { ProductPerformanceChart } from './components/Charts/ProductPerformanceChart';
import { RegionalDistributionChart } from './components/Charts/RegionalDistributionChart';
import { SalespersonLeaderboard } from './components/Charts/SalespersonLeaderboard';
import { MatrixHeatmap } from './components/Charts/MatrixHeatmap';
import { ComparisonView } from './components/ComparisonView';
import { DataImporter } from './components/DataImporter';
import { DataGridModal } from './components/DataGridModal';
import { MockSqlRunner } from './components/MockSqlRunner';

import type { SalesRecord, FilterState, DatasetPresetKey } from './types/sales';

import { generateDataset } from './utils/dataGenerator';
import { autoCleanDataset, computeQualityReport } from './utils/dataCleaner';
import { calculateKPIs } from './utils/analytics';
import { exportToExcel, exportToCSV, printExecutiveSummaryReport } from './utils/exportUtils';

export function App() {
  // Preset dataset state
  const [currentPreset, setCurrentPreset] = useState<DatasetPresetKey>('saas');
  const [records, setRecords] = useState<SalesRecord[]>(() => generateDataset('saas'));

  // Navigation view state
  const [activeView, setActiveView] = useState<'dashboard' | 'comparison'>('dashboard');

  // Modals state
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isDataGridOpen, setIsDataGridOpen] = useState(false);
  const [isSqlRunnerOpen, setIsSqlRunnerOpen] = useState(false);

  // Global filters state
  const [filters, setFilters] = useState<FilterState>({
    datePreset: 'all',
    startDate: '',
    endDate: '',
    categories: [],
    regions: [],
    salespersons: [],
    customerTypes: [],
    searchTerm: '',
  });

  // Handle Preset change
  const handleSelectPreset = (key: DatasetPresetKey) => {
    setCurrentPreset(key);
    const newRecords = generateDataset(key);
    setRecords(newRecords);
  };

  // Handle Custom Dataset Import
  const handleImportComplete = (importedRecords: SalesRecord[]) => {
    setRecords(importedRecords);
    // Reset active filters on new import
    setFilters({
      datePreset: 'all',
      startDate: '',
      endDate: '',
      categories: [],
      regions: [],
      salespersons: [],
      customerTypes: [],
      searchTerm: '',
    });
  };

  // Handle Auto Clean Action
  const handleAutoClean = () => {
    const cleaned = autoCleanDataset(records);
    setRecords(cleaned);
  };

  // Filter change handler
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      datePreset: 'all',
      startDate: '',
      endDate: '',
      categories: [],
      regions: [],
      salespersons: [],
      customerTypes: [],
      searchTerm: '',
    });
  };

  // Filtered dataset selector
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch =
          r.productName.toLowerCase().includes(term) ||
          r.category.toLowerCase().includes(term) ||
          r.region.toLowerCase().includes(term) ||
          r.salesperson.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Categories multi-select
      if (filters.categories.length > 0 && !filters.categories.includes(r.category)) {
        return false;
      }

      // Regions multi-select
      if (filters.regions.length > 0 && !filters.regions.includes(r.region)) {
        return false;
      }

      // Salespersons multi-select
      if (filters.salespersons.length > 0 && !filters.salespersons.includes(r.salesperson)) {
        return false;
      }

      // Date Presets
      if (filters.datePreset !== 'all' && r.date) {
        const recordDate = new Date(r.date).getTime();
        const now = new Date('2026-09-10').getTime(); // Baseline mock current date
        const dayMs = 24 * 60 * 60 * 1000;

        if (filters.datePreset === '7d' && now - recordDate > 7 * dayMs) return false;
        if (filters.datePreset === '30d' && now - recordDate > 30 * dayMs) return false;
        if (filters.datePreset === 'ytd') {
          const recYear = new Date(r.date).getFullYear();
          if (recYear !== 2026) return false;
        }
      }

      return true;
    });
  }, [records, filters]);

  // Derived metrics
  const kpis = useMemo(() => calculateKPIs(filteredRecords), [filteredRecords]);
  const qualityReport = useMemo(() => computeQualityReport(records), [records]);

  // Available filter options dropdown lists
  const availableCategories = useMemo(() => Array.from(new Set(records.map((r) => r.category))), [records]);
  const availableRegions = useMemo(() => Array.from(new Set(records.map((r) => r.region))), [records]);
  const availableSalespersons = useMemo(() => Array.from(new Set(records.map((r) => r.salesperson))), [records]);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onOpenImporter={() => setIsImporterOpen(true)}
        onOpenDataGrid={() => setIsDataGridOpen(true)}
        onOpenSqlRunner={() => setIsSqlRunnerOpen(true)}
        onExportExcel={() => exportToExcel(filteredRecords)}
        onExportCSV={() => exportToCSV(filteredRecords)}
        onPrintReport={() => printExecutiveSummaryReport(kpis, [])}
        qualityReport={qualityReport}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          availableCategories={availableCategories}
          availableRegions={availableRegions}
          availableSalespersons={availableSalespersons}
          totalFilteredCount={filteredRecords.length}
          totalRecordsCount={records.length}
        />

        {activeView === 'dashboard' ? (
          /* Main Dashboard Layout */
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <KPISection kpis={kpis} />

            {/* AI Executive Intelligence Briefing */}
            <ExecutiveInsights records={filteredRecords} kpis={kpis} />

            {/* Main Time-Series Revenue Trend Chart */}
            <RevenueTrendChart records={filteredRecords} />

            {/* Product & Regional Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductPerformanceChart records={filteredRecords} />
              <RegionalDistributionChart records={filteredRecords} />
            </div>

            {/* Leaderboard & Heatmap Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalespersonLeaderboard records={filteredRecords} />
              <MatrixHeatmap records={filteredRecords} />
            </div>

          </div>
        ) : (
          /* Side-by-Side Comparison Layout */
          <ComparisonView records={filteredRecords} />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-gray-800/80 py-4 px-8 text-center text-xs text-gray-500">
        RevenuePulse Intelligence Engine • Built with React, Vite, Tailwind & Recharts • Enterprise Ready
      </footer>

      {/* Modals */}
      <DataImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <DataGridModal
        isOpen={isDataGridOpen}
        onClose={() => setIsDataGridOpen(false)}
        records={records}
        qualityReport={qualityReport}
        onAutoClean={handleAutoClean}
        onExportCSV={() => exportToCSV(records)}
      />

      <MockSqlRunner
        isOpen={isSqlRunnerOpen}
        onClose={() => setIsSqlRunnerOpen(false)}
        records={records}
      />

    </div>
  );
}

export default App;
