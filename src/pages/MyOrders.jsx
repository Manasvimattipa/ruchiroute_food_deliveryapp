import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import './MyOrders.css';

const MyOrders = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Wait until Auth check is finished
    if (authLoading) return;

    // 2. If no user, stop loading and return
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 3. Setup real-time listener (Complex query first)
    setLoading(true);
    const complexQuery = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('orderTime', 'desc')
    );

    let unsubscribe;

    const startListener = (q, isComplex = true) => {
      return onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If we used the simple query, we must sort in memory
        if (!isComplex) {
          ordersData.sort((a, b) => {
            const timeA = a.orderTime?.toDate ? a.orderTime.toDate() : new Date(a.orderTime || 0);
            const timeB = b.orderTime?.toDate ? b.orderTime.toDate() : new Date(b.orderTime || 0);
            return timeB - timeA;
          });
        }
        
        setOrders(ordersData);
        setLoading(false);
      }, (error) => {
        console.error(`Error fetching orders (${isComplex ? 'complex' : 'simple'}):`, error);
        
        if (isComplex) {
          console.warn("Complex query failed. Attempting simple query + in-memory sort...");
          const simpleQuery = query(
            collection(db, 'orders'),
            where('userId', '==', currentUser.uid)
          );
          unsubscribe = startListener(simpleQuery, false);
        } else {
          setLoading(false);
        }
      });
    };

    unsubscribe = startListener(complexQuery, true);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, authLoading]);

  const getStatusColor = (status) => {
    const s = (status || '').trim().toLowerCase();
    switch (s) {
      case 'order placed': return '#7f8c8d';
      case 'preparing food': return '#f1c40f';
      case 'out for delivery': return '#3498db';
      case 'delivered': return '#2ecc71';
      default: return '#7f8c8d';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        <header className="orders-header">
          <div className="header-content">
            <button className="back-btn-circle" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1>My Orders</h1>
          </div>
          <p className="subtitle">Track and manage your previous orders</p>
        </header>

        {loading || authLoading ? (
          <div className="orders-loading">
            <div className="spinner"></div>
            <p>{authLoading ? 'Verifying account...' : 'Fetching your orders...'}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">🍔</div>
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
            <button className="browse-btn" onClick={() => navigate('/')}>Explore Restaurants</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card-premium">
                <div className="order-card-header">
                  <div className="restaurant-info">
                    <h3>{order.restaurantName}</h3>
                    <span className="order-date">{formatDate(order.orderTime)}</span>
                  </div>
                  <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                    {order.orderStatus}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-summary">
                    {order.itemsOrdered?.map((item, idx) => (
                      <span key={idx} className="item-tag">
                        {item.qty}x {item.name}
                      </span>
                    ))}
                  </div>
                  <div className="order-price-info">
                    <span className="price-label">Total Amount</span>
                    <span className="price-value">₹{order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button 
                    className="track-order-btn" 
                    onClick={() => navigate(`/order-tracking/${order.id}`)}
                  >
                    Track Order
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
