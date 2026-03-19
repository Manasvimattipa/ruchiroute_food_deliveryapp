import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const { register, resendEmailVerificationEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear state variables when the registration page loads
    const timer = setTimeout(() => {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setMessage('');
      setUnverifiedUser(null);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleResend = async () => {
    if (!unverifiedUser) return;
    try {
      setLoading(true);
      setError('');
      await resendEmailVerificationEmail(unverifiedUser);
      setMessage('Verification email sent again! Please check your inbox.');
    } catch (err) {
      setError('Failed to resend verification email: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
        return setError("Please enter a valid email address.");
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      const userCredential = await register(email, password, name);
      setUnverifiedUser(userCredential.user);
      setMessage('Verification email sent! Please verify your email before logging in.');
    } catch (err) {
      console.error("Registration error:", err);
      if (err.message === "verification-email-failed") {
        setError("Email does not exist or cannot receive mail.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email format.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError('Failed to create an account: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-brand">
        <h1>RuchiRoute</h1>
        <p>Your favorite meals, just a click away.</p>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join RuchiRoute for the best food delivery</p>
          
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success" style={{ 
            padding: '1rem', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid #c3e6cb'
          }}>{message}</div>}

          {unverifiedUser && message && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <button 
                onClick={handleResend} 
                disabled={loading}
                className="auth-link-button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e67e22',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Sending...' : 'Didn\'t receive email? Resend'}
              </button>
            </div>
          )}
          
          {!message ? (
            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="new-user-name"
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="new-name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="new-user-email"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="new-email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="new-user-password"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="new-user-confirm-password"
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </div>
            <button disabled={loading} type="submit" className="auth-button">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/login" className="auth-button" style={{ display: 'block', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          )}

          
          <div className="auth-footer">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
