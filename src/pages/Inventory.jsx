import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Per-row edit state: { [inventoryId]: { quantity, minStocks } }
  const [rowEdits, setRowEdits] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, prodRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/products')
      ]);
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRowChange = (invId, field, value) => {
    setRowEdits(prev => ({
      ...prev,
      [invId]: { ...prev[invId], [field]: value }
    }));
  };

  const handleSaveRow = async (item) => {
    const edits = rowEdits[item._id];
    if (!edits || (edits.quantity === undefined && edits.minStocks === undefined)) return;

    const payload = {};
    if (edits.quantity !== undefined && edits.quantity !== '') {
      payload.quantity = parseInt(edits.quantity);
    }
    if (edits.minStocks !== undefined && edits.minStocks !== '') {
      payload.minStocks = parseInt(edits.minStocks);
    }
    if (Object.keys(payload).length === 0) return;

    setSavingId(item._id);
    try {
      await api.put(`/inventory/${item._id}`, payload);
      setRowEdits(prev => { const n = {...prev}; delete n[item._id]; return n; });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStockStatus = (quantity, minStock = 10) => {
    if (quantity <= 0)         return { label: 'Out of Stock', color: '#ef4444', bg: '#fef2f2' };
    if (quantity <= minStock)  return { label: 'Low Stock',    color: '#f59e0b', bg: '#fffbeb' };
    return                            { label: 'In Stock',     color: '#10b981', bg: '#ecfdf5' };
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: 'var(--jex-secondary-soft)' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
          </div>
          <h1 className="page-headline">Inventory Management</h1>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="creation-card" style={{ textAlign: 'center', color: 'var(--jex-text-muted)' }}>
          Loading inventory...
        </div>
      ) : (
        <div className="creation-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--jex-bg-alt)' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--jex-text-muted)' }}>
                    No inventory records. Create products first, then they will appear here.
                  </td>
                </tr>
              )}
              {inventory.map((item) => {
                const status = getStockStatus(item.quantity, item.minStocks);
                const edits = rowEdits[item._id] || {};
                const isConfirming = confirmDeleteId === item._id;
                const isLow = item.quantity <= item.minStocks && item.quantity > 0;
                const isOut = item.quantity <= 0;

                return (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: '1px solid var(--jex-border-light)',
                      background: isOut ? '#fff5f5' : isLow ? '#fffdf0' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    {/* Product Info */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                        {item.productId?.name || 'Deleted Product'}
                      </div>
                      {item.productId?.categoryId?.name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--jex-text-muted)', marginTop: '2px' }}>
                          {item.productId.categoryId.name}
                        </div>
                      )}
                      {item.productId?.price && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--jex-text-muted)' }}>
                          ₹{item.productId.price}
                        </div>
                      )}
                    </td>

                    {/* Current Stock */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isOut ? '#ef4444' : isLow ? '#f59e0b' : 'inherit' }}>
                        {item.quantity}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--jex-text-muted)', marginLeft: '4px' }}>
                        {item.productId?.units || 'pcs'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: status.bg,
                        color: status.color
                      }}>
                        {status.label}
                      </span>
                    </td>

                    {/* Update Quantity */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="number" min="0"
                          className="jex-input"
                          style={{ width: '75px', padding: '5px 8px', fontSize: '0.85rem' }}
                          placeholder="qty"
                          value={edits.quantity ?? ''}
                          onChange={(e) => handleRowChange(item._id, 'quantity', e.target.value)}
                        />
                      </div>
                    </td>

                    {/* Min Stock */}
                    <td style={{ padding: '14px 16px' }}>
                      <input
                        type="number" min="0"
                        className="jex-input"
                        style={{ width: '75px', padding: '5px 8px', fontSize: '0.85rem' }}
                        placeholder={item.minStocks ?? 10}
                        value={edits.minStocks ?? ''}
                        onChange={(e) => handleRowChange(item._id, 'minStocks', e.target.value)}
                      />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!isConfirming ? (
                          <>
                            <button
                              className="jex-btn btn-primary"
                              style={{ padding: '5px 14px', fontSize: '0.82rem' }}
                              disabled={savingId === item._id || (!edits.quantity && !edits.minStocks)}
                              onClick={() => handleSaveRow(item)}
                            >
                              {savingId === item._id ? '...' : 'Save'}
                            </button>
                            <button
                              className="action-link link-delete"
                              style={{ margin: '0', padding: '5px 8px' }}
                              onClick={() => setConfirmDeleteId(item._id)}
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ef4444' }}>Delete?</span>
                            <button className="action-link link-delete" onClick={() => handleDelete(item._id)}>Yes</button>
                            <button className="action-link" onClick={() => setConfirmDeleteId(null)}>No</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
