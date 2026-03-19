import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Menu.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { cart, addToCart, updateQuantity, totalItems } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to get item quantity from cart
  const getItemQuantity = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = (item, amount) => {
    const currentQty = getItemQuantity(item.id);
    if (currentQty === 0 && amount > 0) {
      addToCart({
        id: item.id,
        name: item.itemName || item.name,
        price: item.price,
        image: item.image || item.imageUrl || item.photoURL,
        restaurantName: restaurant.name,
        restaurantId: id
      });
    } else {
      updateQuantity(item.id, amount);
    }
  };

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        const restDoc = await getDoc(doc(db, 'restaurants', id));
        if (!restDoc.exists()) {
          setError('Restaurant not found');
          setLoading(false);
          return;
        }
        const restData = { id: restDoc.id, ...restDoc.data() };
        setRestaurant(restData);

        // Fetch menu items
        const menuQuery = query(collection(db, 'menu'), where('restaurantId', '==', id));
        const menuSnapshot = await getDocs(menuQuery);
        let menuData = menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().itemName || doc.data().name || doc.data().title || 'Unnamed Item',
          image: doc.data().image || doc.data().imageUrl || doc.data().photoURL || doc.data().img || doc.data().url || doc.data().src
        }));

        const subMenuSnapshot = await getDocs(collection(db, `restaurants/${id}/menu`));
        const subMenuData = subMenuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || doc.data().itemName,
          image: doc.data().image || doc.data().imageUrl || doc.data().photoURL
        }));

        menuData = [...menuData, ...subMenuData];
        setMenus(menuData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id]);

  const getImageUrl = (item, type = 'food') => {
    // 1. Check all standard image fields
    let img = item?.image || item?.imageUrl || item?.photoURL || item?.img || item?.url || item?.src || item?.pic || item?.photo;
    
    // 2. Extra robust: Check if name/title itself is a URL (happens when user pastes URL in name field)
    const possibleUrlFields = [item?.name, item?.itemName, item?.title];
    if (!img || img.trim() === '') {
      const foundUrl = possibleUrlFields.find(f => typeof f === 'string' && (f.startsWith('http') || f.includes('.jpg') || f.includes('.png') || f.includes('.jpeg')));
      if (foundUrl) img = foundUrl;
    }

    if (img && typeof img === 'string' && img.trim() !== '' && (img.startsWith('http') || img.startsWith('blob') || img.startsWith('data:'))) {
      return img;
    }

    // 3. Category Fallbacks
    const cat = (item?.category || (item?.cuisine) || '').toLowerCase();
    if (cat.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
    if (cat.includes('burger') || cat.includes('fried chicken')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd';
    if (cat.includes('non veg') || cat.includes('chicken') || cat.includes('mutton') || cat.includes('biryani')) return 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db';
    if (cat.includes('veg') || cat.includes('dosa') || cat.includes('idli')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd';
    if (cat.includes('seafood') || cat.includes('fish')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2';
    if (cat.includes('beverage') || cat.includes('drink') || cat.includes('coffee') || cat.includes('lassi')) return 'https://images.unsplash.com/photo-1544145945-f904253d0c7b';
    
    return type === 'restaurant' 
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4' 
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Loading Restaurant...</div>;
  if (error || !restaurant) return <div className="error-container"><h2>{error}</h2><button onClick={() => navigate('/')}>Home</button></div>;

  const groupedMenus = menus.reduce((acc, item) => {
    const cat = item.category || 'Main Menu';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>RuchiRoute</div>
        <div className="user-controls">
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            🛒 Cart <span className="cart-badge">{totalItems}</span>
          </button>
          <div className="profile-section" onClick={() => navigate('/profile')}>
            <img src={userProfile?.profilePhotoUrl || userProfile?.photoURL || ''} alt="Profile" className="nav-avatar" />
            <span className="nav-username">{userProfile?.displayName || 'User'}</span>
          </div>
        </div>
      </header>

      <div className="restaurant-hero">
        <div 
          className="restaurant-hero-img" 
          style={{ backgroundImage: `url(${getImageUrl(restaurant, 'restaurant')})` }} 
        />
        <div className="restaurant-hero-overlay">
          <div className="restaurant-hero-content">
            <h1>{restaurant.name}</h1>
            <p>{restaurant.cuisine || restaurant.category} • {restaurant.city}</p>
            <div className="restaurant-hero-meta">
              <span className="rating-tag">★ {restaurant.rating}</span>
              <span className="time-tag">{restaurant.deliveryTime || '30-45 min'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="restaurant-content-layout vertical-stack">
        <main className="menu-container centered-view">
          {menus.length === 0 ? (
            <div className="no-menu"><h3>Menu coming soon!</h3></div>
          ) : (
            Object.keys(groupedMenus).map(category => (
              <div key={category} className="menu-category">
                <h2>{category}</h2>
                <div className="menu-grid">
                  {groupedMenus[category].map(item => {
                    const qty = getItemQuantity(item.id);
                    const itemImage = getImageUrl(item);
                    return (
                      <div key={item.id} className="menu-item-card">
                        <div className="menu-item-image-container">
                          {itemImage && <div className="menu-item-image" style={{ backgroundImage: `url(${itemImage})` }} />}
                        </div>
                        <div className="menu-item-info">
                          <h3>{item.name?.startsWith('http') ? 'Special Item' : item.name}</h3>
                          <p className="menu-item-desc">{item.description}</p>
                          <div className="menu-item-footer">
                            <span className="menu-item-price">₹{(item.price || 0).toFixed(2)}</span>
                            <div className="menu-qty-wrapper-inline">
                              {qty > 0 ? (
                                <div className="qty-control">
                                  <button onClick={() => handleUpdateQuantity(item, -1)}>-</button>
                                  <span>{qty}</span>
                                  <button onClick={() => handleUpdateQuantity(item, 1)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn-minimal" onClick={() => handleUpdateQuantity(item, 1)}>ADD</button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      <footer className="page-navigation-footer">
        <button className="nav-btn-medium" onClick={() => navigate('/')}>
          BACK
        </button>
        <button className="nav-btn-medium" onClick={() => navigate('/cart')}>
          NEXT
        </button>
      </footer>
    </div>
  );
};

export default RestaurantDetail;
