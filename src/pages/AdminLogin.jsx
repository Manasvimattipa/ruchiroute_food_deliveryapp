import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (email === 'admin@ruchiroute.com' && password === 'admin123') {
      try {
        await adminLogin(email, password);
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 500);
      } catch (err) {
        console.error(err);
        setError(err.message || "Invalid admin credentials");
        setLoading(false);
      }
    } else {
      setError("Invalid admin credentials");
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <h1>Admin Portal</h1>
            <p>Secure RuchiRoute Management</p>
          </div>
          
          {error && <div className="admin-error-alert">{error}</div>}

          <form onSubmit={handleLogin} className="admin-auth-form" autoComplete="off">
            <div className="admin-form-group">
              <label>Administrator Email</label>
              <input 
                type="email" 
                className="admin-input"
                placeholder="admin@ruchiroute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="admin-form-group">
              <label>Security Key</label>
              <input 
                type="password" 
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            
            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Portal'}
            </button>
          </form>

          <div className="admin-auth-footer">
            <button className="admin-text-btn" onClick={() => navigate('/login')}>&larr; Return to Customer Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
