import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import api from '../api/api';

export default function Finance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    try {
      const res = await api.get('/finance/summary');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinanceData(); }, []);

  if (loading) return <div className="creation-card">Analyzing financial data...</div>;
  if (!data) return <div className="creation-card">No financial data available.</div>;

  const { summary, monthlyStats } = data;

  return (
    <div className="products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <span style={{ fontSize: '24px' }}>💰</span>
          </div>
          <h1 className="page-headline">Financial Analytics</h1>
        </div>
        <button className="jex-btn btn-primary" onClick={() => window.print()}>
          🖨️ Export PDF
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="dashboard-grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>📈</div>
          <div className="kpi-details">
            <span className="kpi-title">Total Revenue</span>
            <span className="kpi-value">₹{summary.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>✅</div>
          <div className="kpi-details">
            <span className="kpi-title">Gross Profit</span>
            <span className="kpi-value">₹{summary.grossProfit.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📊</div>
          <div className="kpi-details">
            <span className="kpi-title">Profit Margin</span>
            <span className="kpi-value">{summary.profitMargin}%</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>💸</div>
          <div className="kpi-details">
            <span className="kpi-title">Cost of Goods (COGS)</span>
            <span className="kpi-value">₹{summary.totalCogs.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid" style={{ marginTop: '20px' }}>
        {/* Revenue vs Profit Chart */}
        <div className="creation-card" style={{ gridColumn: 'span 2', minHeight: '400px' }}>
          <h3 className="chart-title">Revenue & Profit Trends (Last 6 Months)</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyStats}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Procurement Summary */}
        <div className="creation-card">
          <h3 className="chart-title">Procurement Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--jex-bg-alt)', borderRadius: '12px' }}>
              <span>Total Procurement Investment</span>
              <span style={{ fontWeight: 'bold' }}>₹{summary.totalProcurement.toLocaleString()}</span>
            </div>
            <div style={{ padding: '15px', borderRadius: '12px', border: '1px dashed var(--jex-border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--jex-text-light)' }}>
                Your procurement investment reflects all confirmed Purchase Orders. 
                Keep an eye on this vs your Revenue to maintain positive cash flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
