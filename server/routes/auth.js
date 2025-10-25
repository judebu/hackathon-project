import bcrypt from 'bcrypt';
import express from 'express';
import db, { createSession, ensureDefaultPreferences, getUserByToken, revokeSession } from '../db.js';

const router = express.Router();

const insertUserStmt = db.prepare(
  `INSERT INTO users (name, email, password_hash) VALUES (@name, @email, @password_hash)`
);
const findUserByEmailStmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
const getPreferencesStmt = db.prepare(
  `SELECT dietary_prefs, favorite_cuisines, home_location FROM preferences WHERE user_id = ?`
);

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const info = insertUserStmt.run({ name, email: email.toLowerCase(), password_hash: passwordHash });
    const userId = info.lastInsertRowid;

    ensureDefaultPreferences(userId);
    const token = createSession(userId);

    return res.status(201).json({
      token,
      user: { id: Number(userId), name, email: email.toLowerCase() },
      preferences: getPreferencesStmt.get(userId),
    });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Unable to register right now.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const record = findUserByEmailStmt.get(email.toLowerCase());
  if (!record) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isValid = await bcrypt.compare(password, record.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = createSession(record.id);
  ensureDefaultPreferences(record.id);
  const preferences = getPreferencesStmt.get(record.id);

  return res.json({
    token,
    user: { id: record.id, name: record.name, email: record.email },
    preferences,
  });
});

router.post('/logout', (req, res) => {
  const authHeader = req.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(204).end();
  }
  const token = authHeader.slice('Bearer '.length);
  revokeSession(token);
  return res.status(204).end();
});

router.get('/me', (req, res) => {
  const user = getUserByToken(req.token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  ensureDefaultPreferences(user.id);
  const preferences = getPreferencesStmt.get(user.id);

  return res.json({ user, preferences });
});

router.put('/preferences', (req, res) => {
  const user = getUserByToken(req.token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { dietaryPrefs = [], favoriteCuisines = [], homeLocation = '' } = req.body ?? {};
  const prefsJson = JSON.stringify(Array.isArray(dietaryPrefs) ? dietaryPrefs : []);
  const cuisinesJson = JSON.stringify(Array.isArray(favoriteCuisines) ? favoriteCuisines : []);

  db.prepare(
    `
      INSERT INTO preferences (user_id, dietary_prefs, favorite_cuisines, home_location)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        dietary_prefs = excluded.dietary_prefs,
        favorite_cuisines = excluded.favorite_cuisines,
        home_location = excluded.home_location
    `
  ).run(user.id, prefsJson, cuisinesJson, homeLocation);

  return res.json({
    preferences: {
      dietary_prefs: prefsJson,
      favorite_cuisines: cuisinesJson,
      home_location: homeLocation,
    },
  });
});

export default router;
