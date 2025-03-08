import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Plus, Minus, RotateCw } from 'lucide-react';

interface RelationshipVisualizationProps {
  entityId: string;
}

interface Entity {
  id: string;
  name: string;
  type: string;
  riskScore: number;
  flagged: boolean;
}

interface Relationship {
  source: string;
  target: string;
  type: string;
}

const RelationshipVisualization: React.FC<RelationshipVisualizationProps> = ({ entityId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(1);
  const [centerEntity, setCenterEntity] = useState<Entity | null>(null);
  
  useEffect(() => {
    const fetchRelationshipData = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Mock data
        const mockEntities: Entity[] = [
          {
            id: entityId,
            name: 'ABC Corporation',
            type: 'Organization',
            riskScore: 85,
            flagged: true,
          },
          {
            id: '101',
            name: 'John Smith',
            type: 'Individual',
            riskScore: 75,
            flagged: true,
          },
          {
            id: '102',
            name: 'XYZ Holdings',
            type: 'Organization',
            riskScore: 60,
            flagged: false,
          },
          {
            id: '103',
            name: 'Jane Doe',
            type: 'Individual',
            riskScore: 40,
            flagged: false,
          },
          {
            id: '104',
            name: 'Global Trading Ltd',
            type: 'Organization',
            riskScore: 65,
            flagged: false,
          },
        ];
        
        const mockRelationships: Relationship[] = [
          {
            source: entityId,
            target: '101',
            type: 'Director',
          },
          {
            source: entityId,
            target: '102',
            type: 'Subsidiary',
          },
          {
            source: '101',
            target: '103',
            type: 'Family',
          },
          {
            source: '102',
            target: '104',
            type: 'Business Partner',
          },
        ];
        
        setEntities(mockEntities);
        setRelationships(mockRelationships);
        setCenterEntity(mockEntities.find(e => e.id === entityId) || null);
        setLoading(false);
      }, 1500);
    };
    
    fetchRelationshipData();
  }, [entityId]);
  
  useEffect(() => {
    if (loading || !canvasRef.current || !centerEntity) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150 * zoom;
    
    // Calculate entity positions in a circular layout
    const entityPositions = new Map<string, { x: number, y: number }>();
    
    // Center entity
    entityPositions.set(centerEntity.id, { x: centerX, y: centerY });
    
    // Connected entities arranged in a circle
    const connectedEntities = entities.filter(e => 
      e.id !== centerEntity.id && 
      relationships.some(r => 
        (r.source === centerEntity.id && r.target === e.id) || 
        (r.target === centerEntity.id && r.source === e.id)
      )
    );
    
    const angleStep = (2 * Math.PI) / connectedEntities.length;
    
    connectedEntities.forEach((entity, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      entityPositions.set(entity.id, { x, y });
    });
    
    // Second-level connections
    const secondLevelEntities = entities.filter(e => 
      e.id !== centerEntity.id && 
      !connectedEntities.some(ce => ce.id === e.id) &&
      relationships.some(r => 
        connectedEntities.some(ce => 
          (r.source === ce.id && r.target === e.id) || 
          (r.target === ce.id && r.source === e.id)
        )
      )
    );
    
    secondLevelEntities.forEach((entity) => {
      // Find which first-level entity this is connected to
      const connectedTo = connectedEntities.find(ce => 
        relationships.some(r => 
          (r.source === ce.id && r.target === entity.id) || 
          (r.target === ce.id && r.source === entity.id)
        )
      );
      
      if (connectedTo && entityPositions.has(connectedTo.id)) {
        const parentPos = entityPositions.get(connectedTo.id)!;
        const angleToCenter = Math.atan2(parentPos.y - centerY, parentPos.x - centerX);
        const extraRadius = 80 * zoom;
        const x = parentPos.x + extraRadius * Math.cos(angleToCenter);
        const y = parentPos.y + extraRadius * Math.sin(angleToCenter);
        entityPositions.set(entity.id, { x, y });
      }
    });
    
    // Draw relationships
    ctx.lineWidth = 2 * zoom;
    relationships.forEach(rel => {
      const sourcePos = entityPositions.get(rel.source);
      const targetPos = entityPositions.get(rel.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        
        // Different colors for different relationship types
        switch (rel.type) {
          case 'Director':
            ctx.strokeStyle = '#3B82F6'; // blue
            break;
          case 'Subsidiary':
            ctx.strokeStyle = '#10B981'; // green
            break;
          case 'Family':
            ctx.strokeStyle = '#F59E0B'; // yellow
            break;
          case 'Business Partner':
            ctx.strokeStyle = '#8B5CF6'; // purple
            break;
          default:
            ctx.strokeStyle = '#6B7280'; // gray
        }
        
        ctx.stroke();
        
        // Draw relationship type label
        const labelX = (sourcePos.x + targetPos.x) / 2;
        const labelY = (sourcePos.y + targetPos.y) / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(labelX - 50, labelY - 10, 100, 20);
        ctx.font = `${12 * zoom}px Arial`;
        ctx.fillStyle = '#1F2937';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rel.type, labelX, labelY);
      }
    });
    
    // Draw entities
    entities.forEach(entity => {
      const pos = entityPositions.get(entity.id);
      if (!pos) return;
      
      // Entity circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25 * zoom, 0, 2 * Math.PI);
      
      // Fill color based on risk score and flagged status
      if (entity.flagged) {
        ctx.fillStyle = '#FEE2E2'; // red-100
      } else if (entity.riskScore >= 75) {
        ctx.fillStyle = '#FEF3C7'; // yellow-100
      } else {
        ctx.fillStyle = '#ECFDF5'; // green-100
      }
      
      ctx.fill();
      
      // Border color based on entity type
      if (entity.type === 'Organization') {
        ctx.strokeStyle = '#1E40AF'; // blue-800
      } else {
        ctx.strokeStyle = '#4F46E5'; // indigo-600
      }
      
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      
      // Entity name
      ctx.font = `bold ${12 * zoom}px Arial`;
      ctx.fillStyle = '#1F2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Handle long names by truncating
      let displayName = entity.name;
      if (displayName.length > 15) {
        displayName = displayName.substring(0, 12) + '...';
      }
      
      ctx.fillText(displayName, pos.x, pos.y);
      
      // Risk score indicator for flagged entities
      if (entity.flagged) {
        ctx.beginPath();
        ctx.arc(pos.x + 20 * zoom, pos.y - 20 * zoom, 8 * zoom, 0, 2 * Math.PI);
        ctx.fillStyle = '#EF4444'; // red-500
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${10 * zoom}px Arial`;
        ctx.fillText('!', pos.x + 20 * zoom, pos.y - 20 * zoom);
      }
    });
    
  }, [loading, entities, relationships, centerEntity, zoom]);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleReset = () => {
    setZoom(1);
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Relationship Network</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleZoomIn}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button 
            onClick={handleReset}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Reset view"
          >
            <RotateCw size={20} />
          </button>
        </div>
      </div>
      
      <div className="relative flex-1 bg-slate-50 rounded-lg overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            <canvas 
              ref={canvasRef} 
              width={700} 
              height={550}
              className="w-full h-full"
            />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md text-sm">
              <div className="font-medium mb-2">Relationship Types</div>
              {[
                { type: 'Director', color: '#3B82F6' },
                { type: 'Subsidiary', color: '#10B981' },
                { type: 'Family', color: '#F59E0B' },
                { type: 'Business Partner', color: '#8B5CF6' },
              ].map(item => (
                <div key={item.type} className="flex items-center mb-1">
                  <div className="w-3 h-3 mr-2" style={{ backgroundColor: item.color }}></div>
                  <span>{item.type}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RelationshipVisualization;
