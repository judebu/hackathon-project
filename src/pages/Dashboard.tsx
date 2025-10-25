import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { fetchMyReviews } from "../api/restaurants";
import type { Review } from "../types/restaurant";

type TabKey = "reviews" | "saved" | "profile";

const palette = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#F97316"];
const preferenceOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"];

interface SavedSummary {
  name: string;
  rating: number;
  totalReviews: number;
  cuisine?: string;
  imageUrl: string;
}

function getPlaceholderImage(name: string) {
  const encoded = encodeURIComponent(name);
  return `https://source.unsplash.com/featured/?food,${encoded}`;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefStatus, setPrefStatus] = useState<string | null>(null);

  const { user, preferences, updatePreferences } = useAuth();

  const [profileForm, setProfileForm] = useState({
    dietaryPrefs: new Set<string>(),
    homeLocation: "",
    favoriteCuisinesText: "",
  });

  useEffect(() => {
    setProfileForm({
      dietaryPrefs: new Set(preferences.dietaryPrefs ?? []),
      homeLocation: preferences.homeLocation ?? "",
      favoriteCuisinesText: (preferences.favoriteCuisines ?? []).join(", "),
    });
  }, [preferences]);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    setIsLoadingReviews(true);
    fetchMyReviews()
      .then((response) => {
        if (!isMounted) return;
        setReviews(response.reviews);
        setReviewError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setReviewError(error instanceof Error ? error.message : "Unable to load reviews.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    if (!reviews.length) {
      return { reviewsCount: 0, savedCount: 0, avgRating: "0.0" };
    }

    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      reviewsCount: reviews.length,
      savedCount: reviews.length,
      avgRating: (total / reviews.length).toFixed(1),
    };
  }, [reviews]);

  
  const categoryData = [
    { name: "American", value: 40 },
    { name: "Italian", value: 25 },
    { name: "Cherries", value: 20 },
    { name: "Grapes", value: 15 }
  ];

  // const categoryData = useMemo(() => {
  //   if (!reviews.length) return [];

  //   const cuisineCounts = new Map<string, number>();
  //   for (const review of reviews) {
  //     const cuisine = review.restaurant_cuisine || "Other";
  //     cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) ?? 0) + 1);
  //   }

  //   return Array.from(cuisineCounts.entries()).map(([name, value], index) => ({
  //     name,
  //     value,
  //     color: palette[index % palette.length],
  //   }));
  // }, [reviews]);

  const savedPlaces = useMemo<SavedSummary[]>(() => {
    const byRestaurant = new Map<
      number,
      { name: string; total: number; count: number; cuisine?: string }
    >();

    for (const review of reviews) {
      const entry = byRestaurant.get(review.restaurant_id) ?? {
        name: review.restaurant_name ?? "Unknown restaurant",
        total: 0,
        count: 0,
        cuisine: review.restaurant_cuisine ?? undefined,
      };
      entry.total += review.rating;
      entry.count += 1;
      byRestaurant.set(review.restaurant_id, entry);
    }

    return Array.from(byRestaurant.values())
      .map((entry) => ({
        name: entry.name,
        rating: Number((entry.total / entry.count).toFixed(1)),
        totalReviews: entry.count,
        cuisine: entry.cuisine,
        imageUrl: getPlaceholderImage(entry.name),
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [reviews]);

  const handlePreferenceToggle = (option: string) => {
    setProfileForm((prev) => {
      const nextSet = new Set(prev.dietaryPrefs);
      if (nextSet.has(option)) {
        nextSet.delete(option);
      } else {
        nextSet.add(option);
      }
      return { ...prev, dietaryPrefs: nextSet };
    });
  };

  const handlePreferenceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingPrefs(true);
    setPrefStatus(null);

    try {
      await updatePreferences({
        dietaryPrefs: Array.from(profileForm.dietaryPrefs),
        favoriteCuisines: profileForm.favoriteCuisinesText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        homeLocation: profileForm.homeLocation,
      });
      setPrefStatus("Preferences updated successfully.");
    } catch (error) {
      setPrefStatus(error instanceof Error ? error.message : "Unable to update preferences.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <div className="dashboard-header">
            <h1 className="header-name">Sign in to view your dashboard</h1>
            <p className="header-sub">
              Create an account or sign in to manage reviews, preferences, and saved spots.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <div className="dashboard-header">
          <div className="header-flex">
            <div className="profile-avatar">👤</div>
            <div>
              <h1 className="header-name">Welcome back, {user.name}</h1>
              <p className="header-sub">
                Here’s a quick look at your dining highlights around BU this week.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.reviewsCount}</div>
              <div className="stat-label">Reviews logged</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.savedCount}</div>
              <div className="stat-label">Restaurants rated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.avgRating}</div>
              <div className="stat-label">Average rating</div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`tab-button ${activeTab === "reviews" ? "tab-active" : ""}`}
          >
            My Reviews
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`tab-button ${activeTab === "saved" ? "tab-active" : ""}`}
          >
            Saved Places
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`tab-button ${activeTab === "profile" ? "tab-active" : ""}`}
          >
            Profile Settings
          </button>
        </div>


   
        <div>
          {activeTab === "reviews" && (
            <div>
              <div className="pie-section">
                <h2 className="section-heading">Dining Preferences</h2>
                <div className="pie-grid">
                  <div style={{ height: 320 }}>
                    {categoryData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => {
                              const pct = typeof percent === "number" ? percent : 0;
                              return `${name} ${(pct * 100).toFixed(0)}%`;
                            }}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="empty-state">Add reviews to see your cuisine breakdown.</div>
                    )}
                  </div>
                  <div className="category-list">
                    <h3 className="saved-title">Category Breakdown</h3>
                    {categoryData.length ? (
                      categoryData.map((category) => (
                        <div key={category.name} className="category-item">
                          <div className="category-left">
                            <div className="category-color" style={{ backgroundColor: category.color }} />
                            <span>{category.name}</span>
                          </div>
                          <span>{category.value} visits</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-state">No categories yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="section-heading">Recent Reviews</h2>
              {isLoadingReviews && <p className="empty-state">Loading your reviews…</p>}
              {reviewError && <p className="empty-state">{reviewError}</p>}
              {!isLoadingReviews && !reviewError && (
                <div
                  className="review-list"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {reviews.length === 0 ? (
                    <p className="empty-state">
                      You haven’t added any reviews yet. Head to Explore to rate a restaurant.
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-img" style={{ backgroundImage: `url(${getPlaceholderImage(review.restaurant_name ?? "food")})` }} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <h3 className="review-title">{review.restaurant_name ?? "Restaurant"}</h3>
                            <span className="review-date">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} style={{ color: star <= review.rating ? "#facc15" : "#d1d5db" }}>
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="review-comment">
                            {review.comment || "No written review added for this rating."}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              marginTop: "0.75rem",
                            }}
                          >
                            <span className="tag">
                              {review.restaurant_cuisine ? review.restaurant_cuisine : "Cuisine"}
                            </span>
                            {review.restaurant_location && (
                              <span className="tag muted">{review.restaurant_location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="saved-grid">
              {savedPlaces.length === 0 ? (
                <p className="empty-state">
                  Save restaurants by adding a review with a rating. Your favorites will collect here.
                </p>
              ) : (
                savedPlaces.map((place) => (
                  <div key={place.name} className="saved-card">
                    <img src={place.imageUrl} alt={place.name} className="saved-img" />
                    <div className="saved-body">
                      <h3 className="saved-title">{place.name}</h3>
                      <p className="saved-category">
                        {place.cuisine ? place.cuisine : "Cuisine"} • {place.totalReviews} review
                        {place.totalReviews > 1 ? "s" : ""}
                      </p>
                      <div className="saved-bottom">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <span style={{ color: "#facc15" }}>★</span>
                          <span>{place.rating}</span>
                        </div>
                        <button className="saved-heart">Saved</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <form className="profile-settings" onSubmit={handlePreferenceSubmit}>
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input type="text" value={user.name} className="form-input" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={user.email} className="form-input" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Dietary preferences</label>
                <div className="preference-list">
                  {preferenceOptions.map((option) => (
                    <label key={option} className="pref-item">
                      <input
                        type="checkbox"
                        checked={profileForm.dietaryPrefs.has(option)}
                        onChange={() => handlePreferenceToggle(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Favorite cuisines</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.favoriteCuisinesText}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, favoriteCuisinesText: event.target.value }))
                  }
                  placeholder="e.g. Japanese, Mediterranean, Vegan"
                />
                <p className="helper-text">Separate cuisines with commas.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Home base / campus area</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.homeLocation}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, homeLocation: event.target.value }))
                  }
                  placeholder="Allston, Brookline, Cambridge…"
                />
              </div>

              <button className="save-button" type="submit" disabled={isSavingPrefs}>
                {isSavingPrefs ? "Saving..." : "Update profile"}
              </button>

              {prefStatus && <p className="pref-status">{prefStatus}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
