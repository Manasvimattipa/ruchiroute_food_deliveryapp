import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../auth';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { login, logout, resendEmailVerificationEmail, forgotPassword } = useAuth();
  const navigate = useNavigate();

  // Cleanup effect: if the user leaves the page while unverified, log them out
  // This is because we keep them logged in temporarily to allow Resend to work.
  useEffect(() => {
    // Clear state variables when the login page loads
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
      setError('');
      setSuccessMessage('');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleManualResend = async () => {
    if (!email || !password) {
      setError('Please enter your email and password above first to resend verification.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        setSuccessMessage('Your email is already verified! You are now being logged in.');
        navigate('/welcome');
        return;
      }
      
      await resendEmailVerificationEmail(user);
      setSuccessMessage('Verification email sent! Please check your inbox.');
      setUnverifiedUser(user);
    } catch (err) {
      console.error("Manual resend error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        setError('Failed to resend: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout if user leaves before verifying, but ALSO poll for status updates
  useEffect(() => {
    let interval;
    if (unverifiedUser) {
      // Poll every 3 seconds to see if they've verified
      interval = setInterval(async () => {
        try {
          await unverifiedUser.reload();
          if (unverifiedUser.emailVerified) {
            clearInterval(interval);
            setSuccessMessage('');
            setError('');
            // Success! Send them to the welcome page
            navigate('/welcome');
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (unverifiedUser) {
        // Technically they might still be logged in if they just close the tab,
        // but this handles internal navigation.
        logout();
      }
    };
  }, [unverifiedUser, navigate, logout]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setError('Please enter your email to reset password.');
    
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      await forgotPassword(resetEmail);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("Account not found. Please sign up first.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email format.");
      } else {
        setError('Failed to send reset email: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);
      
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      // login() already calls user.reload() internally, but let's be double sure
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setUnverifiedUser(user);
        setLoading(false);
        return;
      }
      
      navigate('/welcome');
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email format.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError('Failed to log in: ' + err.message);
      }
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-brand">
        <h1>RuchiRoute</h1>
        <p>Delicious food, delivered to your door.</p>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to your account to order delicious food</p>
          
          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success" style={{
            padding: '1rem',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid #c3e6cb'
          }}>{successMessage}</div>}

          {unverifiedUser && !successMessage && (
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
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
          
          {!showForgotPassword ? (
            <>
              <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="user-email"
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="new-email"
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="password">Password</label>
                    <button 
                      type="button"
                      onClick={() => {
                          setShowForgotPassword(true);
                          setResetEmail(email);
                          setError('');
                          setSuccessMessage('');
                      }}
                      className="auth-link-button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e67e22',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '0',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    name="user-password"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                  />
                </div>
                <button disabled={loading} type="submit" className="auth-button">
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
              
              {!unverifiedUser && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>
                    Didn't receive verification email? 
                    <button 
                      onClick={handleManualResend}
                      disabled={loading}
                      className="auth-link-button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e67e22',
                        marginLeft: '5px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {loading ? 'Processing...' : 'Resend now'}
                    </button>
                  </p>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="resetEmail">Email Address</label>
                <input 
                  type="email" 
                  id="resetEmail" 
                  required 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email"
                />
              </div>
              <button disabled={loading} type="submit" className="auth-button">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                      setSuccessMessage('');
                  }}
                  className="auth-link-button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
          
          <div className="auth-footer">
            Need an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
