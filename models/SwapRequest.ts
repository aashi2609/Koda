import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISwapRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestSchema = new Schema<ISwapRequest>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index on senderId for querying outgoing requests
SwapRequestSchema.index({ senderId: 1 });

// Index on receiverId for querying incoming requests
SwapRequestSchema.index({ receiverId: 1 });

// Compound index on (senderId, receiverId, status) for duplicate prevention
// This ensures we can efficiently check for existing pending requests
SwapRequestSchema.index({ senderId: 1, receiverId: 1, status: 1 });

// Prevent model recompilation in development (Next.js hot reload)
const SwapRequest: Model<ISwapRequest> =
  mongoose.models.SwapRequest || mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);

export default SwapRequest;
