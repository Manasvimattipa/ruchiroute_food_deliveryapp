import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: '📊' },
    { name: 'Restaurants', path: '/admin/restaurants', icon: '🏪' },
    { name: 'Menu Items', path: '/admin/menu', icon: '🍕' },
    { name: 'Orders', path: '/admin/orders', icon: '📦' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo" onClick={() => navigate('/admin-dashboard')}>
        RuchiRoute <span>Admin</span>
      </div>
      
      <nav className="admin-nav">
        {menuItems.map((item) => (
          <div 
            key={item.path}
            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span className="admin-nav-label">{item.name}</span>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <span className="admin-nav-icon">🚪</span>
          <span className="admin-nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
