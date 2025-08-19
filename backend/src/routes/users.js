import express from 'express';
import User from '../models/User.js';
import Claim from '../models/Claim.js';

const router = express.Router();

// List users (paginated basic list)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find({}).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// Create user
router.post('/', async (req, res, next) => {
  try {
    const name = (req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const user = await User.create({ name });
    res.status(201).json(user);
  } catch (err) {
    // friendly duplicate handling
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User name already exists' });
    }
    next(err);
  }
});

// Claim random points for a user
router.post('/:id/claim', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const awarded = Math.floor(Math.random() * 10) + 1; // 1..10

    user.totalPoints += awarded;
    await user.save();

    await Claim.create({ user: user._id, points: awarded });

    // emit a leaderboard update
    const io = req.app.get('io');
    if (io) io.emit('leaderboard:changed');

    res.json({ awarded, user });
  } catch (err) {
    next(err);
  }
});

export default router;
