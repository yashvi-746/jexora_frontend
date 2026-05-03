import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function RfqDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ productId: '', quantity: '', unitPrice: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rfqRes, itemsRes, prodRes] = await Promise.all([
        api.get(`/rfqs/${id}`),
        api.get(`/rfqs/${id}/items`),
        api.get('/products')
      ]);
      setRfq(rfqRes.data);
      setItems(itemsRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/rfqs/${id}/items`, formData);
      setFormData({ productId: '', quantity: '', unitPrice: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="categories-page">Loading RFQ Details...</div>;
  if (!rfq) return <div className="categories-page">RFQ not found.</div>;

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <button className="jex-btn btn-ghost" onClick={() => navigate('/rfqs')} style={{ marginRight: '15px' }}>
             ← Back
          </button>
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>📄</span>
          </div>
          <h1 className="page-headline">{rfq.title} ({rfq.rfqNumber})</h1>
        </div>
      </div>

      <div className="creation-card" style={{ marginBottom: '20px' }}>
         <h3 style={{ marginBottom: '10px' }}>RFQ Details</h3>
         <p><strong>Status:</strong> <span className="status-badge">{rfq.status ? rfq.status.toUpperCase() : 'DRAFT'}</span></p>
         <p><strong>Notes:</strong> {rfq.notes || 'N/A'}</p>
         <p><strong>Suppliers:</strong> {rfq.suppliers && rfq.suppliers.length > 0 ? rfq.suppliers.map(s => s.companyName || s.name || s.Name || s).join(', ') : 'None'}</p>
      </div>

      <div className="creation-card">
         <h3 style={{ marginBottom: '15px' }}>Add Item</h3>
        <form className="creation-grid" onSubmit={handleAddItem}>
          <div className="input-wrapper">
            <label className="input-label">Select Product</label>
            <select className="jex-input" required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
               <option value="">-- Select --</option>
               {products.map(p => (
                   <option key={p._id} value={p._id}>{p.name} {p.price ? `(₹${p.price})` : ''}</option>
               ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Quantity</label>
            <input 
              type="number" className="jex-input" required min="1"
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Unit Price (Optional)</label>
            <input 
              type="number" className="jex-input" step="0.01"
              value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})}
            />
          </div>
          <div className="input-wrapper" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="jex-btn btn-primary" style={{ width: '100%' }}>
              Add Item +
            </button>
          </div>
        </form>
      </div>

      <div className="creation-card" style={{ marginTop: '20px' }}>
         <h3 style={{ marginBottom: '15px' }}>Items List</h3>
         {items.length === 0 ? (
             <p style={{ color: 'var(--jex-text-light)' }}>No items added yet.</p>
         ) : (
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                 <thead>
                     <tr style={{ borderBottom: '1px solid #eee' }}>
                         <th style={{ padding: '10px 0' }}>Product</th>
                         <th>Quantity</th>
                         <th>Unit Price</th>
                     </tr>
                 </thead>
                 <tbody>
                     {items.map(item => (
                         <tr key={item._id} style={{ borderBottom: '1px solid #fafafa' }}>
                             <td style={{ padding: '10px 0' }}>{item.productId?.name || 'Unknown'}</td>
                             <td>{item.quantity}</td>
                             <td>{item.unitPrice ? `₹${item.unitPrice}` : '-'}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         )}
      </div>

    </div>
  );
}
