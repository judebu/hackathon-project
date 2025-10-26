export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  price: string;
  location: string;
  address: string;
  lat: number | null;
  lng: number | null;
  google_place_id?: string | null;
  average_rating?: number;
  review_count?: number;
  rating?: number;
  user_comment?: string;
}

export interface FilterState {
  search: string;
  cuisine: string;
  price: string;
  location: string;
  minRating: number;
}

export type UserRatings = Record<number, number>;

export interface Review {
  id: number;
  restaurant_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  restaurant_name?: string;
  restaurant_cuisine?: string;
  restaurant_location?: string;
  restaurant_price?: string;
}
