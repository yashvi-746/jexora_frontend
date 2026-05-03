import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/customers/${currentId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (customer) => {
    setIsEditing(true);
    setCurrentId(customer._id);
    setFormData({
      name: customer.name,
      companyName: customer.companyName || '',
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      taxId: customer.taxId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', companyName: '', email: '', phone: '', address: '', city: '', taxId: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  return (
    <div className="products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: 'var(--jex-primary-soft)' }}>
            <span style={{ fontSize: '24px' }}>👥</span>
          </div>
          <h1 className="page-headline">Customer Management</h1>
          <div className="search-container" style={{ marginLeft: '20px', flex: 1 }}>
            <input 
              type="text" className="search-input" 
              placeholder="Search customers by name, company, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="jex-btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          Add Customer +
        </button>
      </div>

      {loading ? (
        <div className="creation-card">Loading customers...</div>
      ) : (
        <div className="cards-grid">
          {filteredCustomers.map(customer => (
            <div key={customer._id} className="entity-card">
              <div className="card-top">
                <div className="card-main-info">
                  <h3 className="card-title">{customer.name}</h3>
                  <p className="card-subtitle">{customer.companyName || 'Individual'}</p>
                </div>
                <div className="card-badge" style={{ background: 'var(--jex-primary-soft)', color: 'var(--jex-primary)' }}>
                  {customer.city || 'Client'}
                </div>
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-icon">📧</span>
                  <span className="detail-text">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="detail-row">
                    <span className="detail-icon">📞</span>
                    <span className="detail-text">{customer.phone}</span>
                  </div>
                )}
                {customer.taxId && (
                  <div className="detail-row">
                    <span className="detail-icon">🆔</span>
                    <span className="detail-text">Tax: {customer.taxId}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button className="action-link link-edit" onClick={() => handleEdit(customer)}>Edit</button>
                <button className="action-link link-delete" onClick={() => handleDelete(customer._id)}>Delete</button>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: 'var(--jex-text-muted)' }}>
              No customers found. Click "Add Customer" to start your client database.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
            <form onSubmit={handleSubmit} className="creation-grid">
              <div className="input-wrapper">
                <label className="input-label">Full Name *</label>
                <input type="text" className="jex-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Company Name</label>
                <input type="text" className="jex-input" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Email *</label>
                <input type="email" className="jex-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Phone</label>
                <input type="text" className="jex-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Address</label>
                <input type="text" className="jex-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">City</label>
                <input type="text" className="jex-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Tax ID (GSTIN/VAT)</label>
                <input type="text" className="jex-input" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
              </div>
              <div className="input-wrapper" style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="jex-btn btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update' : 'Create'}</button>
                <button type="button" className="jex-btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
