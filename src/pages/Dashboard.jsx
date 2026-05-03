import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import api from '../api/api';
import './Dashboard.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAutoGeneratePOs = async () => {
    if (!window.confirm("AI will analyze your sales velocity and generate draft Purchase Orders for items running low. Proceed?")) return;
    try {
      const res = await api.post('/purchase-orders/auto-generate');
      alert(res.data.message);
    } catch (err) {
      alert('Error auto-generating POs: ' + err.message);
    }
  };

  const handleExportReport = () => {
    // ALTERNATIVE: Printable Report
    // Since file downloads are being blocked/renamed by local security software, 
    // we use the system print dialog which is 100% reliable.
    const printWindow = window.open('', '_blank');
    const reportDate = new Date().toLocaleString();
    
    const html = `
      <html>
        <head>
          <title>InventIQ Inventory Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .meta { color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: #f8fafc; color: #475569; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
            .card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }
            .label { color: #64748b; font-size: 14px; }
            .value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .alert { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>InventIQ Executive Inventory Report</h1>
          <div class="meta">Generated on: ${reportDate}</div>
          
          <div class="summary">
            <div class="card">
              <div class="label">Total Inventory Value</div>
              <div class="value">$${(stats.totalInventoryValue || 0).toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="label">Pending POs</div>
              <div class="value">${stats.poStats?.pending || 0}</div>
            </div>
          </div>

          <h2>⚠️ Critical Stock Alerts</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${(stats.lowStockItems || []).map(item => `
                <tr>
                  <td>${item.productId?.name || 'N/A'}</td>
                  <td>${item.productId?.categoryId?.name || 'N/A'}</td>
                  <td class="alert">${item.quantity}</td>
                  <td>${item.minStocks || 10}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = () => {
              window.print();
              // Optional: window.close();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem', color: 'var(--jex-primary)' }}>
        Loading Dashboard...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="dashboard-page products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
          </div>
          <h1 className="page-headline">Overview Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="jex-btn btn-ghost" onClick={handleExportReport} style={{ background: 'white' }}>
            🖨️ Print Report
          </button>
          <button className="jex-btn btn-primary" onClick={handleAutoGeneratePOs}>
            🧠 AI Auto-Procure
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>💰</div>
          <div className="kpi-details">
            <span className="kpi-title">Total Revenue</span>
            <span className="kpi-value">${(stats.totalSalesValue || 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📦</div>
          <div className="kpi-details">
            <span className="kpi-title">Sales Orders</span>
            <span className="kpi-value">{stats.counts?.sales || 0}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>💵</div>
          <div className="kpi-details">
            <span className="kpi-title">Inventory Value</span>
            <span className="kpi-value">${stats.totalInventoryValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>⚠️</div>
          <div className="kpi-details">
            <span className="kpi-title">Stock Alerts</span>
            <span className="kpi-value">{stats.lowStockItems.length + stats.outOfStock.length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        {/* Weekly Movements Bar Chart */}
        <div className="creation-card chart-container">
          <h3 className="chart-title">Stock Movements (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyMovements}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="in" name="Stock IN" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" name="Stock OUT" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Value by Category Pie Chart */}
        <div className="creation-card chart-container">
          <h3 className="chart-title">Inventory Value by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryValue}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {stats.categoryValue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `$${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
         {/* Demand Forecasting (AI-Forecast) */}
         <div className="creation-card forecasting-container">
          <h3 className="chart-title" style={{ color: 'var(--jex-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧠</span> Stock-Out Predictions (AI Forecast)
          </h3>
          <div className="alerts-list">
            {!stats.forecasting || stats.forecasting.length === 0 ? (
               <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Need more movement data to generate forecasts.</div>
            ) : (
              stats.forecasting.map((item, idx) => (
                <div key={idx} className="alert-item" style={{ borderLeft: `4px solid ${item.status === 'CRITICAL' ? '#ef4444' : '#f59e0b'}` }}>
                  <div className="alert-info">
                    <span className="alert-name">{item.name}</span>
                    <span className="alert-qty">Out in: <strong>{item.daysRemaining} days</strong> (Order: {item.suggestedOrder} units)</span>
                  </div>
                  <span className="alert-badge" style={{ 
                    background: item.status === 'CRITICAL' ? '#ef4444' : '#f59e0b', 
                    color: 'white' 
                  }}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--jex-text-light)', marginTop: '10px', fontStyle: 'italic' }}>
            * Forecast based on sales velocity (last 30 days)
          </p>
        </div>

         {/* Low Stock Alerts */}
         <div className="creation-card alerts-container">
          <h3 className="chart-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚨</span> Attention Needed (Low/Out of Stock)
          </h3>
          <div className="alerts-list">
            {[...stats.outOfStock, ...stats.lowStockItems].length === 0 ? (
               <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>All stock levels are optimal!</div>
            ) : (
              [...stats.outOfStock, ...stats.lowStockItems].map((item, idx) => (
                <div key={idx} className="alert-item" style={{ background: item.quantity === 0 ? '#fef2f2' : '#fffbeb', borderLeft: `4px solid ${item.quantity === 0 ? '#ef4444' : '#f59e0b'}` }}>
                  <div className="alert-info">
                    <span className="alert-name">{item.productId?.name || 'Unknown Product'}</span>
                    <span className="alert-qty">Current Qty: <strong>{item.quantity}</strong> (Min: {item.minStocks || 0})</span>
                  </div>
                  <span className="alert-badge" style={{ background: item.quantity === 0 ? '#ef4444' : '#f59e0b', color: 'white' }}>
                    {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid" style={{ marginTop: '2rem' }}>
        {/* Recent POs */}
        <div className="creation-card pos-container">
          <h3 className="chart-title">Recent Purchase Orders</h3>
          <div className="alerts-list">
            {stats.recentPOs.length === 0 ? (
               <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent purchase orders.</div>
            ) : (
              stats.recentPOs.map((po, idx) => (
                <div key={idx} className="alert-item" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <div className="alert-info">
                    <span className="alert-name">{po.purchaseNumber || 'PO-'+po._id.slice(-4)}</span>
                    <span className="alert-qty">Supplier: {po.supplierId?.name || 'Unknown'}</span>
                  </div>
                  <span className="alert-badge" style={{ 
                    background: '#ecfdf5',
                    color: '#10b981',
                    fontSize: '0.65rem'
                   }}>
                    {po.status?.toUpperCase() || 'DRAFT'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="creation-card pos-container">
          <h3 className="chart-title" style={{ color: 'var(--jex-primary)' }}>Recent Sales Orders</h3>
          <div className="alerts-list">
            {(stats.recentSales || []).length === 0 ? (
               <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent sales history.</div>
            ) : (
              stats.recentSales.map((so, idx) => (
                <div key={idx} className="alert-item" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <div className="alert-info">
                    <span className="alert-name">{so.orderNumber}</span>
                    <span className="alert-qty">Amount: <strong>₹{so.totalAmount?.toLocaleString()}</strong></span>
                  </div>
                  <span className="alert-badge" style={{ 
                    background: '#eff6ff',
                    color: '#3b82f6',
                    fontSize: '0.65rem'
                   }}>
                    {so.status?.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
