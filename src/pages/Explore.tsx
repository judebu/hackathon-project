import { useCallback, useEffect, useMemo, useState } from 'react';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import Sidebar from '../components/Sidebar';
import type { FilterState, Restaurant, UserRatings } from '../types/restaurant';
import './Explore.css';
import { addRestaurant, listRestaurants, submitReview } from '../api/restaurants';
import { IS_DEMO_MODE } from '../api/client';
import { useAuth } from '../context/AuthContext';

const defaultFilters: FilterState = {
  search: '',
  cuisine: 'All',
  price: 'All',
  location: 'All',
  minRating: 0,
};


const defaultCenter = { lat: 42.3495, lng: -71.0993 };

const redMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#ffe6e6' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7a0c22' }],
  },
  {
    featureType: 'water',
    stylers: [{ color: '#ffc8c8' }],
  },
  {
    featureType: 'road',
    stylers: [{ color: '#ffb3b3' }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];

type PlaceSuggestion = { description: string; placeId: string };

type StatusType = 'idle' | 'success' | 'error' | 'info';

interface StatusMessage {
  type: StatusType;
  message: string;
}

const STATUS_COLORS: Record<Exclude<StatusType, 'idle'>, string> = {
  success: '#25643c',
  error: '#7a0c22',
  info: '#1f3c88',
};

function StatusToast({ status }: { status: StatusMessage }) {
  if (status.type === 'idle') return null;
  const background = STATUS_COLORS[status.type];
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        background,
        color: 'white',
        padding: '0.85rem 1.2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 18px 32px -24px rgba(0,0,0,0.45)',
        fontSize: '0.9rem',
      }}
    >
      {status.message}
    </div>
  );
}

function ExplorePreview() {
  const isDemoMode = IS_DEMO_MODE;
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters });
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatings>({});
  const [userComments, setUserComments] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [savingReviewId, setSavingReviewId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({
    type: 'idle',
    message: '',
  });

  const { user } = useAuth();

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  const refreshRestaurants = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const { search, cuisine, price, location } = filters;
      const response = await listRestaurants({ search, cuisine, price, location });
      setRestaurants(response.restaurants);

      const ratingLookup: UserRatings = {};
      const commentLookup: Record<number, string> = {};
      response.restaurants.forEach((restaurant) => {
        const enriched = restaurant as Restaurant & { user_rating?: number; user_comment?: string };
        if (enriched.user_rating != null) {
          ratingLookup[enriched.id] = enriched.user_rating;
        }
        if (enriched.user_comment != null) {
          commentLookup[enriched.id] = enriched.user_comment;
        }
      });
      setUserRatings((prev) => ({ ...ratingLookup, ...prev }));
      setUserComments((prev) => ({ ...commentLookup, ...prev }));
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unable to load restaurants.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void refreshRestaurants();
  }, [refreshRestaurants]);

  useEffect(() => {
    if (statusMessage.type !== 'idle') {
      const timer = window.setTimeout(() => setStatusMessage({ type: 'idle', message: '' }), 2500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [statusMessage]);

  useEffect(() => {
    const baseMessage =
      'Add a Google Maps API key to enable the live map and Places search experience.';
    const suffix = isDemoMode ? ' Showing a curated sample while the backend is offline.' : '';
    setStatusMessage({ type: 'info', message: `${baseMessage}${suffix}` });
  }, [isDemoMode]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const average = restaurant.average_rating ?? restaurant.rating ?? 0;
      return average >= filters.minRating;
    });
  }, [restaurants, filters.minRating]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.cuisine) set.add(restaurant.cuisine);
    });
    return Array.from(set);
  }, [restaurants]);

  const prices = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.price) set.add(restaurant.price);
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.location) set.add(restaurant.location);
    });
    return Array.from(set);
  }, [restaurants]);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleRatingChange = (restaurantId: number, rating: number) => {
    if (!user) {
      window.alert('Please sign in to rate restaurants.');
      return;
    }
    setUserRatings((prev) => ({ ...prev, [restaurantId]: rating }));
  };

  const handleCommentChange = (restaurantId: number, value: string) => {
    if (!user) {
      window.alert('Sign in to leave a review.');
      return;
    }
    setUserComments((prev) => ({ ...prev, [restaurantId]: value }));
  };

  const handleSubmitReview = async (restaurantId: number) => {
    if (!user) {
      window.alert('Please sign in to save reviews.');
      return;
    }

    const rating = userRatings[restaurantId] ?? 0;
    if (!rating) {
      window.alert('Add a rating before saving your review.');
      return;
    }

    if (isDemoMode) {
      setStatusMessage({
        type: 'error',
        message: 'Demo mode is read-only; reviews are disabled for the live preview.',
      });
      return;
    }

    setSavingReviewId(restaurantId);
    try {
      await submitReview(restaurantId, {
        rating,
        comment: userComments[restaurantId] ?? '',
      });
      await refreshRestaurants();
      setStatusMessage({ type: 'success', message: 'Review saved.' });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save review.',
      });
    } finally {
      setSavingReviewId(null);
    }
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters });
    setSearchTerm('');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleSaveCandidate = () => {
    setStatusMessage({
      type: 'info',
      message: 'Places search is disabled in this preview. Add a Google Maps key to enable it.',
    });
  };

  return (
    <div className="explore-page">
      <div className="explore-layout">
        <Sidebar
          filters={filters}
          restaurants={filteredRestaurants}
          cuisines={cuisines}
          prices={prices}
          locations={locations}
          userRatings={userRatings}
          userComments={userComments}
          isLoading={isLoading}
          errorMessage={listError}
          searchTerm={searchTerm}
          suggestions={[]}
          canRate={Boolean(user) && !isDemoMode}
          isSavingReview={savingReviewId}
          selectedCandidate={null}
          isDemoMode={isDemoMode}
          onSearchChange={handleSearchChange}
          onSelectSuggestion={() => undefined}
          onSaveCandidate={handleSaveCandidate}
          isSavingCandidate={false}
          onFilterChange={handleFilterChange}
          onRatingChange={handleRatingChange}
          onCommentChange={handleCommentChange}
          onSubmitReview={handleSubmitReview}
          onClearFilters={handleClearFilters}
        />

        <div className="map-wrapper">
          <div className="map-placeholder">
            <h3>Interactive map coming soon</h3>
            <p>
              Add a <code>VITE_GOOGLE_MAPS_API_KEY</code> environment variable to showcase the live
              map here. The sidebar uses the same data so employers can still explore the product.
            </p>
          </div>
        </div>
      </div>
      <StatusToast status={statusMessage} />
    </div>
  );
}

