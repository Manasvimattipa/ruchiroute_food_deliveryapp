import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  // Check if item is already in cart
  const cartItem = cart.find(item => item.id === food.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(food);
  };

  const handleIncrement = () => {
    updateQuantity(food.id, 1);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      removeFromCart(food.id);
    } else {
      updateQuantity(food.id, -1);
    }
  };

  const getImageUrl = (item) => {
    const img = item?.image || item?.imageUrl || item?.photoURL;
    if (img && img.trim() !== '') return img;

    const cat = (item?.category || '').toLowerCase();
    
    if (cat.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
    if (cat.includes('burger') || cat.includes('fried chicken')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd';
    if (cat.includes('non veg') || cat.includes('chicken') || cat.includes('mutton')) return 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db';
    if (cat.includes('veg')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd';
    if (cat.includes('seafood') || cat.includes('fish')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2';
    if (cat.includes('beverage') || cat.includes('drink') || cat.includes('coffee')) return 'https://images.unsplash.com/photo-1544145945-f904253d0c7b';
    
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
  };

  return (
    <div className="food-card slide-up-anim vertical">
      <div className="food-image-wrapper">
        <img 
          src={getImageUrl(food)} 
          alt={food.name} 
          className="food-image" 
        />
      </div>
      <div className="food-details">
        <div className="food-main-info">
          <h3 className="food-name">{food.name}</h3>
          <p className="food-restaurant">
            <span className="restaurant-icon">🏪</span> {food.restaurantName}
          </p>
        </div>
        
        <div className="food-bottom-row">
          <span className="food-price">₹{food.price}</span>
          <div className="food-action-container">
            {quantity > 0 ? (
              <div className="quantity-selector">
                <button className="qty-btn" onClick={handleDecrement}>-</button>
                <span className="qty-display">{quantity}</span>
                <button className="qty-btn" onClick={handleIncrement}>+</button>
              </div>
            ) : (
              <button className="add-to-cart-btn" onClick={handleAdd}>
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
