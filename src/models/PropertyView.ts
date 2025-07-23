import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertyView extends Document {
  propertyId: string;
  userId?: string;
  userAgent: string;
  ip: string;
  viewedAt: Date;
}

const PropertyViewSchema = new Schema<IPropertyView>({
  propertyId: { type: String, required: true },
  userId: { type: String },
  userAgent: { type: String, required: true },
  ip: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now },
});

PropertyViewSchema.index({ propertyId: 1, viewedAt: -1 });

export default mongoose.models.PropertyView || mongoose.model<IPropertyView>('PropertyView', PropertyViewSchema);
