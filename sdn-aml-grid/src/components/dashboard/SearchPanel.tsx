import React, { useState } from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';

interface SearchFilters {
  riskLevel: string[];
  sanctionsList: string[];
  status: string[];
  dateRange: string;
}

const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    riskLevel: [],
    sanctionsList: [],
    status: [],
    dateRange: 'all',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', query, 'with filters:', filters);
    // Implement search functionality here
  };

  const toggleFilter = (category: keyof SearchFilters, value: string) => {
    if (category === 'dateRange') {
      setFilters({
        ...filters,
        dateRange: value,
      });
      return;
    }

    const currentFilters = filters[category] as string[];
    if (currentFilters.includes(value)) {
      setFilters({
        ...filters,
        [category]: currentFilters.filter((item) => item !== value),
      });
    } else {
      setFilters({
        ...filters,
        [category]: [...currentFilters, value],
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      riskLevel: [],
      sanctionsList: [],
      status: [],
      dateRange: 'all',
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.riskLevel.length > 0 ||
      filters.sanctionsList.length > 0 ||
      filters.status.length > 0 ||
      filters.dateRange !== 'all'
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSearch}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search input */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-slate-400" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ID, or keyword..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filters button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
            {hasActiveFilters() && (
              <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                {filters.riskLevel.length + filters.sanctionsList.length + filters.status.length + (filters.dateRange !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Search button */}
          <button
            type="submit"
            className="btn-primary"
          >
            Search
          </button>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Risk Level */}
            <div>
              <h3 className="font-medium mb-2">Risk Level</h3>
              <div className="space-y-2">
                {['High', 'Medium', 'Low'].map((level) => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.riskLevel.includes(level)}
                      onChange={() => toggleFilter('riskLevel', level)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    {level === 'High' && <AlertCircle size={16} className="text-red-500" />}
                    {level === 'Medium' && <AlertCircle size={16} className="text-yellow-500" />}
                    {level === 'Low' && <AlertCircle size={16} className="text-green-500" />}
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Sanctions List */}
            <div>
              <h3 className="font-medium mb-2">Sanctions List</h3>
              <div className="space-y-2">
                {['OFAC', 'EU', 'UN', 'UK'].map((list) => (
                  <label key={list} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.sanctionsList.includes(list)}
                      onChange={() => toggleFilter('sanctionsList', list)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    {list}
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <div className="space-y-2">
                {['Active', 'Pending', 'Cleared'].map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleFilter('status', status)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="font-medium mb-2">Date Added</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={filters.dateRange === option.value}
                      onChange={() => toggleFilter('dateRange', option.value)}
                      className="rounded-full text-emerald-500 focus:ring-emerald-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchPanel;
