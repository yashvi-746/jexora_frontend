import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({ rfqId: '', supplierId: '', notes: '', status: 'draft', items: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredPOs = pos.filter(po => 
    po.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (po.supplierId?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, rfqRes, supRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/rfqs'),
        api.get('/suppliers')
      ]);
      setPos(poRes.data);
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

  // When an RFQ is selected, try to auto-fetch its items to populate the PO items
  const handleRfqSelect = async (e) => {
    const rfqId = e.target.value;
    setFormData(prev => ({ ...prev, rfqId }));
    
    if (rfqId && !isEditing) {
      try {
        const itemsRes = await api.get(`/rfqs/${rfqId}/items`);
        const items = itemsRes.data.map(item => ({
          productId: item.productId?._id || item.productId,
          quantity: item.quantity,
          Price: item.unitPrice || 0,
          total: (item.quantity * (item.unitPrice || 0))
        }));
        setFormData(prev => ({ ...prev, items }));
      } catch (err) {
        console.error('Failed to load RFQ items', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await api.put(`/purchase-orders/${editId}`, formData);
        setSuccessMsg(`✅ ${res.data.message}`);
        if (res.data.emailPreviewUrl) setPreviewUrl(res.data.emailPreviewUrl);
      } else {
        await api.post('/purchase-orders/create', formData);
        setSuccessMsg(`✅ Purchase order created successfully.`);
      }
      setTimeout(() => { setSuccessMsg(''); setPreviewUrl(''); }, 8000);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (po, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditId(po._id);
    setFormData({ 
        rfqId: po.rfqId?._id || '', 
        supplierId: po.supplierId?._id || '', 
        notes: po.notes || '', 
        status: po.status || 'draft',
        items: po.items || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteAction = async (id) => {
    try {
      await api.delete(`/purchase-orders/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ rfqId: '', supplierId: '', notes: '', status: 'draft', items: [] });
  };

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>🛒</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit Purchase Order' : 'Purchase Orders'}</h1>
        <div className="search-container">
          <input 
            type="text" className="search-input" 
            placeholder="Search POs by number or supplier..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>

      {successMsg && (
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontWeight: '600', fontSize: '0.9rem', border: '1px solid #a7f3d0' }}>
            {successMsg}
            {previewUrl && (
              <div style={{ marginTop: '8px' }}>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'underline' }}>
                  📧 Click here to view the automated email sent to the Supplier!
                </a>
              </div>
            )}
          </div>
      )}

      <div className="creation-card">
        <form className="creation-grid" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">Select RFQ (Required)</label>
            <select className="jex-input" required value={formData.rfqId} onChange={handleRfqSelect}>
               <option value="">-- Select RFQ --</option>
               {Array.isArray(rfqs) && rfqs.map(rfq => (
                   <option key={rfq._id} value={rfq._id}>{rfq.rfqNumber} - {rfq.title}</option>
               ))}
            </select>
          </div>
          <div className="input-wrapper">
             <label className="input-label">Select Supplier</label>
             <select className="jex-input" required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
               <option value="">-- Select Supplier --</option>
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
          <div className="input-wrapper">
             <label className="input-label">Status</label>
             <select className="jex-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
             </select>
          </div>
          <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Notes</label>
            <input 
              className="jex-input" placeholder="Terms and conditions..."
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          
          <div className="input-wrapper" style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem' }}>
            {isEditing && (
              <button type="button" className="jex-btn btn-ghost" onClick={resetForm} style={{ flex: 1 }}>
                Cancel
              </button>
            )}
            <button type="submit" className="jex-btn btn-primary" style={{ flex: 2 }}>
              {isEditing ? 'Update PO' : 'Create PO'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="creation-card">Loading Purchase Orders...</div>
      ) : (
        <div className="cards-grid">
          {Array.isArray(filteredPOs) ? filteredPOs.map((po) => {
            const isConfirming = confirmDeleteId === po._id;
            return (
              <div key={po._id} className="entity-card" onClick={() => navigate(`/purchase-orders/${po._id}`)} style={{ cursor: 'pointer' }}>
                <div className="card-top">
                  <div className="card-main-info">
                    <h3 className="card-title">{po.purchaseNumber}</h3>
                    <span className="status-badge">{po.status ? po.status.toUpperCase() : 'DRAFT'}</span>
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--jex-text-light)' }}>
                    Supplier: {po.supplierId?.companyName || po.supplierId?.name || po.supplierId?.Name || 'Unknown'}<br/>
                    RFQ Ref: {po.rfqId?.rfqNumber || 'Unknown'}<br/>
                    <strong style={{ color: 'var(--jex-primary)', fontSize: '14px' }}>
                      Total Amount: ${(po.items?.reduce((sum, item) => sum + (item.total || (item.quantity * (item.Price || 0))), 0) || 0).toLocaleString()}
                    </strong>
                </div>
                
                <div className="card-actions" style={{ marginTop: '15px' }}>
                  {!isConfirming ? (
                    <>
                      <button type="button" className="action-link link-edit" onClick={(e) => handleEdit(po, e)}>✏️ Edit</button>
                      <button type="button" className="action-link link-delete" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(po._id); }}>🗑️ Del</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ef4444' }}>DEL?</span>
                      <button type="button" className="action-link link-delete" style={{ background: '#fff1f2' }} onClick={(e) => { e.stopPropagation(); executeDeleteAction(po._id); }}>YES</button>
                      <button type="button" className="action-link" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}>NO</button>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : null}
          {Array.isArray(pos) && pos.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--jex-text-light)' }}>No Purchase Orders found.</p>}
        </div>
      )}
    </div>
  );
}
