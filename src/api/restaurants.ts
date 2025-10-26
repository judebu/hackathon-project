import { apiFetch, IS_DEMO_MODE } from './client';
import type { FilterState, Restaurant, Review } from '../types/restaurant';
import { getDemoRestaurants, getDemoReviewsForRestaurant, getDemoUserReviews } from './demoData';

export interface RestaurantListResponse {
  restaurants: Restaurant[];
}

export async function listRestaurants(filters: Partial<FilterState> = {}) {
  if (IS_DEMO_MODE) {
    const restaurants = getDemoRestaurants(filters).map((restaurant) => ({
      ...restaurant,
      rating: restaurant.average_rating ?? restaurant.rating,
    }));
    return Promise.resolve({ restaurants });
  }

  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.cuisine && filters.cuisine !== 'All') params.set('cuisine', filters.cuisine);
  if (filters.price && filters.price !== 'All') params.set('price', filters.price);
  if (filters.location && filters.location !== 'All') params.set('location', filters.location);
  return apiFetch<RestaurantListResponse>(`/restaurants?${params.toString()}`);
}

export async function addRestaurant(payload: {
  name: string;
  cuisine?: string;
  price?: string;
  location?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  googlePlaceId?: string | null;
}) {
  if (IS_DEMO_MODE) {
    throw new Error('Demo mode is read-only. Adding restaurants is disabled for the live preview.');
  }
  return apiFetch<{ restaurantId: number }>('/restaurants', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function submitReview(restaurantId: number, payload: { rating: number; comment?: string }) {
  if (IS_DEMO_MODE) {
    throw new Error('Demo mode is read-only. Reviews cannot be saved in the live preview.');
  }
  return apiFetch<{ message: string }>(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function fetchReviews(restaurantId: number) {
  if (IS_DEMO_MODE) {
    const reviews = getDemoReviewsForRestaurant(restaurantId);
    return Promise.resolve({ reviews });
  }
  return apiFetch<{ reviews: Review[] }>(`/restaurants/${restaurantId}/reviews`);
}

export async function fetchMyReviews() {
  if (IS_DEMO_MODE) {
    const reviews = getDemoUserReviews();
    return Promise.resolve({ reviews });
  }
  return apiFetch<{ reviews: Review[] }>('/restaurants/user/me', {
    auth: true,
  });
}
