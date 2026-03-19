import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalRestaurants: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersSnap, restaurantsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'restaurants')),
          getDocs(collection(db, 'users'))
        ]);

        const totalOrders = ordersSnap.size;
        const totalRestaurants = restaurantsSnap.size;
        const totalUsers = usersSnap.size;

        // Fetch revenue from analytics collection
        let totalRevenue = 0;
        let todayRevenue = 0;
        
        const revenueRef = doc(db, 'analytics', 'revenue');
        const revenueSnap = await getDoc(revenueRef);
        
        if (revenueSnap.exists()) {
          const data = revenueSnap.data();
          totalRevenue = data.totalRevenue || 0;
          
          // Reset today's revenue if date changed
          const now = new Date();
          const todayString = now.toDateString();
          const lastUpdatedDate = data.lastUpdated && data.lastUpdated.toDate ? data.lastUpdated.toDate().toDateString() : '';
          
          if (lastUpdatedDate === todayString) {
            todayRevenue = data.todayRevenue || 0;
          } else {
            // It's a new day, reset today's revenue
            todayRevenue = 0;
            await setDoc(revenueRef, { todayRevenue: 0, lastUpdated: new Date() }, { merge: true });
          }
        } else {
          // Initialize if it doesn't exist
          await setDoc(revenueRef, { totalRevenue: 0, todayRevenue: 0, lastUpdated: new Date() });
        }

        setStats({
          totalOrders,
          totalRevenue,
          todayRevenue,
          totalRestaurants,
          totalUsers
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Restaurants', value: stats.totalRestaurants, icon: '🏪', color: '#8B5E3C' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#8B5E3C' },
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#8B5E3C' },
    { label: 'Today\'s Revenue', value: `₹${stats.todayRevenue.toFixed(2)}`, icon: '💵', color: '#8B5E3C' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: '#8B5E3C' }
  ];

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin!</p>
      </header>

      {loading ? (
        <div className="admin-loading">Calculating statistics...</div>
      ) : (
        <div className="admin-stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ borderLeft: `5px solid ${stat.color}` }}>
              <div className="stat-icon" style={{ fontSize: '2rem' }}>{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.label}</h3>
                <div className="stat-value">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="admin-recent-content">
        <div className="admin-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="action-btn" onClick={() => navigate('/admin/restaurants')}>Manage Restaurants</button>
            <button className="action-btn" onClick={() => navigate('/admin/menu')}>Update Menu</button>
            <button className="action-btn" onClick={() => navigate('/admin/orders')}>View Orders</button>
            <button className="action-btn" onClick={() => navigate('/admin/analytics')}>Platform Analytics</button>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
