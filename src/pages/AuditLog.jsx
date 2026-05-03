import { useState, useEffect } from 'react';
import api from '../api/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/auditlogs');
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <span style={{ fontSize: '24px' }}>🕵️‍♂️</span>
          </div>
          <h1 className="page-headline">Forensic Audit Trail</h1>
        </div>
      </div>

      <div className="creation-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading audit trail...</div>
        ) : (
          <table className="jex-table">
            <thead>
              <tr>
                <th>User / Entity</th>
                <th>Action</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="sidebar-user-avatar" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                        {log.entityId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{log.entityId?.name || 'System'}</div>
                        <div style={{ fontSize: '10px', color: 'var(--jex-text-light)' }}>{log.entityId?.role || 'Admin'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ 
                      background: log.action.includes('DELETE') ? '#fee2e2' : log.action.includes('CREATE') ? '#dcfce7' : '#fef3c7',
                      color: log.action.includes('DELETE') ? '#ef4444' : log.action.includes('CREATE') ? '#10b981' : '#d97706'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '14px' }}>{log.details}</td>
                  <td style={{ fontSize: '13px', color: 'var(--jex-text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
