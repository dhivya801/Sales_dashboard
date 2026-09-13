import React from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  Globe, 
  Tag, 
  Users, 
  RotateCcw, 
  X 
} from 'lucide-react';
import type { FilterState } from '../types/sales';


interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableCategories: string[];
  availableRegions: string[];
  availableSalespersons: string[];
  totalFilteredCount: number;
  totalRecordsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableCategories,
  availableRegions,
  availableSalespersons,
  totalFilteredCount,
  totalRecordsCount,
}) => {
  const activeFiltersCount = 
    (filters.datePreset !== 'all' ? 1 : 0) +
    filters.categories.length +
    filters.regions.length +
    filters.salespersons.length +
    (filters.searchTerm ? 1 : 0);

  const toggleArrayItem = (current: string[], item: string): string[] => {
    if (current.includes(item)) {
      return current.filter((x) => x !== item);
    }
    return [...current, item];
  };

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 border border-gray-800/80 shadow-xl space-y-4">
      
      {/* Top Filter Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Global Filters & Slicers</h2>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                  {activeFiltersCount} Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              Showing <strong className="text-blue-400 font-semibold">{totalFilteredCount}</strong> of {totalRecordsCount} records
            </p>
          </div>
        </div>

        {/* Search Bar & Reset Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, order ID, rep..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              className="glass-input w-full rounded-xl pl-9 pr-3 py-1.5 text-xs bg-gray-900/80 border border-gray-700/80 placeholder-gray-500 focus:border-blue-500 transition-all"
            />
            {filters.searchTerm && (
              <button
                onClick={() => onFilterChange({ searchTerm: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-rose-950/40 text-gray-300 hover:text-rose-300 border border-gray-700/80 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Slicers Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-800/80">
        
        {/* Date Presets */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <Calendar className="h-3 w-3 text-blue-400" />
            Date Period
          </label>
          <div className="grid grid-cols-5 gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            {(['all', '30d', 'ytd', '7d'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => onFilterChange({ datePreset: preset })}
                className={`py-1 text-[11px] font-bold rounded-lg uppercase transition-all ${
                  filters.datePreset === preset
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Multi-Select Dropdown */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <Tag className="h-3 w-3 text-purple-400" />
            Product Category ({filters.categories.length || 'All'})
          </label>
          <select
            onChange={(e) => {
              if (e.target.value === 'all') {
                onFilterChange({ categories: [] });
              } else {
                onFilterChange({ categories: toggleArrayItem(filters.categories, e.target.value) });
              }
            }}
            value=""
            className="glass-input w-full rounded-xl px-3 py-1.5 text-xs bg-gray-900/80 border border-gray-700/80 text-gray-200"
          >
            <option value="" disabled>Select category to filter...</option>
            <option value="all">-- All Categories --</option>
            {availableCategories.map((c) => (
              <option key={c} value={c} className="bg-gray-900 text-white">
                {filters.categories.includes(c) ? '✓ ' : ''}{c}
              </option>
            ))}
          </select>
        </div>

        {/* Regions Multi-Select Dropdown */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <Globe className="h-3 w-3 text-emerald-400" />
            Sales Territory ({filters.regions.length || 'All'})
          </label>
          <select
            onChange={(e) => {
              if (e.target.value === 'all') {
                onFilterChange({ regions: [] });
              } else {
                onFilterChange({ regions: toggleArrayItem(filters.regions, e.target.value) });
              }
            }}
            value=""
            className="glass-input w-full rounded-xl px-3 py-1.5 text-xs bg-gray-900/80 border border-gray-700/80 text-gray-200"
          >
            <option value="" disabled>Select region to filter...</option>
            <option value="all">-- All Territories --</option>
            {availableRegions.map((r) => (
              <option key={r} value={r} className="bg-gray-900 text-white">
                {filters.regions.includes(r) ? '✓ ' : ''}{r}
              </option>
            ))}
          </select>
        </div>

        {/* Salesperson Dropdown */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <Users className="h-3 w-3 text-amber-400" />
            Sales Representative ({filters.salespersons.length || 'All'})
          </label>
          <select
            onChange={(e) => {
              if (e.target.value === 'all') {
                onFilterChange({ salespersons: [] });
              } else {
                onFilterChange({ salespersons: toggleArrayItem(filters.salespersons, e.target.value) });
              }
            }}
            value=""
            className="glass-input w-full rounded-xl px-3 py-1.5 text-xs bg-gray-900/80 border border-gray-700/80 text-gray-200"
          >
            <option value="" disabled>Select salesperson...</option>
            <option value="all">-- All Sales Representatives --</option>
            {availableSalespersons.map((s) => (
              <option key={s} value={s} className="bg-gray-900 text-white">
                {filters.salespersons.includes(s) ? '✓ ' : ''}{s}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Selected Filter Tags Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {filters.categories.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30 font-medium"
            >
              {c}
              <X
                className="h-3 w-3 cursor-pointer hover:text-white"
                onClick={() => onFilterChange({ categories: filters.categories.filter((x) => x !== c) })}
              />
            </span>
          ))}
          {filters.regions.map((r) => (
            <span
              key={r}
              className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium"
            >
              {r}
              <X
                className="h-3 w-3 cursor-pointer hover:text-white"
                onClick={() => onFilterChange({ regions: filters.regions.filter((x) => x !== r) })}
              />
            </span>
          ))}
          {filters.salespersons.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium"
            >
              {s}
              <X
                className="h-3 w-3 cursor-pointer hover:text-white"
                onClick={() => onFilterChange({ salespersons: filters.salespersons.filter((x) => x !== s) })}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
