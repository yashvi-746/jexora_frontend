import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPersonName: '',
    phone: '',
    email: '',
    address: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contactPersonName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || s.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
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
        await api.put(`/suppliers/${editId}`, formData);
      } else {
        await api.post('/suppliers/create', formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (supplier) => {
    setIsEditing(true);
    setEditId(supplier._id || supplier.id);
    setFormData({
      companyName: supplier.companyName,
      contactPersonName: supplier.contactPersonName || '',
      phone: supplier.phone || '',
      email: supplier.userId?.email || supplier.email || '',
      address: supplier.address || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteAction = async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ companyName: '', contactPersonName: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: 'var(--jex-accent-soft)' }}>
            <span style={{ fontSize: '24px' }}>🏢</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit Supplier' : 'Suppliers'}</h1>
        </div>
        <div className="search-container">
          <input 
            type="text" className="search-input" 
            placeholder="Search suppliers by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="creation-card">
        <form onSubmit={handleSubmit}>
          <div className="creation-grid mb-2">
            <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Company Name</label>
              <input 
                type="text" className="jex-input" placeholder="Company name" required 
                value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Contact Person</label>
              <input 
                type="text" className="jex-input" placeholder="Contact person" 
                value={formData.contactPersonName} onChange={(e) => setFormData({...formData, contactPersonName: e.target.value})}
              />
            </div>
          </div>
          <div className="creation-grid">
            <div className="input-wrapper">
              <label className="input-label">Phone</label>
              <input 
                type="text" className="jex-input" placeholder="Phone number" 
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Email</label>
              <input 
                type="email" className="jex-input" placeholder="Email address" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Address</label>
              <input 
                type="text" className="jex-input" placeholder="Physical address"
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {isEditing && (
                <button type="button" className="jex-btn btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button type="submit" className="jex-btn btn-primary" style={{ background: 'var(--jex-accent)', borderColor: 'var(--jex-accent)' }}>
                <span>{isEditing ? '✏️' : '+'}</span> {isEditing ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="creation-card">Loading suppliers...</div>
      ) : (
        <div className="cards-grid">
          {filteredSuppliers.map((supplier) => {
            const sId = supplier._id || supplier.id;
            const isConfirming = confirmDeleteId === sId;

            return (
              <div key={sId} className="entity-card">
                <div className="card-top">
                  <div className="card-main-info">
                    <h3 className="card-title">{supplier.companyName}</h3>
                    <div className="info-item">
                      <span className="status-badge" style={{ background: 'var(--jex-accent-soft)', color: 'var(--jex-accent)' }}>
                        {supplier.contactPersonName || 'No contact person'}
                      </span>
                    </div>
                  </div>
                  <div className="card-initial-box" style={{ background: 'var(--jex-accent-soft)', color: 'var(--jex-accent)' }}>
                    {supplier.companyName.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="card-main-info" style={{ gap: '4px' }}>
                  <p className="info-item">📞 {supplier.phone || 'N/A'}</p>
                  <p className="info-item">📧 {supplier.userId?.email || supplier.email || 'N/A'}</p>
                  <p className="info-item">📍 {supplier.address || 'No address'}</p>
                </div>

                <div className="card-actions">
                  {!isConfirming ? (
                    <>
                      <button type="button" className="action-link link-edit" onClick={() => handleEdit(supplier)}>✏️ Edit</button>
                      <button type="button" className="action-link link-delete" onClick={() => setConfirmDeleteId(sId)}>🗑️ Delete</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ef4444' }}>Confirm?</span>
                      <button type="button" className="action-link link-delete" style={{ background: '#fff1f2' }} onClick={() => executeDeleteAction(sId)}>Yes</button>
                      <button type="button" className="action-link" onClick={() => setConfirmDeleteId(null)}>No</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {suppliers.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--jex-text-light)' }}>No suppliers found.</p>}
        </div>
      )}
    </div>
  );
}
