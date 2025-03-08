import React, { useState } from "react";
import Header from "../dashboard/Header";
import SearchPanel from "../dashboard/SearchPanel";
import ResultsGrid from "../dashboard/ResultsGrid";
import EntityDetailCard from "../dashboard/EntityDetailCard";
import BatchUploadWizard from "../dashboard/BatchUploadWizard";
import RelationshipVisualization from "../dashboard/RelationshipVisualization";

interface Entity {
  id: string;
  name: string;
  type: string;
  riskScore: number;
  sanctionsList: string;
  dateAdded: string;
  status: "active" | "pending" | "cleared";
}

const Home: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showEntityDetails, setShowEntityDetails] = useState<boolean>(false);
  const [showRelationships, setShowRelationships] = useState<boolean>(false);
  const [showBatchUpload, setShowBatchUpload] = useState<boolean>(false);

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowEntityDetails(true);
  };

  const handleViewRelationships = () => {
    setShowEntityDetails(false);
    setShowRelationships(true);
  };

  const handleCloseEntityDetails = () => {
    setShowEntityDetails(false);
  };

  const handleCloseRelationships = () => {
    setShowRelationships(false);
  };

  const handleOpenBatchUpload = () => {
    setShowBatchUpload(true);
  };

  const handleCloseBatchUpload = () => {
    setShowBatchUpload(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sanctions Screening Dashboard</h1>
          <button
            onClick={handleOpenBatchUpload}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Batch Upload
          </button>
        </div>

        <SearchPanel />

        <ResultsGrid onSelectEntity={handleEntitySelect} />

        {/* Entity Details Modal */}
        {showEntityDetails && selectedEntity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative">
              <EntityDetailCard
                entity={{
                  id: selectedEntity.id,
                  name: selectedEntity.name,
                  type: selectedEntity.type,
                  riskScore: selectedEntity.riskScore,
                  sanctionsList: [selectedEntity.sanctionsList],
                }}
                onClose={handleCloseEntityDetails}
              />
              <button
                onClick={handleViewRelationships}
                className="absolute bottom-4 right-4 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
              >
                View Relationships
              </button>
            </div>
          </div>
        )}

        {/* Relationship Visualization Modal */}
        {showRelationships && selectedEntity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[750px] h-[600px] p-6 relative">
              <button
                onClick={handleCloseRelationships}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <RelationshipVisualization entityId={selectedEntity.id} />
            </div>
          </div>
        )}

        {/* Batch Upload Wizard */}
        {showBatchUpload && (
          <BatchUploadWizard
            isOpen={showBatchUpload}
            onClose={handleCloseBatchUpload}
          />
        )}
      </main>

      <footer className="py-4 px-6 bg-white border-t text-center text-sm text-gray-500">
        AML Compliance Dashboard © {new Date().getFullYear()} - Sanctions
        Screening System
      </footer>
    </div>
  );
};

export default Home;
