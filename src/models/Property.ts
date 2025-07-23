import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  rent: number;
  deposit: number;
  bhk: number;
  furnishing: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
  propertyType: 'Apartment' | 'House' | 'Villa' | 'Studio' | 'PG';
  area: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  isVerified: boolean;
  isActive: boolean;
  availableFrom: Date;
  viewCount: number;
  inquiryCount: number;
  lastViewed?: Date;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  featuredUntil?: Date;
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  rent: { type: Number, required: true, min: 0 },
  deposit: { type: Number, required: true, min: 0 },
  bhk: { type: Number, required: true, min: 1, max: 10 },
  viewCount: { type: Number, default: 0 },
  inquiryCount: { type: Number, default: 0 },
  lastViewed: { type: Date },
  isPremium: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  furnishing: { 
    type: String, 
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'],
    required: true 
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Villa', 'Studio', 'PG'],
    required: true
  },
  area: { type: Number, required: true, min: 1 },
  location: {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { 
      type: String, 
      required: true, 
      match: /^\d{6}$/ 
    },
    coordinates: {
      lat: { 
        type: Number, 
        required: true,
        min: -90,
        max: 90
      },
      lng: { 
        type: Number, 
        required: true,
        min: -180,
        max: 180
      }
    }
  },
  amenities: [{ type: String, trim: true }],
  images: [{ type: String }],
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true, trim: true },
  ownerEmail: { type: String, required: true, trim: true },
  ownerPhone: { 
    type: String, 
    required: false,  // FIXED: Made optional instead of required
    default: '',
    trim: true
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  availableFrom: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for better performance
PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ rent: 1, bhk: 1, furnishing: 1 });
PropertySchema.index({ ownerId: 1 });
PropertySchema.index({ isActive: 1, isVerified: 1 });
PropertySchema.index({ createdAt: -1 });

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
