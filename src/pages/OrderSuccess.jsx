import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <div className="success-icon-wrapper">🎉</div>
        <h1>Order Placed!</h1>
        <p>Your delicious food is being prepared and will be with you shortly.</p>
        
        {orderId && (
          <div className="order-id-display">
            <p>Order ID: <strong>{orderId}</strong></p>
          </div>
        )}

        <div className="delivery-estimate">
          <h4>Estimated Delivery</h4>
          <span className="delivery-time">35 - 45 MINS</span>
        </div>

        <div className="success-actions">
          <button 
            className="track-btn" 
            onClick={() => orderId ? navigate(`/track-order/${orderId}`) : alert('Order ID not found. Please check your profile.')}
          >
            Track Order
          </button>
          <button className="home-btn" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
