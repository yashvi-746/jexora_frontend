import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#fef2f2' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
          </div>
          <h1 className="page-headline">Notifications</h1>
          {unreadCount > 0 && (
             <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>
                {unreadCount} Unread
             </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="jex-btn btn-primary" onClick={handleMarkAllAsRead}>
            ✓ Mark All as Read
          </button>
        )}
      </div>

      <div className="creation-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--jex-text-muted)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--jex-text-muted)' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📭</span>
            You're all caught up! No notifications yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div 
                key={n._id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--jex-border-light)',
                  background: n.isRead ? 'transparent' : '#f0fdf4',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ fontSize: '24px' }}>
                    {n.message.includes('Low Stock') ? '⚠️' : n.message.includes('Approved') ? '✅' : '📩'}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: n.isRead ? '500' : '700', color: n.isRead ? 'var(--jex-text-main)' : '#064e3b' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--jex-text-light)', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <button 
                    className="jex-btn btn-ghost" 
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                    onClick={() => handleMarkAsRead(n._id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
