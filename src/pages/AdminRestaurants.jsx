import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './AdminDashboard.css'; // Reusing layout styles

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    category: 'Veg', // Default to Veg
    deliveryTime: '30-45 min',
    image: '',
    latitude: 0,
    longitude: 0,
    rating: 4.5
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'restaurants'));
      setRestaurants(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleOpenModal = (restaurant = null) => {
    if (restaurant) {
      setCurrentRestaurant(restaurant);
      setFormData({ ...restaurant });
    } else {
      setCurrentRestaurant(null);
      setFormData({
        name: '',
        city: '',
        category: 'Veg',
        deliveryTime: '30-45 min',
        image: '',
        latitude: 0,
        longitude: 0,
        rating: 4.5
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRestaurant) {
        await updateDoc(doc(db, 'restaurants', currentRestaurant.id), formData);
      } else {
        await addDoc(collection(db, 'restaurants'), formData);
      }
      setModalOpen(false);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      alert("Error saving restaurant");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await deleteDoc(doc(db, 'restaurants', id));
        fetchRestaurants();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout>
      <header className="admin-header admin-flex-header">
        <div>
          <h1>Restaurant Management</h1>
          <p>Manage all registered restaurants</p>
        </div>
        <button className="add-btn-main" onClick={() => handleOpenModal()}>+ Add Restaurant</button>
      </header>

      {loading ? (
        <div className="admin-loading">Loading restaurants...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="table-item-info">
                      <strong>{r.name}</strong>
                    </div>
                  </td>
                  <td>{r.city}</td>
                  <td>{r.category}</td>
                  <td>★ {r.rating}</td>
                  <td>
                    <div className="table-actions">
                      <button className="edit-action" onClick={() => handleOpenModal(r)}>Edit</button>
                      <button className="delete-action" onClick={() => handleDelete(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{currentRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Restaurant Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#fdfaf7' }}>
                    <option value="Veg">Veg</option>
                    <option value="Non Veg">Non Veg</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Delivery Time</label>
                  <input type="text" value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Restaurant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRestaurants;
