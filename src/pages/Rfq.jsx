import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Rfq() {
  const [rfqs, setRfqs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({ title: '', notes: '', suppliers: [], status: 'draft' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredRfqs = rfqs.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.rfqNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rfqRes, supRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/suppliers')
      ]);
      setRfqs(rfqRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
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
        await api.put(`/rfqs/${editId}`, formData);
      } else {
        await api.post('/rfqs/create', formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (rfq, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditId(rfq._id);
    setFormData({ 
        title: rfq.title, 
        notes: rfq.notes || '', 
        suppliers: rfq.suppliers ? rfq.suppliers.map(s => s._id || s) : [],
        status: rfq.status || 'draft'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteAction = async (id) => {
    try {
      await api.delete(`/rfqs/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: '', notes: '', suppliers: [], status: 'draft' });
  };

  const handleSupplierChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, suppliers: value });
  };

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>📝</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit RFQ' : 'Request for Quotation'}</h1>
        </div>
        <div className="search-container">
          <input 
            type="text" className="search-input" 
            placeholder="Search RFQs by title or number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="creation-card">
        <form className="creation-grid" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">RFQ Title</label>
            <input 
              className="jex-input" placeholder="e.g. Q3 Restock" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="input-wrapper">
             <label className="input-label">Status</label>
             <select className="jex-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
             </select>
          </div>
          <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Notes</label>
            <input 
              className="jex-input" placeholder="Optional notes..."
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
             <label className="input-label">Suppliers (Hold Ctrl/Cmd to select multiple)</label>
             <select multiple className="jex-input" style={{ height: '80px' }} value={formData.suppliers} onChange={handleSupplierChange}>
                {Array.isArray(suppliers) && suppliers.map(sup => {
                    const supplierValue = sup.userId?._id || sup.userId || sup._id;
                    return (
                        <option key={sup._id} value={supplierValue}>
                            {sup.companyName || sup.name || sup.Name}
                        </option>
                    );
                })}
             </select>
          </div>
          
          <div className="input-wrapper" style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem' }}>
            {isEditing && (
              <button type="button" className="jex-btn btn-ghost" onClick={resetForm} style={{ flex: 1 }}>
                Cancel
              </button>
            )}
            <button type="submit" className="jex-btn btn-primary" style={{ flex: 2 }}>
              {isEditing ? 'Update RFQ' : 'Create RFQ'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="creation-card">Loading RFQs...</div>
      ) : (
        <div className="cards-grid">
          {Array.isArray(filteredRfqs) ? filteredRfqs.map((rfq) => {
            const isConfirming = confirmDeleteId === rfq._id;
            return (
              <div key={rfq._id} className="entity-card" onClick={() => navigate(`/rfqs/${rfq._id}`)} style={{ cursor: 'pointer' }}>
                <div className="card-top">
                  <div className="card-main-info">
                    <h3 className="card-title">{rfq.title}</h3>
                    <span className="status-badge">{rfq.rfqNumber} • {rfq.status ? rfq.status.toUpperCase() : 'DRAFT'}</span>
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--jex-text-light)' }}>
                    Suppliers: {rfq.suppliers && rfq.suppliers.length > 0 ? rfq.suppliers.map(s => s.companyName || s.name || s.Name || s).join(', ') : 'None'}
                </div>
                
                <div className="card-actions" style={{ marginTop: '15px' }}>
                  {!isConfirming ? (
                    <>
                      <button type="button" className="action-link link-edit" onClick={(e) => handleEdit(rfq, e)}>✏️ Edit</button>
                      <button type="button" className="action-link link-delete" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(rfq._id); }}>🗑️ Del</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ef4444' }}>DEL?</span>
                      <button type="button" className="action-link link-delete" style={{ background: '#fff1f2' }} onClick={(e) => { e.stopPropagation(); executeDeleteAction(rfq._id); }}>YES</button>
                      <button type="button" className="action-link" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}>NO</button>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : null}
          {Array.isArray(rfqs) && rfqs.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--jex-text-light)' }}>No RFQs found.</p>}
        </div>
      )}
    </div>
  );
}
