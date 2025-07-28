import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  message: string;
  status: 'pending' | 'replied' | 'interested' | 'not_interested' | 'closed';
  replies: Array<{
    senderId: string;
    senderName: string;
    senderRole: 'tenant' | 'owner';
    message: string;
    timestamp: Date;
  }>;
  moveInDate?: Date;
  budget?: number;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>({
  propertyId: { type: String, required: true },
  propertyTitle: { type: String, required: true },
  tenantId: { type: String, required: true },
  tenantName: { type: String, required: true },
  tenantEmail: { type: String, required: true },
  tenantPhone: { type: String, required: true },
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'replied', 'interested', 'not_interested', 'closed'],
    default: 'pending'
  },
  replies: [{
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['tenant', 'owner'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  moveInDate: { type: Date },
  budget: { type: Number },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for better performance
InquirySchema.index({ propertyId: 1, status: 1 });
InquirySchema.index({ tenantId: 1, status: 1 });
InquirySchema.index({ ownerId: 1, status: 1 });
InquirySchema.index({ createdAt: -1 });

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);
