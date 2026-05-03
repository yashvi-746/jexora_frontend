import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    contactNumber: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/warehouses/${editId}`, formData);
      } else {
        await api.post('/warehouses/create', formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (w) => {
    setIsEditing(true);
    setEditId(w._id);
    setFormData({
      name: w.name,
      location: w.location,
      manager: w.manager || '',
      contactNumber: w.contactNumber || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', location: '', manager: '', contactNumber: '' });
  };

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <span style={{ fontSize: '24px' }}>🏢</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit Warehouse' : 'Warehouses'}</h1>
        </div>
      </div>

      <div className="creation-card">
        <form onSubmit={handleSubmit}>
          <div className="creation-grid mb-2">
            <div className="input-wrapper">
              <label className="input-label">Warehouse Name</label>
              <input 
                type="text" className="jex-input" required placeholder="Main Warehouse"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Location / Address</label>
              <input 
                type="text" className="jex-input" required placeholder="Mumbai, MH"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
          <div className="creation-grid">
            <div className="input-wrapper">
              <label className="input-label">Manager Name</label>
              <input 
                type="text" className="jex-input" placeholder="John Doe"
                value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Contact Number</label>
              <input 
                type="text" className="jex-input" placeholder="+91 9876543210"
                value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isEditing && (
                <button type="button" className="jex-btn btn-ghost" onClick={resetForm}>Cancel</button>
              )}
              <button type="submit" className="jex-btn btn-primary">
                {isEditing ? 'Update Warehouse' : 'Add Warehouse'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="creation-card">Loading warehouses...</div>
      ) : (
        <div className="cards-grid">
          {warehouses.map((w) => (
            <div key={w._id} className="entity-card">
              <div className="card-top">
                <div className="card-main-info">
                  <h3 className="card-title">{w.name}</h3>
                  <div className="info-item">
                    <span className="status-badge" style={{ background: '#fef3c7', color: '#d97706' }}>{w.location}</span>
                  </div>
                </div>
                <div className="card-initial-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                  {w.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="card-main-info">
                <p style={{ fontSize: '0.85rem' }}><strong>Manager:</strong> {w.manager || 'N/A'}</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Contact:</strong> {w.contactNumber || 'N/A'}</p>
              </div>

              <div className="card-actions">
                <button type="button" className="action-link link-edit" onClick={() => handleEdit(w)}>✏️ Edit</button>
                <button type="button" className="action-link link-delete" onClick={() => handleDelete(w._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
          {warehouses.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No warehouses found.</p>}
        </div>
      )}
    </div>
  );
}
