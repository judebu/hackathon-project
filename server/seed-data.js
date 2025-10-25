import bcrypt from 'bcrypt';
import db, { ensureDefaultPreferences } from './db.js';

const TOP_BOSTON_RESTAURANTS = [
  {
    name: 'O Ya',
    cuisine: 'Japanese',
    price: '$$$$',
    location: 'Leather District',
    address: '9 East St, Boston, MA 02111',
    lat: 42.3524,
    lng: -71.0546,
    rating: 5,
  },
  {
    name: 'Oleana',
    cuisine: 'Eastern Mediterranean',
    price: '$$$',
    location: 'Cambridge',
    address: '134 Hampshire St, Cambridge, MA 02139',
    lat: 42.3706,
    lng: -71.0989,
    rating: 5,
  },
  {
    name: 'Giulia',
    cuisine: 'Italian',
    price: '$$$',
    location: 'Cambridge',
    address: '1682 Massachusetts Ave, Cambridge, MA 02138',
    lat: 42.3823,
    lng: -71.1237,
    rating: 5,
  },
  {
    name: 'Sarma',
    cuisine: 'Middle Eastern',
    price: '$$$',
    location: 'Somerville',
    address: '249 Pearl St, Somerville, MA 02145',
    lat: 42.3792,
    lng: -71.096,
    rating: 5,
  },
  {
    name: 'Mamma Maria',
    cuisine: 'Italian',
    price: '$$$$',
    location: 'North End',
    address: '3 N Square, Boston, MA 02113',
    lat: 42.3633,
    lng: -71.0541,
    rating: 5,
  },
  {
    name: 'Neptune Oyster',
    cuisine: 'Seafood',
    price: '$$$',
    location: 'North End',
    address: '63 Salem St, Boston, MA 02113',
    lat: 42.3648,
    lng: -71.0559,
    rating: 5,
  },
  {
    name: 'Menton',
    cuisine: 'French',
    price: '$$$$',
    location: 'Seaport',
    address: '354 Congress St, Boston, MA 02210',
    lat: 42.3511,
    lng: -71.0483,
    rating: 5,
  },
  {
    name: 'Toro',
    cuisine: 'Spanish',
    price: '$$$',
    location: 'South End',
    address: '1704 Washington St, Boston, MA 02118',
    lat: 42.3388,
    lng: -71.0756,
    rating: 5,
  },
  {
    name: 'Tasting Counter',
    cuisine: 'Modern American',
    price: '$$$$',
    location: 'Somerville',
    address: '14 Tyler St, Somerville, MA 02143',
    lat: 42.3805,
    lng: -71.0939,
    rating: 5,
  },
  {
    name: 'Uni',
    cuisine: 'Japanese',
    price: '$$$$',
    location: 'Back Bay',
    address: '370 Commonwealth Ave, Boston, MA 02215',
    lat: 42.3495,
    lng: -71.0867,
    rating: 5,
  },
  {
    name: 'Craigie On Main',
    cuisine: 'New American',
    price: '$$$$',
    location: 'Cambridge',
    address: '853 Main St, Cambridge, MA 02139',
    lat: 42.3656,
    lng: -71.1043,
    rating: 5,
  },
  {
    name: 'Myers + Chang',
    cuisine: 'Asian Fusion',
    price: '$$',
    location: 'South End',
    address: '1145 Washington St, Boston, MA 02118',
    lat: 42.3431,
    lng: -71.066,
    rating: 4,
  },
  {
    name: 'Little Donkey',
    cuisine: 'Global Tapas',
    price: '$$$',
    location: 'Cambridge',
    address: '505 Massachusetts Ave, Cambridge, MA 02139',
    lat: 42.3645,
    lng: -71.1031,
    rating: 4,
  },
  {
    name: 'The Capital Grille',
    cuisine: 'Steakhouse',
    price: '$$$$',
    location: 'Back Bay',
    address: '900 Boylston St, Boston, MA 02115',
    lat: 42.3491,
    lng: -71.0822,
    rating: 4,
  },
  {
    name: 'Asta',
    cuisine: 'Modern American',
    price: '$$$',
    location: 'Back Bay',
    address: '47 Massachusetts Ave, Boston, MA 02115',
    lat: 42.3519,
    lng: -71.0895,
    rating: 4,
  },
  {
    name: 'Deuxave',
    cuisine: 'French',
    price: '$$$$',
    location: 'Back Bay',
    address: '371 Commonwealth Ave, Boston, MA 02115',
    lat: 42.3496,
    lng: -71.089,
    rating: 4,
  },
  {
    name: 'Bistro du Midi',
    cuisine: 'French',
    price: '$$$$',
    location: 'Back Bay',
    address: '272 Boylston St, Boston, MA 02116',
    lat: 42.3509,
    lng: -71.0765,
    rating: 4,
  },
  {
    name: "Yvonne's",
    cuisine: 'New American',
    price: '$$$',
    location: 'Downtown Crossing',
    address: '2 Winter Pl, Boston, MA 02108',
    lat: 42.3554,
    lng: -71.0613,
    rating: 4,
  },
  {
    name: 'Row 34',
    cuisine: 'Seafood',
    price: '$$$',
    location: 'Seaport',
    address: '383 Congress St, Boston, MA 02210',
    lat: 42.351,
    lng: -71.0426,
    rating: 4,
  },
  {
    name: "Pammy's",
    cuisine: 'Italian',
    price: '$$$',
    location: 'Cambridge',
    address: '928 Massachusetts Ave, Cambridge, MA 02139',
    lat: 42.3658,
    lng: -71.1059,
    rating: 4,
  },
];

const selectRestaurantStmt = db.prepare(
  'SELECT id FROM restaurants WHERE name = ? AND address = ?'
);
const insertRestaurantStmt = db.prepare(`
  INSERT INTO restaurants (name, cuisine, price, location, address, lat, lng, google_place_id, created_by)
  VALUES (@name, @cuisine, @price, @location, @address, @lat, @lng, NULL, @created_by)
`);
const insertUserStmt = db.prepare(
  'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
);
const selectUserStmt = db.prepare('SELECT id FROM users WHERE email = ?');
const insertReviewStmt = db.prepare(
  'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)'
);
const selectReviewStmt = db.prepare(
  'SELECT id FROM reviews WHERE user_id = ? AND restaurant_id = ?'
);
const updateReviewStmt = db.prepare(
  'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?'
);

export function seedTopRestaurants() {
  const seedEmail = 'top20@terriertaste.dev';
  const seedName = 'Terrier Taste Rankings';

  let user = selectUserStmt.get(seedEmail);
  let userId;

  if (!user) {
    const passwordHash = bcrypt.hashSync('terrier-top20', 10);
    const info = insertUserStmt.run(seedName, seedEmail, passwordHash);
    userId = Number(info.lastInsertRowid);
  } else {
    userId = Number(user.id);
  }

  ensureDefaultPreferences(userId);

  TOP_BOSTON_RESTAURANTS.forEach((restaurant) => {
    let record = selectRestaurantStmt.get(restaurant.name, restaurant.address);
    if (!record) {
      const info = insertRestaurantStmt.run({ ...restaurant, created_by: userId });
      record = { id: Number(info.lastInsertRowid) };
    }

    const restaurantId = Number(record.id);

    const review = selectReviewStmt.get(userId, restaurantId);
    const comment = 'Featured in Terrier Taste Top 20';
    if (!review) {
      insertReviewStmt.run(userId, restaurantId, restaurant.rating, comment);
    } else {
      updateReviewStmt.run(restaurant.rating, comment, review.id);
    }
  });
}
