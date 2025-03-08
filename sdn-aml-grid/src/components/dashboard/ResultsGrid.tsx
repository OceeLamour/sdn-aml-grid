import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  type: string;
  riskScore: number;
  sanctionsList: string;
  dateAdded: string;
  status: "active" | "pending" | "cleared";
}

interface ResultsGridProps {
  onSelectEntity: (entity: Entity) => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ onSelectEntity }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [sortField, setSortField] = useState<keyof Entity>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch entities
    const fetchEntities = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockData: Entity[] = [
          {
            id: '1',
            name: 'ABC Corporation',
            type: 'Organization',
            riskScore: 85,
            sanctionsList: 'OFAC',
            dateAdded: '2025-01-15',
            status: 'active',
          },
          {
            id: '2',
            name: 'John Smith',
            type: 'Individual',
            riskScore: 75,
            sanctionsList: 'EU',
            dateAdded: '2025-02-01',
            status: 'pending',
          },
          {
            id: '3',
            name: 'Global Traders Ltd',
            type: 'Organization',
            riskScore: 62,
            sanctionsList: 'UN',
            dateAdded: '2025-01-20',
            status: 'active',
          },
          {
            id: '4',
            name: 'Maria Rodriguez',
            type: 'Individual',
            riskScore: 45,
            sanctionsList: 'UK',
            dateAdded: '2025-02-10',
            status: 'cleared',
          },
          {
            id: '5',
            name: 'Eastern Shipping Co',
            type: 'Organization',
            riskScore: 92,
            sanctionsList: 'OFAC',
            dateAdded: '2025-01-05',
            status: 'active',
          },
        ];
        setEntities(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchEntities();
  }, []);

  const toggleSort = (field: keyof Entity) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntities = [...entities].sort((a, b) => {
    if (sortField === 'riskScore') {
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
    
    // For string fields
    const aValue = String(a[sortField]).toLowerCase();
    const bValue = String(b[sortField]).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const toggleRowSelection = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAllRows = () => {
    if (selectedRows.length === entities.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(entities.map(entity => entity.id));
    }
  };

  const toggleDropdown = (id: string) => {
    if (showDropdown === id) {
      setShowDropdown(null);
    } else {
      setShowDropdown(id);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'bg-red-100 text-red-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleared':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading results...</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === entities.length && entities.length > 0}
                        onChange={toggleAllRows}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortField === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('type')}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {sortField === 'type' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('riskScore')}
                  >
                    <div className="flex items-center">
                      <span>Risk Score</span>
                      {sortField === 'riskScore' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('sanctionsList')}
                  >
                    <div className="flex items-center">
                      <span>Sanctions List</span>
                      {sortField === 'sanctionsList' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('dateAdded')}
                  >
                    <div className="flex items-center">
                      <span>Date Added</span>
                      {sortField === 'dateAdded' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortField === 'status' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {sortedEntities.map(entity => (
                  <tr
                    key={entity.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => onSelectEntity(entity)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => { e.stopPropagation(); toggleRowSelection(entity.id); }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(entity.id)}
                        onChange={() => {}}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{entity.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                      {entity.type}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getRiskColor(entity.riskScore)}`}>
                          {entity.riskScore}/100
                        </span>
                        {entity.riskScore >= 75 && (
                          <AlertCircle size={16} className="ml-2 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800">
                        {entity.sanctionsList}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                      {new Date(entity.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(entity.status)}`}>
                        {entity.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(entity.id);
                          }}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {showDropdown === entity.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectEntity(entity);
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Export entity', entity.id);
                                }}
                              >
                                Export Data
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Flag entity', entity.id);
                                }}
                              >
                                Flag for Review
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedEntities.length}</span> of{' '}
                  <span className="font-medium">{sortedEntities.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUp className="h-5 w-5 rotate-90" />
                  </button>
                  <button
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-emerald-50 text-sm font-medium text-emerald-600"
                  >
                    1
                  </button>
                  <button
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                  >
                    2
                  </button>
                  <button
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                  >
                    3
                  </button>
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsGrid;
