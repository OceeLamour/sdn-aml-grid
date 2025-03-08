import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing an entity in a sanctions list
 */
export interface IEntity extends Document {
  name: string;
  type: 'Individual' | 'Organization' | 'Vessel' | 'Aircraft' | 'Other';
  alternateNames?: string[];
  identifiers?: {
    type: string;
    value: string;
    country?: string;
    issueDate?: Date;
    expiryDate?: Date;
  }[];
  addresses?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  }[];
  dateOfBirth?: Date;
  placeOfBirth?: string;
  nationality?: string[];
  citizenships?: string[];
  sanctions: {
    listSource: string; // E.g., 'OFAC', 'EU', 'UN', 'UK'
    listName: string; // E.g., 'SDN', 'Consolidated List'
    entryId: string; // Original ID in the sanctions list
    entryUrl?: string; // URL to the original entry
    dateAdded: Date;
    dateRemoved?: Date;
    status: 'Active' | 'Removed' | 'Modified';
    reasonForSanction?: string;
    program?: string[];
  }[];
  relationships?: {
    relatedEntityId: Schema.Types.ObjectId;
    relationType: string; // E.g., 'Director', 'Shareholder', 'Subsidiary'
    relationDescription?: string;
  }[];
  riskScore?: number;
  lastUpdated: Date;
  createdAt: Date;
}

const EntitySchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['Individual', 'Organization', 'Vessel', 'Aircraft', 'Other'],
    index: true
  },
  alternateNames: [String],
  identifiers: [{
    type: { type: String, required: true },
    value: { type: String, required: true },
    country: String,
    issueDate: Date,
    expiryDate: Date
  }],
  addresses: [{
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  }],
  dateOfBirth: Date,
  placeOfBirth: String,
  nationality: [String],
  citizenships: [String],
  sanctions: [{
    listSource: { 
      type: String, 
      required: true,
      index: true
    },
    listName: { 
      type: String, 
      required: true 
    },
    entryId: { 
      type: String, 
      required: true,
      index: true
    },
    entryUrl: String,
    dateAdded: { 
      type: Date, 
      required: true,
      index: true
    },
    dateRemoved: Date,
    status: { 
      type: String, 
      required: true,
      enum: ['Active', 'Removed', 'Modified'],
      index: true
    },
    reasonForSanction: String,
    program: [String]
  }],
  relationships: [{
    relatedEntityId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Entity',
      index: true
    },
    relationType: { 
      type: String, 
      required: true 
    },
    relationDescription: String
  }],
  riskScore: { 
    type: Number,
    min: 0,
    max: 100,
    index: true
  },
  lastUpdated: { 
    type: Date, 
    required: true,
    index: true
  },
  createdAt: { 
    type: Date, 
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'entities'
});

// Create text indexes for search functionality
EntitySchema.index({ name: 'text', 'alternateNames': 'text' });

// Create compound index for efficient filtering
EntitySchema.index({ 'sanctions.listSource': 1, 'sanctions.status': 1 });

export default mongoose.model<IEntity>('Entity', EntitySchema);
