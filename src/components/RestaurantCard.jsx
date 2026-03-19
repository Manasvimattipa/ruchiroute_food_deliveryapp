import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Restaurants.css';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const getImageUrl = (item, type = 'restaurant') => {
    const img = item?.image || item?.imageUrl || item?.photoURL;
    if (img && img.trim() !== '') return img;

    const cat = (item?.category || item?.cuisine || '').toLowerCase();
    
    if (cat.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
    if (cat.includes('burger') || cat.includes('fried chicken')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd';
    if (cat.includes('non veg') || cat.includes('chicken') || cat.includes('mutton')) return 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db';
    if (cat.includes('veg')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd';
    if (cat.includes('seafood') || cat.includes('fish')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2';
    if (cat.includes('beverage') || cat.includes('drink') || cat.includes('coffee')) return 'https://images.unsplash.com/photo-1544145945-f904253d0c7b';
    
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';
  };

  return (
    <div className="restaurant-card" onClick={() => navigate(`/restaurant/${restaurant.id}`)}>
      <div className="restaurant-image">
        <div 
          className="restaurant-image-img"
          style={{ backgroundImage: `url(${getImageUrl(restaurant)})` }}
        />
      </div>
      <div className="restaurant-info">
        <div className="restaurant-main-row">
          <h3 className="restaurant-name">{restaurant.name}</h3>
          <span className="restaurant-rating">★ {restaurant.rating}</span>
        </div>
        <p className="restaurant-cuisine">{restaurant.cuisine || restaurant.category}</p>
        <div className="restaurant-meta-footer">
          <span className="restaurant-time">{restaurant.deliveryTime || '30-45 min'}</span>
          <span className="restaurant-fee">
            {restaurant.deliveryFee === 0 || restaurant.deliveryFee === undefined ? 'Free Delivery' : `₹${restaurant.deliveryFee} Delivery`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
