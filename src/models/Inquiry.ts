import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  propertyId: string;
  ownerId: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>({
  propertyId: { type: String, required: true },
  ownerId: { type: String, required: true },
  tenantId: { type: String, required: true },
  tenantName: { type: String, required: true },
  tenantEmail: { type: String, required: true },
  tenantPhone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'responded', 'closed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);
