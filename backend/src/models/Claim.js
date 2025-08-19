import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Claim', claimSchema);
