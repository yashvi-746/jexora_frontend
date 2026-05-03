import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    items: [],
    notes: ''
  });

  const [itemEntry, setItemEntry] = useState({ productId: '', quantity: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, wareRes, prodRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      setTransfers(transRes.data);
      setWarehouses(wareRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching transfer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddItem = () => {
    if (!itemEntry.productId || !itemEntry.quantity) return;
    const prod = products.find(p => p._id === itemEntry.productId);
    const newItem = {
      productId: itemEntry.productId,
      productName: prod?.name || 'Unknown',
      quantity: parseInt(itemEntry.quantity)
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
    setItemEntry({ productId: '', quantity: 1 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add items to transfer');
      return;
    }
    try {
      await api.post('/transfers', formData);
      setShowModal(false);
      setFormData({ fromWarehouseId: '', toWarehouseId: '', items: [], notes: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <span style={{ fontSize: '24px' }}>🚛</span>
          </div>
          <h1 className="page-headline">Warehouse Transfers</h1>
        </div>
        <button className="jex-btn btn-primary" onClick={() => setShowModal(true)}>
          New Transfer +
        </button>
      </div>

      {loading ? (
        <div className="creation-card">Syncing logistics...</div>
      ) : (
        <div className="cards-grid">
          {transfers.map(tr => (
            <div key={tr._id} className="entity-card">
              <div className="card-top">
                <div className="card-main-info">
                  <h3 className="card-title">{tr.transferNumber}</h3>
                  <p className="card-subtitle">{tr.fromWarehouseId?.name} ➡️ {tr.toWarehouseId?.name}</p>
                </div>
                <div className="card-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  {tr.status.toUpperCase()}
                </div>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-icon">🔢</span>
                  <span className="detail-text">{tr.items.length} Product types</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{new Date(tr.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {transfers.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: 'var(--jex-text-light)' }}>
              No stock transfers yet. 
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2>Create Stock Transfer</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="creation-grid">
                <div className="input-wrapper">
                  <label className="input-label">From Warehouse</label>
                  <input 
                    list="warehouses-list"
                    className="jex-input" 
                    placeholder="Type to search..."
                    required 
                    onChange={e => {
                      const selected = warehouses.find(w => w.name === e.target.value);
                      if (selected) setFormData({...formData, fromWarehouseId: selected._id});
                    }}
                  />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">To Warehouse</label>
                  <input 
                    list="warehouses-list"
                    className="jex-input" 
                    placeholder="Type to search..."
                    required 
                    onChange={e => {
                      const selected = warehouses.find(w => w.name === e.target.value);
                      if (selected) setFormData({...formData, toWarehouseId: selected._id});
                    }}
                  />
                </div>
                <datalist id="warehouses-list">
                  {warehouses.map(w => <option key={w._id} value={w.name} />)}
                </datalist>
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Add Items</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="input-wrapper">
                    <label className="input-label">Product</label>
                    <select className="jex-input" value={itemEntry.productId} onChange={e => setItemEntry({...itemEntry, productId: e.target.value})}>
                      <option value="">-- Select --</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Qty</label>
                    <input type="number" className="jex-input" min="1" value={itemEntry.quantity} onChange={e => setItemEntry({...itemEntry, quantity: e.target.value})} />
                  </div>
                  <button type="button" className="jex-btn btn-primary" onClick={handleAddItem}>Add</button>
                </div>
                
                <ul style={{ marginTop: '15px', listStyle: 'none' }}>
                  {formData.items.map((it, idx) => (
                    <li key={idx} style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.productName}</span>
                      <strong>x{it.quantity}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="jex-btn btn-primary" style={{ flex: 1 }}>Complete Transfer</button>
                <button type="button" className="jex-btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
