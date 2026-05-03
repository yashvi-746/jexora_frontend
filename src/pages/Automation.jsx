import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Automation() {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState('');
  const [emails, setEmails] = useState('');

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await api.get('/automation/audit');
      setAuditData(res.data);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDailyReport = async () => {
    if (!emails) return alert('Please enter at least one email.');
    setReportStatus('Sending to ' + emails + '...');
    try {
      await api.post('/automation/trigger-report', { recipientList: emails });
      setReportStatus('✅ Reports sent successfully!');
    } catch (err) {
      setReportStatus('❌ Failed to send reports.');
    }
  };

  return (
    <div className="automation-page" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="top-section" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
          </div>
          <div style={{ marginLeft: '15px' }}>
            <h1 className="page-headline" style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>Automation Hub</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Intelligent Business Orchestration</p>
          </div>
        </div>
        <button 
          className="jex-btn btn-primary" 
          onClick={runAudit} 
          disabled={loading}
          style={{ padding: '12px 30px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          {loading ? '🧠 Analyzing Data...' : '🚀 Run System Audit'}
        </button>
      </div>

      {/* Primary Automations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Morning Coffee Card */}
        <div className="creation-card" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>☕</span>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Morning Coffee Report</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
            Broadcast yesterday's business performance to multiple stakeholders instantly via email.
          </p>
          <div className="input-wrapper" style={{ marginTop: '5px' }}>
            <input 
              className="jex-input" 
              placeholder="Enter emails (comma separated)" 
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <button className="jex-btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '10px' }} onClick={triggerDailyReport}>
            Send To All Recipients
          </button>
          {reportStatus && <div style={{ fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: reportStatus.includes('✅') ? '#f0fdf4' : '#fef2f2', color: reportStatus.includes('✅') ? '#166534' : '#991b1b', textAlign: 'center', fontWeight: '600' }}>{reportStatus}</div>}
        </div>

        {/* Invoicing Card */}
        <div className="creation-card" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ background: '#f0fdf4', color: '#10b981', padding: '15px', borderRadius: '50%', fontSize: '2rem' }}>🧾</div>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Auto-Invoicing System</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '280px' }}>
            Generating and emailing PDF Tax Invoices automatically on every shipment.
          </p>
          <div style={{ padding: '8px 20px', background: '#10b981', color: 'white', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
             Active & Watching
          </div>
        </div>

      </div>

      {/* Intelligence Results Grid */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#475569', fontWeight: '700' }}>System Audit Results</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Pricing Card */}
        <div className="table-card" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📈</span>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Pricing Intelligence</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {auditData?.pricing?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditData.pricing.map((item, idx) => (
                  <div key={idx} style={{ padding: '15px', borderRadius: '16px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '0.9rem' }}>{item.name}</div>
                    <p style={{ fontSize: '0.75rem', color: '#0c4a6e', margin: '5px 0' }}>{item.reason}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                       <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Current: ₹{item.currentPrice}</span>
                       <span style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '1.1rem' }}>₹{item.suggestedPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{auditData ? '✅ All prices are optimized.' : 'Click "Run System Audit" to begin analysis.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Balancing Card */}
        <div className="table-card" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '20px', background: '#fffcf5', borderBottom: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🏢</span>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Stock Balancing</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {auditData?.transfers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditData.transfers.map((item, idx) => (
                  <div key={idx} style={{ padding: '15px', borderRadius: '16px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <div style={{ fontWeight: 'bold', color: '#92400e', fontSize: '0.9rem' }}>{item.productName}</div>
                    <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '5px 0' }}>{item.reason}</p>
                    <div style={{ marginTop: '10px', background: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center', color: '#d97706' }}>
                      🚚 Move {item.quantity} units to {item.to}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{auditData ? '✅ Warehouses are perfectly balanced.' : 'Stock balancing standing by.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reorder Card */}
        <div className="table-card" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '20px', background: '#fdfaff', borderBottom: '1px solid #f5f3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🛒</span>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Reorder Queue</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {auditData?.reorders?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {auditData.reorders.map((msg, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '12px', background: '#f5f3ff', color: '#6d28d9', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #ddd6fe' }}>
                    📦 {msg}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{auditData ? '✅ Inventory levels are healthy.' : 'Inventory scan standing by.'}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
