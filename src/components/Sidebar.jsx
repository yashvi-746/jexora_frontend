import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-inner">
          <span className="logo-icon">J</span>
        </div>
        <span className="logo-text">Jexora</span>
      </div>
      
      <nav className="nav-group">
        {/* Main Dashboard */}
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        
        {/* Automation Features */}
        <NavLink to="/notifications" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🔔</span> Notifications
        </NavLink>
        <NavLink to="/audit-log" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🕵️‍♂️</span> Audit Log
        </NavLink>

        {/* Administration */}
        <NavLink to="/user" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">👥</span> Users
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📂</span> Categories
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📦</span> Products
        </NavLink>

        {/* Supply Chain */}
        <NavLink to="/suppliers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🏢</span> Suppliers
        </NavLink>
        <NavLink to="/supplier-performance" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📈</span> Performance
        </NavLink>
        <NavLink to="/warehouses" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🏗️</span> Warehouses
        </NavLink>
        <NavLink to="/rfqs" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📝</span> RFQs
        </NavLink>
        <NavLink to="/purchase-orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">🛒</span> Purchase Orders
        </NavLink>

        {/* Sales & CRM - NEW */}
        <NavLink to="/customers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">👥</span> Customers
        </NavLink>
        <NavLink to="/sales-orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">💰</span> Sales Orders
        </NavLink>

        {/* Logistics & Tracking */}
        <NavLink to="/inventory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📊</span> Inventory
        </NavLink>
        <NavLink to="/tracker" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📦</span> Stock Tracker
        </NavLink>
        <NavLink to="/gps-tracker" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon">📍</span> GPS Tracker
        </NavLink>
      </nav>
    </aside>
  );
}
