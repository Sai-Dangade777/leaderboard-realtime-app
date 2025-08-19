import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    totalPoints: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
