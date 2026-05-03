import api from "../api/api";
import { useEffect, useState } from "react";

const ROLE_COLORS = {
  Admin:    { bg: '#f0f9ff', color: '#0ea5e9' },
  Manager:  { bg: '#f5f3ff', color: '#8b5cf6' },
  Staff:    { bg: '#ecfdf5', color: '#10b981' },
  Supplier: { bg: '#fff7ed', color: '#f97316' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest" | "name"
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Manager' });

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user");
      setUsers(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/user/${editId}`, formData);
      } else {
        await api.post("/user/create", formData);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setEditId(user._id || user.id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role || 'Manager' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteAction = async (id) => {
    try {
      await api.post(`/user/delete/${id}`);
      setConfirmDeleteId(null);
      fetchUsers();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', email: '', password: '', role: 'Manager' });
  };

  // Filter + Sort
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'name')   return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  return (
    <div className="user-management-page">
      {/* Header */}
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>👤</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit User' : 'User Management'}</h1>
        </div>
        <div className="search-container">
          <input
            type="text" className="search-input" placeholder="Search by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="creation-card">
        <form className="creation-grid" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">Name</label>
            <input className="jex-input" placeholder="Full name" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Email address</label>
            <input type="email" className="jex-input" placeholder="Email address" required
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Password {isEditing && '(blank = no change)'}</label>
            <input type="password" className="jex-input" placeholder="Password" required={!isEditing}
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Role</label>
            <select className="jex-input jex-select"
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            {isEditing && (
              <button type="button" className="jex-btn btn-ghost" onClick={resetForm}>Cancel</button>
            )}
            <button type="submit" className="jex-btn btn-primary">
              {isEditing ? '✏️ Update User' : '+ Add User'}
            </button>
          </div>
        </form>
      </div>

      {/* Sort Controls + Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--jex-text-muted)', fontWeight: '600' }}>
            {sorted.length} user{sorted.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--jex-text-muted)', fontWeight: '600' }}>Sort:</span>
          {[
            { key: 'newest', label: '🕐 Newest First' },
            { key: 'oldest', label: '📅 Oldest First' },
            { key: 'name',   label: '🔤 Name A–Z' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortOrder(opt.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: '1px solid',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                borderColor: sortOrder === opt.key ? 'var(--jex-primary)' : 'rgba(0,0,0,0.08)',
                background: sortOrder === opt.key ? 'rgba(139,92,246,0.08)' : 'white',
                color: sortOrder === opt.key ? 'var(--jex-primary)' : 'var(--jex-text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="creation-card" style={{ textAlign: 'center' }}>Loading users...</div>
      ) : sorted.length === 0 ? (
        <div className="creation-card" style={{ textAlign: 'center', color: 'var(--jex-text-muted)' }}>
          No users found matching "{searchTerm}".
        </div>
      ) : (
        <div className="cards-grid">
          {sorted.map((u, idx) => {
            const uId = u._id || u.id;
            const isConfirming = confirmDeleteId === uId;
            const roleStyle = ROLE_COLORS[u.role] || { bg: '#f1f5f9', color: '#64748b' };

            return (
              <div key={uId || idx} className="entity-card" style={{ position: 'relative' }}>
                {/* Sequence Number */}
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '26px', height: '26px', borderRadius: '8px',
                  background: 'var(--jex-bg)', color: 'var(--jex-text-light)',
                  fontSize: '0.72rem', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  #{idx + 1}
                </div>

                {/* Card Top */}
                <div className="card-top" style={{ paddingRight: '32px' }}>
                  <div className="card-main-info">
                    <h3 className="card-title" style={{ fontSize: '1.1rem' }}>{u.name}</h3>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px',
                      borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: roleStyle.bg, color: roleStyle.color
                    }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'var(--jex-gradient)', color: 'white',
                    fontWeight: '800', fontSize: '1.1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Email */}
                <div className="info-item">
                  <div className="info-icon">📧</div>
                  <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                </div>

                {/* Date Created */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: '10px',
                  background: 'var(--jex-bg)', marginTop: '4px'
                }}>
                  <span style={{ fontSize: '0.75rem' }}>🕐</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--jex-text-main)' }}>
                      {formatDate(u.createdAt)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--jex-text-light)' }}>
                      {formatTime(u.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  {!isConfirming ? (
                    <>
                      <button type="button" className="action-link link-edit" onClick={() => handleEdit(u)}>✏️ Edit</button>
                      <button type="button" className="action-link link-delete" onClick={() => setConfirmDeleteId(uId)}>🗑️ Delete</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ef4444' }}>Delete?</span>
                      <button type="button" className="action-link link-delete" style={{ background: '#fff1f2' }} onClick={() => executeDeleteAction(uId)}>Yes</button>
                      <button type="button" className="action-link" onClick={() => setConfirmDeleteId(null)}>No</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
