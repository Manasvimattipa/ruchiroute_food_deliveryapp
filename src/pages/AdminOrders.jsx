import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import './AdminPortal.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('orderTime', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    try {
      await updateDoc(doc(db, 'orders', orderId), { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
      fetchOrders();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return '#7f8c8d';
      case 'Preparing Food': return '#f1c40f';
      case 'Out for Delivery': return '#3498db';
      case 'Delivered': return '#2ecc71';
      default: return '#7f8c8d';
    }
  };

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1>Orders Management</h1>
        <p>Monitor and update platform orders</p>
      </header>

      {loading ? (
        <div className="admin-loading">Fetching order history...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Restaurant</th>
                <th>Items</th>
                <th>Total</th>
                <th>Method</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>#{o.id.slice(-6).toUpperCase()}</strong></td>
                  <td>{o.userName || 'N/A'}</td>
                  <td>{o.restaurantName || 'N/A'}</td>
                  <td>{o.items?.length || 0} items</td>
                  <td>₹{o.totalAmount?.toFixed(2)}</td>
                  <td>{o.paymentMethod || 'COD'}</td>
                  <td>
                    <span className="status-badge" style={{ background: getStatusColor(o.orderStatus), color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={o.orderStatus} 
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="status-select"
                      style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Preparing Food">Preparing Food</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
