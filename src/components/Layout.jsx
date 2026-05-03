import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard',       icon: '📊', label: 'Dashboard' },
    { to: '/finance',         icon: '💰', label: 'Finance' },
    { to: '/notifications',   icon: '🔔', label: 'Notifications' },
    { to: '/audit-log',       icon: '🕵️‍♂️', label: 'Audit Log' },
    { to: '/user',            icon: '👥', label: 'Users' },
    { to: '/categories',      icon: '📂', label: 'Categories' },
    { to: '/products',        icon: '📦', label: 'Products' },
    { to: '/suppliers',       icon: '🏢', label: 'Suppliers' },
    { to: '/supplier-performance', icon: '📈', label: 'Performance' },
    { to: '/warehouses',      icon: '🏗️', label: 'Warehouses' },
    { to: '/inventory',       icon: '📊', label: 'Inventory' },
    { to: '/transfers',       icon: '🚛', label: 'Transfers' },
    { to: '/rfqs',            icon: '📝', label: 'RFQs' },
    { to: '/purchase-orders', icon: '🛒', label: 'Purchase Orders' },
    { to: '/customers',       icon: '👥', label: 'Customers' },
    { to: '/sales-orders',    icon: '💰', label: 'Sales Orders' },
    { to: '/automation',      icon: '🤖', label: 'Automation Hub' },
    { to: '/tracker',         icon: '📦', label: 'Stock Tracker' },
    { to: '/gps-tracker',     icon: '📍', label: 'GPS Tracker' },
  ];

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span></span><span></span><span></span>
        </button>
        <span className="mobile-logo-text">Jexora</span>
        <button className="logout-btn-mobile" onClick={handleLogout} title="Logout">⏻</button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-inner">
            <span className="logo-icon">J</span>
          </div>
          <span className="logo-text">Jexora</span>
        </div>

        <nav className="nav-group">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {(user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-role">{user.role || 'User'}</span>
                <span className="sidebar-user-email">{user.email}</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            ⏻ Logout
          </button>
        </div>
      </aside>

      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {children}
      </main>
    </div>
  );
}
