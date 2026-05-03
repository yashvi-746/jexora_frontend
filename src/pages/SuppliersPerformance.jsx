import { useState, useEffect } from 'react';
import api from '../api/api';

export default function SuppliersPerformance() {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/suppliers/performance');
        setPerformance(res.data);
      } catch (err) {
        console.error('Error fetching supplier performance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <span style={{ fontSize: '24px' }}>🚛</span>
          </div>
          <h1 className="page-headline">Supplier Performance Analytics</h1>
        </div>
      </div>

      <div className="cards-grid">
        {performance.map((s) => (
          <div key={s._id} className="entity-card" style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', top: '20px', right: '20px', 
              fontSize: '28px', fontWeight: '900', 
              color: s.score.includes('A') ? '#10b981' : s.score === 'B' ? '#f59e0b' : '#ef4444'
            }}>
              {s.score}
            </div>
            
            <div className="card-top">
              <div className="card-main-info">
                <h3 className="card-title">{s.companyName}</h3>
                <div className="info-item">
                  <span className="status-badge">Supplier Rating</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="stat-card-sm" style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Avg. Lead Time</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{s.avgLeadTime}</div>
              </div>
              <div className="stat-card-sm" style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>On-Time Rate</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{s.onTimeRate}</div>
              </div>
              <div className="stat-card-sm" style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Total Orders Handled</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{s.totalOrders}</div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: s.onTimeRate, 
                background: s.score.includes('A') ? '#10b981' : s.score === 'B' ? '#f59e0b' : '#ef4444' 
              }}></div>
            </div>
          </div>
        ))}
        {loading && <div className="creation-card">Analyzing supplier data...</div>}
        {performance.length === 0 && !loading && <p>No performance data available yet.</p>}
      </div>
    </div>
  );
}
