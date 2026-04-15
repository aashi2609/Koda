import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMilestone {
  _id?: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface IResource {
  _id?: mongoose.Types.ObjectId;
  label: string;
  url: string;
}

export interface IChatMessage {
  _id?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  timestamp: Date;
}

export interface ISwapRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'negotiating' | 'active' | 'completed' | 'rejected';
  skillBeingSwapped: string;
  milestones: mongoose.Types.DocumentArray<IMilestone>;
  resources: mongoose.Types.DocumentArray<IResource>;
  chatMessages: mongoose.Types.DocumentArray<IChatMessage>;
  learnerMarked: boolean;
  mentorVerified: boolean;
  jitsiRoomId: string;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const ResourceSchema = new Schema<IResource>({
  label: { type: String, required: true },
  url: { type: String, required: true },
});

const ChatMessageSchema = new Schema<IChatMessage>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

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
        values: ['pending', 'negotiating', 'active', 'completed', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    skillBeingSwapped: {
      type: String,
      default: '',
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },
    resources: {
      type: [ResourceSchema],
      default: [],
    },
    chatMessages: {
      type: [ChatMessageSchema],
      default: [],
    },
    learnerMarked: {
      type: Boolean,
      default: false,
    },
    mentorVerified: {
      type: Boolean,
      default: false,
    },
    jitsiRoomId: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
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
