import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './OrderTracking.css';

// Fix for Leaflet icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const cityPositions = {
  'CHENNAI': [13.0827, 80.2707],
  'BANGALORE': [12.9716, 77.5946],
  'HYDERABAD': [17.3850, 78.4867],
  'VIZAG': [17.6868, 83.2185]
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusStages = [
    { id: 'Order Placed', label: 'Order Placed', icon: '📝' },
    { id: 'Preparing Food', label: 'Preparing Food', icon: '🍳' },
    { id: 'Out for Delivery', label: 'Out for Delivery', icon: '🛵' },
    { id: 'Delivered', label: 'Delivered', icon: '✅' }
  ];

  useEffect(() => {
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, 'orders', orderId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const orderData = { id: docSnapshot.id, ...docSnapshot.data() };
        setOrder(orderData);

        // Fetch restaurant separately to keep listener sync
        if (orderData.restaurantId) {
          getDoc(doc(db, 'restaurants', orderData.restaurantId))
            .then(restDoc => {
              if (restDoc.exists()) {
                setRestaurant(restDoc.data());
              }
            })
            .catch(err => console.error("Error fetching restaurant:", err));
        }
        setLoading(false);
      } else {
        setOrder(null);
        setLoading(false);
      }
    }, (err) => {
      console.error("OrderTracking Snapshot Error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [orderId]);

  if (loading) return <div className="tracking-loading">Locating your order...</div>;
  if (!order) return <div className="tracking-error">Order not found.</div>;

  const currentStatusIndex = statusStages.findIndex(s => s.id.toLowerCase() === (order.orderStatus || '').trim().toLowerCase());

  return (
    <div className="order-tracking-page">
      <div className="tracking-container-limited">
        <header className="tracking-info-header">
          <div className="header-top-row">
            <button className="back-btn-minimal" title="Back to Home" onClick={() => navigate('/')}>←</button>
            <h1>Order Status</h1>
          </div>
        </header>



        <div className="tracking-details-section">
          <div className="tracking-grid-layout">
            <div className="status-column">
              <section className="detail-card address-card">
                <h3>Delivery Address</h3>
                <p className="address-text">{order.deliveryAddress}</p>
                <p className="city-tag">{order.city}</p>
              </section>

              <section className="detail-card timeline-card">
                <h3>Order Status Progress</h3>
                <div className="tracking-timeline-vertical">
                  {statusStages.map((stage, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    return (
                      <div key={stage.id} className={`vert-timeline-item ${isCompleted ? 'checked' : ''} ${isCurrent ? 'active' : ''}`}>
                        <div className="node">
                          <div className="node-circle">{isCompleted ? <strong>✓</strong> : ''}</div>
                          {index < statusStages.length - 1 && <div className="node-line"></div>}
                        </div>
                        <div className="node-text">
                          <span className="node-icon">{stage.icon}</span>
                          <h4>{stage.label}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="order-details-column">
              <section className="detail-card bill-card">
                <h3>Bill Summary</h3>
                <div className="bill-items">
                  {order.itemsOrdered?.map((item, idx) => (
                    <div key={idx} className="bill-line">
                      <span>{item.qty}x {item.name}</span>
                      <span>₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="bill-total-highlight">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount?.toFixed(2)}</span>
                </div>
                <p className="paid-via">Paid via: <strong>{order.paymentMethod}</strong></p>
              </section>
            </aside>
          </div>
        </div>
        <footer className="tracking-footer">
          <button className="nav-btn-medium" onClick={() => navigate('/')}>
            BACK TO HOME
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OrderTracking;
