import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="cart-container">
          <header className="cart-header">
            <h1>Your Cart</h1>
          </header>
          <div className="empty-cart-content">
            <span className="empty-cart-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button className="browse-btn" onClick={() => navigate('/')}>Browse Restaurants</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <header className="cart-header">
          <h1>Your Cart ({totalItems})</h1>
        </header>

        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image">
                <img src={item.image || 'https://via.placeholder.com/100?text=Food'} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="item-restaurant">from {item.restaurantName}</p>
                  <p className="item-price">₹{item.price}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn">-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn">+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary-footer">
          <div className="summary-info">
            <div className="summary-row total">
              <span>Total Price:</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
          <div className="cart-footer-btns">
            <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>

        <footer className="page-navigation-footer">
          <button className="nav-btn-medium" onClick={() => navigate('/')}>
            BACK
          </button>
          <button className="nav-btn-medium" onClick={() => navigate('/checkout')}>
            NEXT
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Cart;
