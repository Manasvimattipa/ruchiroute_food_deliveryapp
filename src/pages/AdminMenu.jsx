import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import './AdminPortal.css';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    restaurantId: ''
  });

  const fetchRestaurants = async () => {
    const snap = await getDocs(collection(db, 'restaurants'));
    const restData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRestaurants(restData);
    if (restData.length > 0) setSelectedRestaurant(restData[0].id);
  };

  const fetchMenuItems = async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'menu'), where('restaurantId', '==', selectedRestaurant));
      const snap = await getDocs(q);
      setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) fetchMenuItems();
  }, [selectedRestaurant]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({ ...item });
    } else {
      setCurrentItem(null);
      setFormData({
        itemName: '',
        price: 0,
        category: '',
        description: '',
        image: '',
        restaurantId: selectedRestaurant
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await updateDoc(doc(db, 'menu', currentItem.id), formData);
      } else {
        await addDoc(collection(db, 'menu'), formData);
      }
      setModalOpen(false);
      fetchMenuItems();
    } catch (err) {
      console.error(err);
      alert("Error saving menu item");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      try {
        await deleteDoc(doc(db, 'menu', id));
        fetchMenuItems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout>
      <header className="admin-header admin-flex-header">
        <div>
          <h1>Menu Management</h1>
          <div className="restaurant-selector">
            <label>Select Restaurant: </label>
            <select value={selectedRestaurant} onChange={e => setSelectedRestaurant(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginLeft: '10px' }}>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <button className="add-btn-main" onClick={() => handleOpenModal()}>+ Add Item</button>
      </header>

      {loading ? (
        <div className="admin-loading">Loading menu...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.itemName || item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <div className="table-actions">
                      <button className="edit-action" onClick={() => handleOpenModal(item)}>Edit</button>
                      <button className="delete-action" onClick={() => handleDelete(item.id)}>Delete</button>
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
            <h2>{currentItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Food Name</label>
                  <input type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required placeholder="e.g. Starters, Main Course" />
                </div>
                <div className="form-group">
                  <label>Food Image</label>
                  <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="Image URL" />
                </div>
                <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                  <label>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '12px' }}></textarea>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMenu;
