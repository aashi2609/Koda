import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username?: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string;
  skillsOffered: string[];
  skillsDesired: string[];
  emailVerified?: Date | null;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Name is required"] },
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    image: { type: String },
    bio: { type: String, maxlength: [500, "Bio cannot exceed 500 characters"], default: "" },
    skillsOffered: { type: [String], default: [] },
    skillsDesired: { type: [String], default: [] },
    emailVerified: { type: Date, default: null },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
