import React from 'react';
import AdminSidebar from './AdminSidebar';
import '../pages/AdminDashboard.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
