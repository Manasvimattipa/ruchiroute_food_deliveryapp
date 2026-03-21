import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './Profile.css';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUserProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error("Update error:", error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <h1>User Profile</h1>
        </header>

        <div className="profile-card">
          <div className="profile-photo-section">
            <div className="avatar-wrapper default-avatar">
              <div className="profile-avatar-initials">
                {getInitials(userProfile?.displayName || currentUser?.displayName)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {message.text && (
              <div className={`message-banner ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={currentUser?.email || ''} disabled className="readonly-input" />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete delivery address"
                rows="3"
              />
            </div>

            <button 
              type="button" 
              className="orders-history-btn" 
              onClick={() => navigate('/my-orders')}
            >
              📋 View Order History
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <footer className="page-navigation-footer">
          <button className="nav-btn-outline" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            GO BACK
          </button>
          <button className="nav-btn-filled" onClick={handleSubmit} disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
