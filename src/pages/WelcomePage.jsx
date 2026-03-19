import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './WelcomePage.css';

const WelcomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Get the display name, or fallback to email prefix if not set
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Foodie';

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Hi, {displayName}!</h1>
        <p className="welcome-subtitle">Welcome back to RuchiRoute</p>
        
        <button 
          className="welcome-btn" 
          onClick={() => navigate('/')}
        >
          Explore Menu
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
