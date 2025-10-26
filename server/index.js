import express from 'express';
import cors from 'cors';
import { config } from 'node:process';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import { getUserByToken } from './db.js';
import { seedTopRestaurants } from './seed-data.js';

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const PORT = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use((req, _res, next) => {
  const authHeader = req.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    req.token = authHeader.slice('Bearer '.length);
  } else {
    req.token = null;
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

try {
  seedTopRestaurants();
} catch (error) {
  console.error('Failed to seed default restaurants:', error);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowing client origin: ${CLIENT_ORIGIN}`);
});
