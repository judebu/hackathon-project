import type { FilterState, Restaurant, Review } from '../types/restaurant';

export const DEMO_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: 'Tatte Bakery & Cafe',
    cuisine: 'Cafe',
    price: '$$',
    location: 'Back Bay',
    address: '399 Boylston St, Boston, MA',
    lat: 42.35039,
    lng: -71.07629,
    average_rating: 4.6,
    review_count: 128,
  },
  {
    id: 2,
    name: 'Sweet Cheeks Q',
    cuisine: 'American',
    price: '$$',
    location: 'Fenway',
    address: '1381 Boylston St, Boston, MA',
    lat: 42.34361,
    lng: -71.09762,
    average_rating: 4.4,
    review_count: 284,
  },
  {
    id: 3,
    name: 'Myers + Chang',
    cuisine: 'Asian',
    price: '$$$',
    location: 'South End',
    address: '1145 Washington St, Boston, MA',
    lat: 42.34345,
    lng: -71.06586,
    average_rating: 4.7,
    review_count: 512,
  },
  {
    id: 4,
    name: 'Cafe Landwer',
    cuisine: 'Mediterranean',
    price: '$$',
    location: 'Kenmore',
    address: '900 Beacon St, Boston, MA',
    lat: 42.34858,
    lng: -71.09891,
    average_rating: 4.5,
    review_count: 201,
  },
  {
    id: 5,
    name: 'Barcelona Wine Bar',
    cuisine: 'Spanish',
    price: '$$$',
    location: 'Brookline',
    address: '1700 Beacon St, Brookline, MA',
    lat: 42.33962,
    lng: -71.12953,
    average_rating: 4.6,
    review_count: 347,
  },
  {
    id: 6,
    name: 'Otto Pizza',
    cuisine: 'Pizza',
    price: '$$',
    location: 'Allston',
    address: '888 Commonwealth Ave, Boston, MA',
    lat: 42.35197,
    lng: -71.11354,
    average_rating: 4.3,
    review_count: 189,
  },
  {
    id: 7,
    name: 'Pho Basil',
    cuisine: 'Vietnamese',
    price: '$$',
    location: 'Back Bay',
    address: '177 Massachusetts Ave, Boston, MA',
    lat: 42.34686,
    lng: -71.08829,
    average_rating: 4.5,
    review_count: 271,
  },
  {
    id: 8,
    name: 'Kaju Tofu House',
    cuisine: 'Korean',
    price: '$$',
    location: 'Allston',
    address: '56 Harvard Ave, Allston, MA',
    lat: 42.35353,
    lng: -71.13241,
    average_rating: 4.8,
    review_count: 153,
  },
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: 101,
    restaurant_id: 3,
    rating: 5,
    comment: 'Inventive dim sum with bold flavors. The spicy cold noodles are a standout.',
    created_at: '2024-03-18T12:03:00Z',
    reviewer_name: 'Avery Chen',
    restaurant_name: 'Myers + Chang',
    restaurant_cuisine: 'Asian',
    restaurant_location: 'South End',
    restaurant_price: '$$$',
  },
  {
    id: 102,
    restaurant_id: 4,
    rating: 4,
    comment: 'Great brunch spot near campus—shakshuka and fresh pita hit the spot.',
    created_at: '2024-02-28T09:25:00Z',
    reviewer_name: 'Jordan Smith',
    restaurant_name: 'Cafe Landwer',
    restaurant_cuisine: 'Mediterranean',
    restaurant_location: 'Kenmore',
    restaurant_price: '$$',
  },
  {
    id: 103,
    restaurant_id: 6,
    rating: 5,
    comment: 'Crispy thin crust with creative toppings. Mashed potato bacon pizza is elite.',
    created_at: '2024-01-19T19:45:00Z',
    reviewer_name: 'Taylor Brooks',
    restaurant_name: 'Otto Pizza',
    restaurant_cuisine: 'Pizza',
    restaurant_location: 'Allston',
    restaurant_price: '$$',
  },
  {
    id: 104,
    restaurant_id: 1,
    rating: 4,
    comment: 'Light-filled cafe with great pastries—cardamom latte is my go-to before class.',
    created_at: '2024-03-02T08:10:00Z',
    reviewer_name: 'Morgan Lee',
    restaurant_name: 'Tatte Bakery & Cafe',
    restaurant_cuisine: 'Cafe',
    restaurant_location: 'Back Bay',
    restaurant_price: '$$',
  },
];

export function getDemoRestaurants(filters: Partial<FilterState> = {}) {
  const normalizedSearch = (filters.search ?? '').trim().toLowerCase();
  const normalizedCuisine =
    filters.cuisine && filters.cuisine !== 'All' ? filters.cuisine.toLowerCase() : null;
  const normalizedPrice =
    filters.price && filters.price !== 'All' ? filters.price.toLowerCase() : null;
  const normalizedLocation =
    filters.location && filters.location !== 'All' ? filters.location.toLowerCase() : null;

  return DEMO_RESTAURANTS.filter((restaurant) => {
    if (normalizedSearch) {
      const haystack = `${restaurant.name} ${restaurant.cuisine} ${restaurant.location} ${restaurant.address}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }
    if (normalizedCuisine && restaurant.cuisine.toLowerCase() !== normalizedCuisine) {
      return false;
    }
    if (normalizedPrice && restaurant.price.toLowerCase() !== normalizedPrice) {
      return false;
    }
    if (normalizedLocation && restaurant.location.toLowerCase() !== normalizedLocation) {
      return false;
    }
    return true;
  });
}

export function getDemoReviewsForRestaurant(restaurantId: number) {
  return DEMO_REVIEWS.filter((review) => review.restaurant_id === restaurantId);
}

export function getDemoUserReviews() {
  return DEMO_REVIEWS.map((review) => ({
    ...review,
    reviewer_name: 'You',
  }));
}
