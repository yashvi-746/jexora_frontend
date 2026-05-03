import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import User from './pages/user';
import Rfq from './pages/Rfq';
import RfqDetails from './pages/RfqDetails';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderDetails from './pages/PurchaseOrderDetails';
import Tracker from './pages/Tracker';
import GpsTracker from './pages/GpsTracker';
import Notifications from './pages/Notifications';
import Warehouses from './pages/Warehouses';
import AuditLog from './pages/AuditLog';
import SuppliersPerformance from './pages/SuppliersPerformance';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import SalesOrders from './pages/SalesOrders';
import SalesOrderDetails from './pages/SalesOrderDetails';
import Finance from './pages/Finance';
import Transfers from './pages/Transfers';
import Automation from './pages/Automation';

// Guard: redirect to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem', color: '#8b5cf6' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={user ? <Navigate to="/products" replace /> : <Login />} />

      {/* Protected routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products"        element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/categories"      element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/suppliers"       element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
      <Route path="/inventory"       element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/user"            element={<ProtectedRoute><User /></ProtectedRoute>} />
      <Route path="/rfqs"            element={<ProtectedRoute><Rfq /></ProtectedRoute>} />
      <Route path="/rfqs/:id"        element={<ProtectedRoute><RfqDetails /></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
      <Route path="/purchase-orders/:id" element={<ProtectedRoute><PurchaseOrderDetails /></ProtectedRoute>} />
      <Route path="/tracker"         element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
      <Route path="/gps-tracker"     element={<ProtectedRoute><GpsTracker /></ProtectedRoute>} />
      <Route path="/notifications"   element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/warehouses"      element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
      <Route path="/audit-log"       element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      <Route path="/supplier-performance" element={<ProtectedRoute><SuppliersPerformance /></ProtectedRoute>} />
      <Route path="/customers"       element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/sales-orders"    element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
      <Route path="/sales-orders/:id" element={<ProtectedRoute><SalesOrderDetails /></ProtectedRoute>} />
      <Route path="/finance"         element={<ProtectedRoute><Finance /></ProtectedRoute>} />
      <Route path="/transfers"       element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
      <Route path="/automation"      element={<ProtectedRoute><Automation /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
