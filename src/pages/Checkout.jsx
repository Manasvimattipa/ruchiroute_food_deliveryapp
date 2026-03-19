import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import './Checkout.css';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { userProfile, currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState(userProfile?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upiStep, setUpiStep] = useState('select'); // 'select', 'loading', 'success'
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile?.address && !address) {
      setAddress(userProfile.address);
    }
  }, [userProfile, address]);

  const deliveryFee = 45;
  const gst = (totalPrice * 0.05).toFixed(2);
  const totalToPay = (totalPrice + deliveryFee + parseFloat(gst)).toFixed(2);

  if (cart.length === 0) {
    return (
      <div className="checkout-page empty">
        <div className="checkout-container">
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button onClick={() => navigate('/')} className="pay-btn">Go Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !address) {
      alert("Please enter a delivery address");
      return;
    }
    if (currentStep === 2 && !paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (currentStep === 3) {
        // Just move to step 4
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/cart');
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      const confirmed = window.confirm("Confirm order with Cash on Delivery?");
      if (!confirmed) return;
    }

    processFinalOrder();
  };



  const handleUpiSelection = (appName) => {
    setSelectedUpiApp(appName);
    setError('');
  };

  const processFinalOrder = async () => {
    setIsProcessing(true);
    setError('');
    
    // Phase 1: Payment Successful
    setUpiStep('loading');
    
    try {
      // Simulate bank delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUpiStep('success'); // Shows "Payment Successful"
      
      // Phase 2: Order Processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (address !== userProfile?.address) {
        await updateUserProfile({ address });
      }

      const orderData = {
        userId: currentUser?.uid || 'guest',
        userName: userProfile?.displayName || currentUser?.displayName || 'Manasvi',
        userEmail: currentUser?.email || 'manasvi@gmail.com',
        restaurantId: cart[0]?.restaurantId || 'unknown',
        restaurantName: cart[0]?.restaurantName || 'RuchiRoute Partner',
        itemsOrdered: cart.map(item => ({
          name: item.name,
          qty: item.quantity,
          price: item.price
        })),
        totalAmount: parseFloat(totalToPay),
        paymentMethod: paymentMethod.toUpperCase(),
        deliveryAddress: address,
        city: userProfile?.city || 'Default',
        orderStatus: "Order Placed",
        orderTime: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Update Revenue Analytics
      try {
        const revenueRef = doc(db, 'analytics', 'revenue');
        const revenueSnap = await getDoc(revenueRef);
        
        const now = new Date();
        const todayString = now.toDateString();
        const orderTotal = parseFloat(totalToPay);
        
        let newTotal = orderTotal;
        let newToday = orderTotal;
        
        if (revenueSnap.exists()) {
          const data = revenueSnap.data();
          const lastUpdatedDate = data.lastUpdated && data.lastUpdated.toDate ? data.lastUpdated.toDate().toDateString() : '';
          
          newTotal = (data.totalRevenue || 0) + orderTotal;
          
          if (lastUpdatedDate === todayString) {
            newToday = (data.todayRevenue || 0) + orderTotal;
          } else {
            newToday = orderTotal;
          }
        }
        
        await setDoc(revenueRef, {
          totalRevenue: newTotal,
          todayRevenue: newToday,
          lastUpdated: new Date()
        }, { merge: true });
        
      } catch (analyticsErr) {
        console.error("Error updating analytics:", analyticsErr);
      }
      
      setUpiStep('placed'); // Special state to show "Order Placed"
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      clearCart();
      navigate('/order-tracking/' + docRef.id);
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order. Please try again.");
      setUpiStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Address</div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Payment</div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Review</div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Pay</div>
    </div>
  );

  const getPayButtonLabel = () => {
    if (paymentMethod === 'cod') return "Place Order";
    if (paymentMethod === 'upi') return `Pay ₹${totalToPay}`;
    if (paymentMethod === 'card') return `Pay ₹${totalToPay}`;
    return `Pay ₹${totalToPay}`;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-background-overlay"></div>
      <div className="checkout-container">
        <header className="checkout-header">
          <h1>
            {currentStep === 1 ? 'Delivery Address' : 
             currentStep === 2 ? 'Payment Method' : 
             currentStep === 3 ? 'Review Order' : 'Complete Payment'}
          </h1>
        </header>

        {renderStepIndicator()}

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <main className="checkout-main-content">
          {currentStep === 1 && (
            <section className="step-content fade-in">
              <div className="section-card">
                <h3>Select Delivery Address</h3>
                <textarea 
                  className="address-textarea"
                  placeholder="Enter your full address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="4"
                />
                <p className="hint">Your address will be saved for future orders.</p>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="step-content fade-in">
              <div className="section-card">
                <h3>Choose Payment Mode</h3>
                <div className="payment-options">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                    { id: 'upi', label: 'UPI / Google Pay', icon: '📱' },
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳' }
                  ].map(method => (
                    <div 
                      key={method.id}
                      className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <span className="method-icon">{method.icon}</span>
                      <span className="method-label">{method.label}</span>
                      <div className="radio-circle"></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="step-content fade-in">
              <div className="section-card">
                <h3>Review Your Order</h3>
                <div className="order-review-items">
                  {cart.map((item) => (
                    <div key={item.id} className="review-item">
                      <div className="review-item-main">
                        <span className="review-item-qty">{item.quantity}x</span>
                        <span className="review-item-name">{item.name}</span>
                      </div>
                      <span className="review-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="bill-details-compact">
                  <div className="bill-row">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="bill-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="bill-row">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="divider" style={{ margin: '10px 0', height: '1px', background: '#eee' }}></div>
                  <div className="total-row-highlight">
                    <span>Total Amount</span>
                    <span>₹{totalToPay}</span>
                  </div>
                </div>

                <div className="delivery-summary-card">
                  <div className="summary-section">
                    <h4>Delivering to:</h4>
                    <p>{address}</p>
                  </div>
                  <div className="summary-section">
                    <h4>Payment via:</h4>
                    <p>{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : 'Card'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="step-content fade-in">
              <div className="section-card payment-final-card" style={{ textAlign: 'center' }}>
                {paymentMethod === 'card' ? (
                  <div className="card-form-simulation">
                    <h3>Enter Card Details</h3>
                    <div className="dummy-card-fields" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '20px auto' }}>
                      <input type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" className="address-textarea" style={{ height: '45px' }} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="MM/YY" className="address-textarea" style={{ height: '45px' }} />
                        <input type="password" placeholder="CVV" className="address-textarea" style={{ height: '45px' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="payment-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {paymentMethod === 'cod' ? '💵' : '📱'}
                    </div>
                    <h3>Final Step</h3>
                    <p>You are paying <strong>₹{totalToPay}</strong> via <strong>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}</strong>.</p>
                    
                    {paymentMethod === 'upi' && (
                      <div className="upi-selection-inline">
                        <h4>Choose UPI App</h4>
                        <div className="upi-grid-compact">
                          {[
                            { name: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg' },
                            { name: 'PhonePe', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
                            { name: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' }
                          ].map(app => (
                            <button 
                              key={app.name} 
                              className={`upi-app-mini-btn ${selectedUpiApp === app.name ? 'selected' : ''}`}
                              onClick={() => handleUpiSelection(app.name)}
                            >
                              <img src={app.icon} alt={app.name} />
                              <span>{app.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="payment-simulation-box" style={{ padding: '20px', background: '#f9f9f9', borderRadius: '12px', margin: '20px 0' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    {paymentMethod === 'cod' ? 'No advance payment needed. Pay when you receive your food.' : ''}
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="page-navigation-footer">
          <button className="nav-btn-outline" onClick={handleBackStep} disabled={isProcessing}>
            BACK
          </button>
          {currentStep < 4 ? (
            <button className="nav-btn-filled" onClick={handleNextStep}>
              NEXT STEP
            </button>
          ) : (
            <button 
              className="nav-btn-filled" 
              onClick={handlePlaceOrder} 
              disabled={isProcessing || (paymentMethod === 'upi' && !selectedUpiApp)}
            >
              {isProcessing ? 'Processing...' : getPayButtonLabel()}
            </button>
          )}
        </footer>

        {(isProcessing || upiStep === 'success' || upiStep === 'placed') && (
          <div className="upi-modal-overlay">
            <div className="upi-modal-content">
              {upiStep === 'loading' && (
                <div className="upi-loading">
                  <div className="spinner"></div>
                  <p>Processing payment via {selectedUpiApp}...</p>
                </div>
              )}
              {upiStep === 'success' && (
                <div className="upi-success">
                  <span className="success-icon">💰</span>
                  <h3>Payment Successful</h3>
                </div>
              )}
              {upiStep === 'placed' && (
                <div className="upi-success">
                  <span className="success-icon">🎉</span>
                  <h3>Order Placed!</h3>
                  <p>Redirecting to tracking...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
