import mongoose, { Schema, Document } from 'mongoose';

export interface IRequirement extends Document {
  title: string;
  description: string;
  maxRent: number;
  bhk: number;
  furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished' | 'Any';
  propertyType: 'Apartment' | 'House' | 'Villa' | 'Studio' | 'PG' | 'Any';
  location: {
    city: string;
    state: string;
    preferredAreas: string[];
  };
  amenities: string[];
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RequirementSchema = new Schema<IRequirement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  maxRent: { type: Number, required: true },
  bhk: { type: Number, required: true },
  furnishing: { 
    type: String, 
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished', 'Any'],
    required: true 
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Villa', 'Studio', 'PG', 'Any'],
    required: true
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    preferredAreas: [{ type: String }]
  },
  amenities: [{ type: String }],
  tenantId: { type: String, required: true },
  tenantName: { type: String, required: true },
  tenantEmail: { type: String, required: true },
  tenantPhone: { type: String, required: true },
  moveInDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Requirement || mongoose.model<IRequirement>('Requirement', RequirementSchema);