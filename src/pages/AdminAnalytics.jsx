import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './AdminPortal.css';

const AdminAnalytics = () => {
  const [data, setData] = useState({
    dailyOrders: [
      { day: 'Mon', count: 45 },
      { day: 'Tue', count: 52 },
      { day: 'Wed', count: 38 },
      { day: 'Thu', count: 65 },
      { day: 'Fri', count: 89 },
      { day: 'Sat', count: 120 },
      { day: 'Sun', count: 95 },
    ],
    revenueByDay: [
      { day: 'Mon', amount: 12500 },
      { day: 'Tue', amount: 14200 },
      { day: 'Wed', amount: 10800 },
      { day: 'Thu', amount: 18500 },
      { day: 'Fri', amount: 25900 },
      { day: 'Sat', amount: 32000 },
      { day: 'Sun', amount: 27500 },
    ],
    topRestaurants: [],
    mostOrderedFood: [
      { name: 'Paneer Tikka', count: 156 },
      { name: 'Chicken Biryani', count: 142 },
      { name: 'Masala Dosa', count: 128 },
      { name: 'Butter Naan', count: 110 },
      { name: 'Gulab Jamun', count: 95 },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const restaurantsSnap = await getDocs(collection(db, 'restaurants'));
        
        const restaurantsMap = {};
        restaurantsSnap.docs.forEach(d => {
          restaurantsMap[d.id] = d.data().name;
        });

        const revByRest = {};
        ordersSnap.docs.forEach(doc => {
          const o = doc.data();
          const rid = o.restaurantId;
          const name = restaurantsMap[rid] || 'Unknown';
          revByRest[name] = (revByRest[name] || 0) + (o.totalAmount || 0);
        });

        const revenueData = Object.keys(revByRest).map(name => ({
          name,
          value: revByRest[name]
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        setData(prev => ({
          ...prev,
          topRestaurants: revenueData
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const ChartSection = ({ title, data, type }) => (
    <div className="admin-card">
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>{title}</h3>
      <div className="analytics-chart-container">
        {data.map((item, idx) => {
          const maxValue = Math.max(...data.map(d => d.value || d.count || d.amount));
          const currentVal = item.value || item.count || item.amount;
          const percentage = (currentVal / maxValue) * 100;
          
          return (
            <div key={idx} className="chart-item" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>{item.name || item.day}</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {type === 'currency' ? `₹${currentVal.toLocaleString()}` : currentVal}
                </span>
              </div>
              <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${percentage}%`, 
                  background: 'var(--accent-primary)', 
                  borderRadius: '10px',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1>Analytics & Insights</h1>
        <p>Visualizing platform performance and growth</p>
      </header>

      {loading ? (
        <div className="admin-loading">Generating reports...</div>
      ) : (
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <ChartSection title="Revenue Per Day" data={data.revenueByDay} type="currency" />
          <ChartSection title="Daily Orders" data={data.dailyOrders} type="count" />
          <ChartSection title="Top Restaurants" data={data.topRestaurants} type="currency" />
          <ChartSection title="Most Ordered Food" data={data.mostOrderedFood} type="count" />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