export default function Explore() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return <ExplorePreview />;
  }

  return <ExploreContent apiKey={apiKey} />;
}
interface MapControllerProps {
  center: { lat: number; lng: number };
  zoom: number;
}

function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.setCenter(center);
  }, [map, center]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  return null;
}

function ExploreContent({ apiKey }: { apiKey: string }) {
  const isDemoMode = IS_DEMO_MODE;
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters });
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatings>({});
  const [userComments, setUserComments] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    name: string;
    address: string;
    cuisine?: string;
    priceLevel?: string;
    locationLabel?: string;
    lat: number;
    lng: number;
    placeId: string;
  } | null>(null);
  const [isSavingCandidate, setIsSavingCandidate] = useState(false);
  const [savingReviewId, setSavingReviewId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({
    type: 'idle',
    message: '',
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);

  const placesLibrary = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);

  const { user } = useAuth();

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (!placesLibrary) return;
    setAutocompleteService(new placesLibrary.AutocompleteService());
    setPlacesService(new placesLibrary.PlacesService(document.createElement('div')));
  }, [placesLibrary]);

  const refreshRestaurants = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const { search, cuisine, price, location } = filters;
      const response = await listRestaurants({ search, cuisine, price, location });
      setRestaurants(response.restaurants);

      const ratingLookup: UserRatings = {};
      const commentLookup: Record<number, string> = {};
      response.restaurants.forEach((restaurant) => {
        const enriched = restaurant as Restaurant & { user_rating?: number; user_comment?: string };
        if (enriched.user_rating != null) {
          ratingLookup[enriched.id] = enriched.user_rating;
        }
        if (enriched.user_comment != null) {
          commentLookup[enriched.id] = enriched.user_comment;
        }
      });
      setUserRatings((prev) => ({ ...ratingLookup, ...prev }));
      setUserComments((prev) => ({ ...commentLookup, ...prev }));
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unable to load restaurants.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void refreshRestaurants();
  }, [refreshRestaurants]);

  useEffect(() => {
    if (statusMessage.type !== 'idle') {
      const timer = window.setTimeout(() => setStatusMessage({ type: 'idle', message: '' }), 2500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [statusMessage]);

  useEffect(() => {
    if (isDemoMode) {
      setStatusMessage({
        type: 'info',
        message: 'Demo mode: showing a curated sample of Boston favorites.',
      });
    }
  }, [isDemoMode]);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const average = restaurant.average_rating ?? restaurant.rating ?? 0;
      return average >= filters.minRating;
    });
  }, [restaurants, filters.minRating]);

  useEffect(() => {
    if (selectedCandidate || filteredRestaurants.length === 0) {
      return;
    }
    const firstWithCoords = filteredRestaurants.find(
      (restaurant) => restaurant.lat != null && restaurant.lng != null
    );
    if (firstWithCoords && firstWithCoords.lat != null && firstWithCoords.lng != null) {
      setMapCenter({ lat: firstWithCoords.lat, lng: firstWithCoords.lng });
      setMapZoom(13);
    }
  }, [filteredRestaurants, selectedCandidate]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.cuisine) set.add(restaurant.cuisine);
    });
    return Array.from(set);
  }, [restaurants]);

  const prices = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.price) set.add(restaurant.price);
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.location) set.add(restaurant.location);
    });
    return Array.from(set);
  }, [restaurants]);

  const handleRatingChange = (restaurantId: number, rating: number) => {
    if (!user) {
      window.alert('Please sign in to rate restaurants.');
      return;
    }
    setUserRatings((prev) => ({ ...prev, [restaurantId]: rating }));
  };

  const handleCommentChange = (restaurantId: number, value: string) => {
    if (!user) {
      window.alert('Sign in to leave a review.');
      return;
    }
    setUserComments((prev) => ({ ...prev, [restaurantId]: value }));
  };

  const handleSubmitReview = async (restaurantId: number) => {
    if (!user) {
      window.alert('Please sign in to save reviews.');
      return;
    }

    const rating = userRatings[restaurantId] ?? 0;
    if (!rating) {
      window.alert('Add a rating before saving your review.');
      return;
    }

    if (isDemoMode) {
      setStatusMessage({
        type: 'error',
        message: 'Demo mode is read-only; reviews are disabled for the live preview.',
      });
      return;
    }

    setSavingReviewId(restaurantId);
    try {
      await submitReview(restaurantId, {
        rating,
        comment: userComments[restaurantId] ?? '',
      });
      await refreshRestaurants();
      setStatusMessage({ type: 'success', message: 'Review saved.' });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save review.',
      });
    } finally {
      setSavingReviewId(null);
    }
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters });
    setSearchTerm('');
    setSelectedCandidate(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (!autocompleteService || !value.trim()) {
      setSuggestions([]);
      return;
    }

    const request: any = {
      input: value,
      types: ['restaurant'],
      locationBias: {
        north: 42.36,
        south: 42.32,
        east: -71.04,
        west: -71.15,
      },
    };

    autocompleteService.getPlacePredictions(request, (predictions: any[] | null) => {
      if (!predictions) {
        setSuggestions([]);
        return;
      }
      setSuggestions(
        predictions.map((prediction: any) => ({
          description: prediction.description ?? '',
          placeId: prediction.place_id ?? '',
        }))
      );
    });
  };

  const handleSelectSuggestion = (placeId: string) => {
    if (!placesService) return;

    placesService.getDetails(
      {
        placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'types',
          'price_level',
          'address_components',
        ],
      },
      (place: any, status: any) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          return;
        }

        const location = place.geometry?.location;
        if (location) {
          const lat = location.lat();
          const lng = location.lng();
          setMapCenter({ lat, lng });
          setMapZoom(15);

          const cuisines = (place.types as string[] | undefined)?.filter(
            (type: string) =>
              type !== 'restaurant' &&
              type !== 'food' &&
              type !== 'point_of_interest' &&
              type !== 'establishment'
          );
          const readableCuisine =
            cuisines && cuisines.length
              ? cuisines[0]
                  .split('_')
                  .map((segment: string) => segment.charAt(0).toUpperCase() + segment.slice(1))
                  .join(' ')
              : undefined;

          const components = (place.address_components as any[]) ?? [];
          const neighborhood = components.find((component: any) =>
            component.types.includes('neighborhood')
          )?.long_name;
          const locality = components.find((component: any) =>
            component.types.includes('locality')
          )?.long_name;
          const subLocality = components.find((component: any) =>
            component.types.includes('sublocality')
          )?.long_name;

          setSelectedCandidate({
            name: place.name ?? 'Unnamed restaurant',
            address: place.formatted_address ?? '',
            cuisine: readableCuisine,
            priceLevel:
              place.price_level != null ? '$'.repeat(Math.max(1, place.price_level + 1)) : undefined,
            lat,
            lng,
            placeId,
            locationLabel: neighborhood ?? subLocality ?? locality,
          });

          setSearchTerm(place.name ?? '');
          setFilters((prev) => ({ ...prev, search: place.name ?? '' }));
          setSuggestions([]);
        }
      }
    );
  };

  const handleSaveCandidate = async () => {
    if (!selectedCandidate) return;
    if (!user) {
      window.alert('Sign in to save restaurants.');
      return;
    }

    if (isDemoMode) {
      setStatusMessage({
        type: 'error',
        message: 'Demo mode is read-only; adding new restaurants is disabled.',
      });
      return;
    }

    setIsSavingCandidate(true);
    try {
      await addRestaurant({
        name: selectedCandidate.name,
        address: selectedCandidate.address,
        cuisine: selectedCandidate.cuisine ?? '',
        price: selectedCandidate.priceLevel ?? '',
        location:
          selectedCandidate.locationLabel ??
          (filters.location !== 'All' ? filters.location : ''),
        lat: selectedCandidate.lat,
        lng: selectedCandidate.lng,
        googlePlaceId: selectedCandidate.placeId,
      });
      setSelectedCandidate(null);
      await refreshRestaurants();
      setStatusMessage({ type: 'success', message: 'Restaurant added to your list.' });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save that restaurant.',
      });
    } finally {
      setIsSavingCandidate(false);
    }
  };

  return (
    <div className="explore-page">
      <APIProvider apiKey={apiKey}>
        <div className="explore-layout">
          <Sidebar
            filters={filters}
            restaurants={filteredRestaurants}
            cuisines={cuisines}
            prices={prices}
            locations={locations}
            userRatings={userRatings}
            userComments={userComments}
            isLoading={isLoading}
            errorMessage={listError}
            searchTerm={searchTerm}
            suggestions={suggestions}
            canRate={Boolean(user) && !isDemoMode}
            isSavingReview={savingReviewId}
            selectedCandidate={selectedCandidate}
            isDemoMode={isDemoMode}
            onSearchChange={handleSearchChange}
            onSelectSuggestion={handleSelectSuggestion}
            onSaveCandidate={handleSaveCandidate}
            isSavingCandidate={isSavingCandidate}
            onFilterChange={handleFilterChange}
            onRatingChange={handleRatingChange}
            onCommentChange={handleCommentChange}
            onSubmitReview={handleSubmitReview}
            onClearFilters={handleClearFilters}
          />

          <div className="map-wrapper">
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={defaultCenter}
              defaultZoom={12}
              options={{ styles: redMapStyle, disableDefaultUI: true }}
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              {filteredRestaurants.map((restaurant) => {
                if (restaurant.lat == null || restaurant.lng == null) return null;
                return (
                  <Marker
                    key={restaurant.id}
                    position={{ lat: restaurant.lat, lng: restaurant.lng }}
                    title={`${restaurant.name} • ${restaurant.cuisine}`}
                  />
                );
              })}
              {selectedCandidate && (
                <Marker
                  position={{ lat: selectedCandidate.lat, lng: selectedCandidate.lng }}
                  title={selectedCandidate.name}
                />
              )}
            </Map>
          </div>
        </div>

        <StatusToast status={statusMessage} />
      </APIProvider>
    </div>
  );
}
