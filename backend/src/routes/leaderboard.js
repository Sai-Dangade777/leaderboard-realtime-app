import express from 'express';
import User from '../models/User.js';
import Claim from '../models/Claim.js';
import { denseRank } from '../utils/rank.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

    const window = (req.query.window || 'all').toLowerCase();

    function getWindowStart() {
      const now = new Date();
      if (window === 'daily') {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }
      if (window === 'weekly') {
        // Start of ISO week (Mon)
        const day = now.getDay(); // 0..6 (Sun..Sat)
        const diff = (day === 0 ? -6 : 1 - day); // days to Monday
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
        return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
      }
      if (window === 'monthly') {
        return new Date(now.getFullYear(), now.getMonth(), 1);
      }
      return null;
    }

    let ranked = [];
    if (window === 'all' || window === 'overall' || window === 'lifetime') {
      const all = await User.find({}).sort({ totalPoints: -1, name: 1 }).lean();
      ranked = denseRank(all.map(u => ({ id: u._id, name: u.name, totalPoints: u.totalPoints })));
    } else {
      const startAt = getWindowStart();
      const agg = await Claim.aggregate([
        { $match: { createdAt: { $gte: startAt } } },
        { $group: { _id: '$user', totalPoints: { $sum: '$points' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: 0, id: '$_id', name: '$user.name', totalPoints: 1 } },
        { $sort: { totalPoints: -1, name: 1 } },
      ]);
      ranked = denseRank(agg);
    }

    const total = ranked.length;
    const start = (page - 1) * limit;
    const items = ranked.slice(start, start + limit);

    res.json({ items, total, page, limit, window });
  } catch (err) {
    next(err);
  }
});

export default router;
