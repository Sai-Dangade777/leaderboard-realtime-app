import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import User from './models/User.js';
import usersRoute from './routes/users.js';
import leaderboardRoute from './routes/leaderboard.js';
import claimsRoute from './routes/claims.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*'}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/users', usersRoute);
app.use('/api/leaderboard', leaderboardRoute);
app.use('/api/claims', claimsRoute);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' },
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.emit('connected', { ts: Date.now() });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/leaderboard');
  console.log('MongoDB connected');

  // Seed 10 users if empty
  const count = await User.countDocuments();
  if (count === 0) {
    const names = ['Rahul','Kamal','Sanak','Priya','Aisha','Rohan','Vikas','Meera','Anita','Dev'];
    await User.insertMany(names.map(name => ({ name })));
    console.log('Seeded users');
  }

  server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error('Fatal startup error', e);
  process.exit(1);
});
