import { apiFetch } from './client';
import type { FilterState, Restaurant, Review } from '../types/restaurant';

export interface RestaurantListResponse {
  restaurants: Restaurant[];
}

export async function listRestaurants(filters: Partial<FilterState> = {}) {
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
  return apiFetch<{ restaurantId: number }>('/restaurants', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function submitReview(restaurantId: number, payload: { rating: number; comment?: string }) {
  return apiFetch<{ message: string }>(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function fetchReviews(restaurantId: number) {
  return apiFetch<{ reviews: Review[] }>(`/restaurants/${restaurantId}/reviews`);
}

export async function fetchMyReviews() {
  return apiFetch<{ reviews: Review[] }>('/restaurants/user/me', {
    auth: true,
  });
}
