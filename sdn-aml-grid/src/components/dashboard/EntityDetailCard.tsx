import React from 'react';
import { X, AlertCircle, User, Building, Calendar, List, ExternalLink, Download } from 'lucide-react';

interface EntityDetailProps {
  entity: {
    id: string;
    name: string;
    type: string;
    riskScore: number;
    sanctionsList: string[];
  };
  onClose: () => void;
}

const EntityDetailCard: React.FC<EntityDetailProps> = ({ entity, onClose }) => {
  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold text-slate-800">Entity Details</h2>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Entity identification */}
        <div className="mb-6">
          <div className="flex items-start">
            <div className="bg-slate-100 p-3 rounded-full mr-4">
              {entity.type === 'Individual' ? (
                <User size={24} className="text-slate-600" />
              ) : (
                <Building size={24} className="text-slate-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{entity.name}</h3>
              <div className="flex items-center mt-1 text-slate-500">
                <span className="mr-2">{entity.type}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100">ID: {entity.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk score */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-700">Risk Score</h4>
            <div className="flex items-center">
              <span className={`text-xl font-bold ${getRiskColor(entity.riskScore)}`}>
                {entity.riskScore}/100
              </span>
              {entity.riskScore >= 75 && (
                <AlertCircle size={18} className="ml-2 text-red-500" />
              )}
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                entity.riskScore >= 75 
                  ? 'bg-red-500' 
                  : entity.riskScore >= 50 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${entity.riskScore}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {entity.riskScore >= 75 
              ? 'High risk - Immediate review recommended' 
              : entity.riskScore >= 50 
              ? 'Medium risk - Monitor closely' 
              : 'Low risk - Standard monitoring'
            }
          </p>
        </div>

        {/* Sanctions Lists */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <List size={18} className="text-slate-500 mr-2" />
            <h4 className="font-semibold text-slate-700">Sanctions Lists</h4>
          </div>
          <div className="space-y-2">
            {entity.sanctionsList.map((list, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <span className="text-slate-700">{list}</span>
                <a 
                  href="#" 
                  className="text-emerald-500 hover:text-emerald-600 text-sm flex items-center"
                  onClick={(e) => e.preventDefault()}
                >
                  <ExternalLink size={14} className="mr-1" />
                  View Source
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Calendar size={18} className="text-slate-500 mr-2" />
            <h4 className="font-semibold text-slate-700">Additional Information</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-slate-50 rounded-md">
              <span className="text-slate-500">Added to watchlist</span>
              <span className="text-slate-700 font-medium">Jan 15, 2025</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-md">
              <span className="text-slate-500">Last updated</span>
              <span className="text-slate-700 font-medium">Feb 28, 2025</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-md">
              <span className="text-slate-500">Status</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 p-4 border-t flex justify-between items-center">
        <button 
          className="text-slate-600 hover:text-slate-800 text-sm flex items-center"
          onClick={() => console.log('Export entity data')}
        >
          <Download size={16} className="mr-1" />
          Export Data
        </button>
        <div className="space-x-2">
          <button 
            className="px-4 py-2 border border-emerald-500 text-emerald-500 rounded-md hover:bg-emerald-50 transition-colors"
            onClick={() => console.log('Adding note to entity')}
          >
            Add Note
          </button>
          <button 
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            onClick={() => console.log('Escalating entity')}
          >
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntityDetailCard;
