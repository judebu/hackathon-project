import type { ChangeEvent } from 'react';
import type { FilterState, Restaurant, UserRatings } from '../types/restaurant';
import './Sidebar.css';

interface SidebarProps {
  filters: FilterState;
  restaurants: Restaurant[];
  cuisines: string[];
  prices: string[];
  locations: string[];
  userRatings: UserRatings;
  userComments: Record<number, string>;
  isLoading: boolean;
  searchTerm: string;
  suggestions: Array<{ description: string; placeId: string }>;
  errorMessage?: string | null;
  canRate: boolean;
  isSavingReview?: number | null;
  selectedCandidate?: {
    name: string;
    address: string;
    cuisine?: string;
    priceLevel?: string;
    locationLabel?: string;
  } | null;
  onSearchChange: (value: string) => void;
  onSelectSuggestion: (placeId: string) => void;
  onSaveCandidate: () => void;
  isSavingCandidate: boolean;
  onFilterChange: (partial: Partial<FilterState>) => void;
  onRatingChange: (restaurantId: number, rating: number) => void;
  onCommentChange: (restaurantId: number, value: string) => void;
  onSubmitReview: (restaurantId: number) => void;
  onClearFilters: () => void;
}

export default function Sidebar({
  filters,
  restaurants,
  cuisines,
  prices,
  locations,
  userRatings,
  userComments,
  isLoading,
  searchTerm,
  suggestions,
  errorMessage,
  canRate,
  isSavingReview = null,
  selectedCandidate,
  onSearchChange,
  onSelectSuggestion,
  onSaveCandidate,
  isSavingCandidate,
  onFilterChange,
  onRatingChange,
  onCommentChange,
  onSubmitReview,
  onClearFilters,
}: SidebarProps) {
  const handleSelectChange =
    (key: keyof FilterState) => (event: ChangeEvent<HTMLSelectElement>) =>
      onFilterChange({ [key]: event.target.value });

  const handleRatingChange = (restaurantId: number, value: number) => {
    if (!canRate) return;
    onRatingChange(restaurantId, value);
  };

  const renderInteractiveStars = (restaurantId: number) => {
    const currentRating = userRatings[restaurantId] ?? 0;

    return (
      <div className="sidebar-stars" role="group" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-button ${star <= currentRating ? 'active' : ''}`}
            onClick={() => handleRatingChange(restaurantId, star)}
            disabled={!canRate}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h2 className="sidebar-title">Find a spot</h2>
        <p className="sidebar-subtitle">
          Browse restaurants around campus and tailor the list to match what you're craving.
        </p>
        <div className="sidebar-search">
          <label htmlFor="search" className="sidebar-label">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search Boston restaurants..."
            value={searchTerm}
            onChange={(event) => {
              onFilterChange({ search: event.target.value });
              onSearchChange(event.target.value);
            }}
          />
          {suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((suggestion) => (
                <li key={suggestion.placeId}>
                  <button type="button" onClick={() => onSelectSuggestion(suggestion.placeId)}>
                    {suggestion.description}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedCandidate && (
          <div className="candidate-card">
            <div>
              <h3>{selectedCandidate.name}</h3>
              <p>{selectedCandidate.address}</p>
              <p className="candidate-meta">
                {[selectedCandidate.locationLabel, selectedCandidate.cuisine, selectedCandidate.priceLevel]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
            <button
              type="button"
              className="save-candidate"
              onClick={onSaveCandidate}
              disabled={isSavingCandidate}
            >
              {isSavingCandidate ? 'Saving…' : 'Add to list'}
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-section filters">
        <h3 className="section-heading">Filters</h3>
        <div className="filter-grid">
          <label className="sidebar-label">
            Cuisine
            <select value={filters.cuisine} onChange={handleSelectChange('cuisine')}>
              <option value="All">All</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </label>

          <label className="sidebar-label">
            Price
            <select value={filters.price} onChange={handleSelectChange('price')}>
              <option value="All">All</option>
              {prices.map((price) => (
                <option key={price} value={price}>
                  {price}
                </option>
              ))}
            </select>
          </label>

          <label className="sidebar-label">
            Neighborhood
            <select value={filters.location} onChange={handleSelectChange('location')}>
              <option value="All">All</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="sidebar-label rating-filter">
            Minimum rating
            <div className="rating-input">
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={filters.minRating}
                onChange={(event) => onFilterChange({ minRating: Number(event.target.value) })}
              />
              <span>{filters.minRating.toFixed(1)}+</span>
            </div>
          </label>
        </div>
        <button type="button" className="clear-filters" onClick={onClearFilters}>
          Reset filters
        </button>
      </div>

      <div className="sidebar-section">
        <h3 className="section-heading">Restaurants</h3>
        <div className="restaurant-list">
          {errorMessage ? (
            <p className="empty-state">{errorMessage}</p>
          ) : isLoading ? (
            <p className="empty-state">Loading restaurants…</p>
          ) : restaurants.length === 0 ? (
            <p className="empty-state">No matches yet. Try broadening your filters.</p>
          ) : (
            restaurants.map((restaurant) => {
              const fallbackRating = (restaurant as { rating?: number }).rating;
              const averageRating = restaurant.average_rating ?? fallbackRating ?? 0;
              const reviewTotal = restaurant.review_count ?? (fallbackRating ? 1 : 0);

              return (
                <div key={restaurant.id} className="restaurant-card">
                  <div className="restaurant-header">
                    <h4>{restaurant.name}</h4>
                    <span className="price-badge">{restaurant.price || '—'}</span>
                  </div>
                  <p className="restaurant-meta">
                    {(restaurant.cuisine || 'Cuisine')} • {(restaurant.location || 'Location')}
                  </p>
                  <p className="restaurant-address">{restaurant.address}</p>
                  <div className="restaurant-rating">
                    <span className="average-rating">★ {averageRating.toFixed(1)}</span>
                    <span className="rating-label">
                      {reviewTotal} review{reviewTotal === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="user-rating">
                    <span>Your rating</span>
                    {renderInteractiveStars(restaurant.id)}
                  </div>
                  {canRate ? (
                    <div className="review-input">
                      <label htmlFor={`comment-${restaurant.id}`}>Share a quick note</label>
                      <textarea
                        id={`comment-${restaurant.id}`}
                        value={userComments[restaurant.id] ?? ''}
                        onChange={(event) => onCommentChange(restaurant.id, event.target.value)}
                        placeholder="What stood out about this spot?"
                        rows={3}
                      />
                      <button
                        type="button"
                        onClick={() => onSubmitReview(restaurant.id)}
                        disabled={isSavingReview === restaurant.id}
                      >
                        {isSavingReview === restaurant.id ? 'Saving…' : 'Save review'}
                      </button>
                    </div>
                  ) : (
                    <p className="review-hint">Sign in to rate and review this restaurant.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
