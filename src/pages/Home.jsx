import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RestaurantCard from '../components/RestaurantCard';
import FoodCard from '../components/FoodCard';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/Restaurants.css';

// City coordinates for the map
const cityPositions = {
  'CHENNAI': [13.0827, 80.2707],
  'BANGALORE': [12.9716, 77.5946],
  'HYDERABAD': [17.3850, 78.4867],
  'VIZAG': [17.6868, 83.2185]
};

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  const { totalItems } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [cityInput, setCityInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menusByRestaurant, setMenusByRestaurant] = useState({});
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Available cities mapping for UI
  const availableCities = ['CHENNAI', 'BANGALORE', 'HYDERABAD', 'VIZAG'];

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'restaurants'));
        const restaurantsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching restaurants: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch menus when user city is set
  useEffect(() => {
    const fetchCityMenus = async () => {
      if (!userProfile?.city || restaurants.length === 0) return;
      
      setLoadingMenus(true);
      const cityRest = restaurants.filter(r => r.city?.toLowerCase() === userProfile?.city?.toLowerCase());
      const newMenusByRest = {};
      
      for (const rest of cityRest) {
        try {
          const rootMenuQ = query(collection(db, 'menu'), where('restaurantId', '==', rest.id));
          const rootSnap = await getDocs(rootMenuQ);
          const rootData = rootSnap.docs.map(d => ({ 
            id: d.id,
            name: d.data().itemName || d.data().name || d.data().title || 'Unnamed Item', 
            image: d.data().image || d.data().imageUrl || d.data().photoURL || d.data().img,
            ...d.data() 
          }));

          const subMenuSnap = await getDocs(collection(db, `restaurants/${rest.id}/menu`));
          const subData = subMenuSnap.docs.map(d => ({ 
            id: d.id,
            name: d.data().itemName || d.data().name || d.data().title || 'Unnamed Item',
            image: d.data().image || d.data().imageUrl || d.data().photoURL || d.data().img,
            ...d.data() 
          }));

          newMenusByRest[rest.id] = [...rootData, ...subData];
        } catch (e) {
          console.error(e);
        }
      }
      setMenusByRestaurant(newMenusByRest);
      setLoadingMenus(false);
    };

    fetchCityMenus();
  }, [userProfile?.city, restaurants]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleSaveCity = async () => {
    if (cityInput) {
      await updateUserProfile({ city: cityInput });
    }
  };

  const handleExplore = () => {
    const grid = document.querySelector('.restaurants-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter restaurants by selected city and search query
  const displayResults = useMemo(() => {
    if (!userProfile?.city) return [];
    
    const cityRestaurants = restaurants.filter(r => r.city?.toLowerCase() === userProfile?.city?.toLowerCase());
    
    if (!searchQuery.trim()) {
      // Default: show restaurants in city
      return cityRestaurants.map(r => ({ ...r, type: 'restaurant' }));
    }

    const queryLower = searchQuery.toLowerCase();
    const results = [];

    // 1. Check for restaurant matches
    cityRestaurants.forEach(rest => {
      if (rest.name.toLowerCase().includes(queryLower)) {
        results.push({ ...rest, type: 'restaurant' });
      }
    });

    // 2. Check for food item matches
    cityRestaurants.forEach(rest => {
      const menus = menusByRestaurant[rest.id] || [];
      menus.forEach(item => {
        const itemName = (item.name || item.itemName || '').toLowerCase();
        if (itemName.includes(queryLower)) {
          // Avoid duplicate entries if something is already in results
          if (!results.find(r => r.id === `food-${rest.id}-${item.id || item.name}`)) {
            results.push({
              ...item,
              id: item.id || `food-${rest.id}-${item.name}`,
              name: item.name || item.itemName,
              restaurantId: rest.id,
              restaurantName: rest.name,
              type: 'food'
            });
          }
        }
      });
    });

    return results;
  }, [restaurants, userProfile?.city, searchQuery, menusByRestaurant]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading restaurants...</div>;
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="home-logo">RuchiRoute</div>
        <div className="user-controls">
          <button className="nav-btn-secondary" onClick={() => navigate('/my-orders')}>
            📋 My Orders
          </button>
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            🛒 Cart <span className="cart-badge">{totalItems}</span>
          </button>
          
          <div className="nav-profile-wrapper" onClick={() => navigate('/profile')}>
            <div className="nav-avatar-circle">
              {(userProfile?.displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="nav-profile-info">
              <span className="nav-username">{userProfile?.displayName || 'User'}</span>
              <button className="nav-logout-link" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>Log Out</button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className={`restaurants-container ${!userProfile?.city ? 'full-center' : ''}`}>
        {!userProfile?.city ? (
          <div className="location-prompt-container">
            <div className="full-width-map-section">
              <div className="location-map-wrapper full-screen">
                <MapContainer center={[16.5, 80.5]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {Object.entries(cityPositions).map(([name, pos]) => (
                    <Marker 
                      key={name} 
                      position={pos}
                      eventHandlers={{
                        click: () => setCityInput(name),
                      }}
                    >
                      <Popup>{name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="location-card mini-overlap">
              <div className="location-card-content">
                <span className="location-icon">📍</span>
                <h3>Select Your Location</h3>
                <p>Pick a city from the map or use the dropdown to see top restaurants nearby.</p>
                
                <div className="location-select-wrapper">
                  <select 
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="location-select"
                  >
                    <option value="" disabled>Or choose a city</option>
                    {availableCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button 
                    className="save-location-btn" 
                    onClick={handleSaveCity}
                    disabled={!cityInput}
                  >
                    Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="home-hero-section">
              <div className="hero-content-wrapper">
                <h1 className="hero-main-title">Delicious food delivered to your door</h1>
                <p className="hero-subtext">Artisanal flavors, fresh ingredients, and your favorite local restaurants.</p>
                <div className="hero-buttons">
                  <button className="hero-primary-btn" onClick={handleExplore}>Explore Restaurants</button>
                </div>
              </div>
            </div>

            <div className="location-strip">
              <div className="restaurants-header-row">
                <div className="header-titles">
                  <h2>Deliver to: <span className="highlight-city">{userProfile.city}</span></h2>
                  <button className="change-city-btn" onClick={() => updateUserProfile({ city: null })}>Change</button>
                </div>
                
                <div className="search-container bounce-anim">
                  <div className="search-bar-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search for food (e.g., pizza, biryani...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="food-search-input"
                    />
                    {loadingMenus && <span className="search-spinner">...</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {displayResults.length > 0 ? (
              <div className="restaurants-grid">
                {displayResults.map((item) => (
                  item.type === 'restaurant' ? (
                    <RestaurantCard key={item.id} restaurant={item} />
                  ) : (
                    <FoodCard key={item.id} food={item} />
                  )
                ))}
              </div>
            ) : (
              <div className="no-restaurants">
                {searchQuery ? (
                  <div className="no-results-anim">
                    <span className="sad-food">🍽️</span>
                    <p>No results found for "{searchQuery}" in {userProfile.city}.</p>
                  </div>
                ) : (
                  <p>No restaurants available in {userProfile.city}.</p>
                )}
              </div>
            )}

            <footer className="page-navigation-footer">
              <button className="nav-btn-medium" onClick={() => navigate('/welcome')}>
                BACK
              </button>
              <button className="nav-btn-medium" onClick={() => navigate('/cart')}>
                NEXT
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
