import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: string;
  propertyId: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  userId: { type: String, required: true },
  propertyId: { type: String, required: true }
}, {
  timestamps: true
});

BookmarkSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export default mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);