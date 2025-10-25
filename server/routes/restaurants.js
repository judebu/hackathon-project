import express from 'express';
import db, { getUserByToken } from '../db.js';

const router = express.Router();

const listRestaurantsStmt = db.prepare(`
  SELECT r.*,
         IFNULL((
           SELECT AVG(reviews.rating)
           FROM reviews
           WHERE reviews.restaurant_id = r.id
         ), 0) AS average_rating,
         IFNULL((
           SELECT COUNT(*)
           FROM reviews
           WHERE reviews.restaurant_id = r.id
         ), 0) AS review_count,
        (
          SELECT rating
          FROM reviews
          WHERE reviews.restaurant_id = r.id AND reviews.user_id = @user_id
        ) AS user_rating,
        (
          SELECT comment
          FROM reviews
          WHERE reviews.restaurant_id = r.id AND reviews.user_id = @user_id
        ) AS user_comment
  FROM restaurants r
  WHERE
    (@search IS NULL OR LOWER(r.name) LIKE @search OR LOWER(r.cuisine) LIKE @search)
    AND (@cuisine IS NULL OR r.cuisine = @cuisine)
    AND (@price IS NULL OR r.price = @price)
    AND (@location IS NULL OR r.location = @location)
  ORDER BY average_rating DESC, r.created_at DESC
  LIMIT @limit OFFSET @offset
`);

const insertRestaurantStmt = db.prepare(`
  INSERT INTO restaurants (
    name, cuisine, price, location, address, lat, lng, google_place_id, created_by
  ) VALUES (
    @name, @cuisine, @price, @location, @address, @lat, @lng, @google_place_id, @created_by
  )
`);

const getUserReviewStmt = db.prepare(`
  SELECT * FROM reviews WHERE user_id = ? AND restaurant_id = ?
`);

const listReviewsStmt = db.prepare(`
  SELECT reviews.*, users.name AS reviewer_name
  FROM reviews
  JOIN users ON users.id = reviews.user_id
  WHERE restaurant_id = ?
  ORDER BY created_at DESC
`);

const listUserReviewsStmt = db.prepare(`
  SELECT reviews.*,
         restaurants.name AS restaurant_name,
         restaurants.cuisine AS restaurant_cuisine,
         restaurants.location AS restaurant_location,
         restaurants.price AS restaurant_price
  FROM reviews
  JOIN restaurants ON restaurants.id = reviews.restaurant_id
  WHERE reviews.user_id = ?
  ORDER BY reviews.created_at DESC
`);

const getRestaurantByPlaceIdStmt = db.prepare(`
  SELECT id FROM restaurants WHERE google_place_id = ?
`);

const updateUserRatingStmt = db.prepare(`
  INSERT INTO reviews (user_id, restaurant_id, rating, comment)
  VALUES (@user_id, @restaurant_id, @rating, @comment)
  ON CONFLICT(user_id, restaurant_id) DO UPDATE SET
    rating = excluded.rating,
    comment = excluded.comment
`);

router.get('/', (req, res) => {
  const { search = '', cuisine, price, location, limit = '50', offset = '0' } = req.query;
  const user = getUserByToken(req.token);

  const statementParams = {
    search: search ? `%${String(search).toLowerCase()}%` : null,
    cuisine: cuisine ? String(cuisine) : null,
    price: price ? String(price) : null,
    location: location ? String(location) : null,
    user_id: user?.id ?? null,
    limit: Number(limit) || 50,
    offset: Number(offset) || 0,
  };

  const restaurants = listRestaurantsStmt.all(statementParams);
  return res.json({ restaurants });
});

router.post('/', (req, res) => {
  const user = getUserByToken(req.token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const {
    name,
    cuisine = '',
    price = '',
    location = '',
    address = '',
    lat,
    lng,
    googlePlaceId = null,
  } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ message: 'Restaurant name is required.' });
  }

  try {
    const existing =
      googlePlaceId != null && googlePlaceId !== ''
        ? getRestaurantByPlaceIdStmt.get(googlePlaceId)
        : null;

    if (existing) {
      return res.status(200).json({ restaurantId: existing.id, message: 'Restaurant already stored.' });
    }

    const info = insertRestaurantStmt.run({
      name,
      cuisine,
      price,
      location,
      address,
      lat,
      lng,
      google_place_id: googlePlaceId,
      created_by: user.id,
    });

    return res.status(201).json({ restaurantId: Number(info.lastInsertRowid) });
  } catch (error) {
    console.error('Failed to add restaurant:', error);
    return res.status(500).json({ message: 'Unable to save the restaurant right now.' });
  }
});

router.get('/:id/reviews', (req, res) => {
  const { id } = req.params;
  const reviews = listReviewsStmt.all(Number(id));
  return res.json({ reviews });
});

router.post('/:id/reviews', (req, res) => {
  const user = getUserByToken(req.token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { rating, comment = '' } = req.body ?? {};

  const cleanRating = Number(rating);
  if (!Number.isFinite(cleanRating) || cleanRating < 1 || cleanRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    updateUserRatingStmt.run({
      user_id: user.id,
      restaurant_id: Number(id),
      rating: cleanRating,
      comment,
    });
    return res.status(201).json({ message: 'Review saved.' });
  } catch (error) {
    console.error('Failed to save review:', error);
    return res.status(500).json({ message: 'Unable to save the review right now.' });
  }
});

router.get('/user/me', (req, res) => {
  const user = getUserByToken(req.token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const reviews = listUserReviewsStmt.all(user.id);
  return res.json({ reviews });
});

router.get('/:id/user-rating', (req, res) => {
  const user = getUserByToken(req.token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { id } = req.params;
  const review = getUserReviewStmt.get(user.id, Number(id));
  return res.json({ review });
});

export default router;
