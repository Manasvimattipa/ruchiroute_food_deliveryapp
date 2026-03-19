import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './AdminPortal.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRemoveUser = async (uid) => {
    if (window.confirm("Are you sure you want to remove this user? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        setUsers(users.filter(u => u.id !== uid));
      } catch (err) {
        console.error("Error removing user:", err);
        alert("Failed to remove user. Please try again.");
      }
    }
  };

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1>User Management</h1>
        <p>View and manage platform users</p>
      </header>

      {loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.displayName || 'N/A'}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.city || 'Not specified'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="delete-action" onClick={() => handleRemoveUser(u.id)}>Remove</button>
                    </div>
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

export default AdminUsers;
