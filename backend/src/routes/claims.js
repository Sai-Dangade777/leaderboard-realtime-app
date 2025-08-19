import express from 'express';
import Claim from '../models/Claim.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;
    const window = (req.query.window || '').toLowerCase();
    if (window) {
      const now = new Date();
      let startAt = null;
      if (window === 'daily') startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (window === 'weekly') {
        const day = now.getDay();
        const diff = (day === 0 ? -6 : 1 - day);
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
        startAt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
      } else if (window === 'monthly') startAt = new Date(now.getFullYear(), now.getMonth(), 1);
      if (startAt) filter.createdAt = { $gte: startAt };
    }

    const [items, total] = await Promise.all([
      Claim.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name')
        .lean(),
      Claim.countDocuments(filter),
    ]);

    const mapped = items.map(c => ({
      id: c._id,
      userId: c.user?._id || c.user,
      userName: c.user?.name || 'Unknown',
      points: c.points,
      createdAt: c.createdAt,
    }));

  res.json({ items: mapped, total, page, limit, window: window || 'all' });
  } catch (err) {
    next(err);
  }
});

export default router;
