import { useState, useEffect } from 'react';
import api from '../api/api';

const TYPE_CONFIG = {
  IN:  { label: 'Stock IN',  color: '#10b981', bg: '#ecfdf5', icon: '📥', arrow: '▲' },
  OUT: { label: 'Stock OUT', color: '#ef4444', bg: '#fef2f2', icon: '📤', arrow: '▼' },
};

const REASONS_IN  = ['Purchase Order', 'Manual Adjustment', 'Returned', 'Transfer', 'Other'];
const REASONS_OUT = ['Sale', 'Damaged/Lost', 'Manual Adjustment', 'Transfer', 'Other'];

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

export default function Tracker() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterProduct, setFilterProduct] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN',
    quantity: '',
    reason: 'Manual Adjustment',
    note: '',
    referenceId: '',
    performedBy: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [movRes, prodRes] = await Promise.all([
        api.get('/stock-movements'),
        api.get('/products'),
      ]);
      setMovements(Array.isArray(movRes.data) ? movRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      console.error('Error fetching tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Update reason options when type changes
  const handleTypeChange = (newType) => {
    const defaultReason = newType === 'IN' ? 'Purchase Order' : 'Sale';
    setFormData(prev => ({ ...prev, type: newType, reason: defaultReason }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) return;
    setSubmitting(true);
    try {
      const res = await api.post('/stock-movements/create', formData);
      setSuccessMsg(`✅ ${res.data.message}  |  Stock: ${res.data.stockBefore} → ${res.data.stockAfter}`);
      if (res.data.emailPreviewUrl) {
          setPreviewUrl(res.data.emailPreviewUrl);
      } else {
          setPreviewUrl('');
      }
      setTimeout(() => { setSuccessMsg(''); setPreviewUrl(''); }, 8000);
      setFormData(prev => ({ ...prev, productId: '', quantity: '', note: '', referenceId: '' }));
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/stock-movements/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter movements
  const filtered = movements.filter(m => {
    if (filterType !== 'ALL' && m.type !== filterType) return false;
    if (filterProduct && (m.productId?._id || m.productId) !== filterProduct) return false;
    return true;
  });

  // Summary stats
  const totalIn  = movements.filter(m => m.type === 'IN').reduce((s, m) => s + m.quantity, 0);
  const totalOut = movements.filter(m => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0);

  const reasonOptions = formData.type === 'IN' ? REASONS_IN : REASONS_OUT;

  return (
    <div className="products-page">
      {/* Header */}
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: '#ecfdf5' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
          </div>
          <h1 className="page-headline">Stock Movement Tracker</h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Movements', value: movements.length, icon: '📋', color: '#6366f1', bg: '#f5f3ff' },
          { label: 'Total Stock IN',  value: totalIn,           icon: '📥', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Total Stock OUT', value: totalOut,          icon: '📤', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Net Movement',    value: totalIn - totalOut, icon: '📊', color: '#f59e0b', bg: '#fffbeb' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, borderRadius: '16px', padding: '1.2rem',
            display: 'flex', flexDirection: 'column', gap: '4px',
            border: `1px solid ${stat.color}22`
          }}>
            <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: stat.color }}>{stat.value}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Add Movement Form */}
      <div className="creation-card">
        <h3 style={{ marginBottom: '1.5rem', fontWeight: '700', color: 'var(--jex-text-main)', fontSize: '1.1rem' }}>
          ➕ Log Stock Movement
        </h3>

        {successMsg && (
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontWeight: '600', fontSize: '0.9rem', border: '1px solid #a7f3d0' }}>
            {successMsg}
            {previewUrl && (
              <div style={{ marginTop: '8px' }}>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'underline' }}>
                  📧 Click here to view the automated email sent to the Admin!
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="creation-grid" style={{ marginBottom: '1rem' }}>
            {/* Product */}
            <div className="input-wrapper">
              <label className="input-label">Product *</label>
              <select className="jex-input jex-select" required
                value={formData.productId}
                onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="">— Select Product —</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Type IN/OUT */}
            <div className="input-wrapper">
              <label className="input-label">Movement Type *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['IN', 'OUT'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => handleTypeChange(t)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px',
                      border: '2px solid',
                      borderColor: formData.type === t ? TYPE_CONFIG[t].color : 'rgba(0,0,0,0.08)',
                      background: formData.type === t ? TYPE_CONFIG[t].bg : 'white',
                      color: formData.type === t ? TYPE_CONFIG[t].color : 'var(--jex-text-muted)',
                      fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                    }}
                  >
                    {TYPE_CONFIG[t].icon} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="input-wrapper">
              <label className="input-label">Quantity *</label>
              <input type="number" min="1" className="jex-input" placeholder="e.g. 50" required
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
              />
            </div>

            {/* Reason */}
            <div className="input-wrapper">
              <label className="input-label">Reason</label>
              <select className="jex-input jex-select"
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}>
                {reasonOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Reference */}
            <div className="input-wrapper">
              <label className="input-label">Reference # (optional)</label>
              <input className="jex-input" placeholder="e.g. PO-0001"
                value={formData.referenceId}
                onChange={e => setFormData({...formData, referenceId: e.target.value})}
              />
            </div>

            {/* Performed By */}
            <div className="input-wrapper">
              <label className="input-label">Performed By</label>
              <input className="jex-input" placeholder="Your name"
                value={formData.performedBy}
                onChange={e => setFormData({...formData, performedBy: e.target.value})}
              />
            </div>

            {/* Note */}
            <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Note (optional)</label>
              <input className="jex-input" placeholder="Additional details about this movement..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="jex-btn btn-primary" disabled={submitting || !formData.productId}>
            {submitting ? 'Saving...' : `${TYPE_CONFIG[formData.type].icon} Log ${formData.type === 'IN' ? 'Stock IN' : 'Stock OUT'}`}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--jex-text-muted)' }}>Filter:</span>
        {['ALL', 'IN', 'OUT'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: '7px 18px', borderRadius: '10px', border: '1px solid',
            borderColor: filterType === t ? (t === 'IN' ? '#10b981' : t === 'OUT' ? '#ef4444' : 'var(--jex-primary)') : 'rgba(0,0,0,0.08)',
            background: filterType === t ? (t === 'IN' ? '#ecfdf5' : t === 'OUT' ? '#fef2f2' : 'rgba(99,102,241,0.08)') : 'white',
            color: filterType === t ? (t === 'IN' ? '#10b981' : t === 'OUT' ? '#ef4444' : 'var(--jex-primary)') : 'var(--jex-text-muted)',
            fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>
            {t === 'IN' ? '📥 Stock IN' : t === 'OUT' ? '📤 Stock OUT' : '📋 All'}
          </button>
        ))}
        <select className="jex-input" style={{ padding: '8px 14px', width: 'auto', fontSize: '0.85rem' }}
          value={filterProduct}
          onChange={e => setFilterProduct(e.target.value)}>
          <option value="">All Products</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--jex-text-muted)', fontWeight: '600' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Movement Log Table */}
      {loading ? (
        <div className="creation-card" style={{ textAlign: 'center', color: 'var(--jex-text-muted)' }}>Loading movements...</div>
      ) : filtered.length === 0 ? (
        <div className="creation-card" style={{ textAlign: 'center', color: 'var(--jex-text-muted)', padding: '3rem' }}>
          No stock movements found. Log your first movement above!
        </div>
      ) : (
        <div className="creation-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead style={{ background: 'var(--jex-bg)' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before → After</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note / Ref</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.78rem', fontWeight: '700', color: 'var(--jex-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Del</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const tc = TYPE_CONFIG[m.type];
                const dt = formatDateTime(m.createdAt);
                const isConfirming = confirmDeleteId === m._id;

                return (
                  <tr key={m._id} style={{
                    borderBottom: '1px solid var(--jex-border-light)',
                    background: idx % 2 === 0 ? 'white' : 'rgba(248,250,255,0.5)',
                    transition: 'background 0.15s'
                  }}>
                    {/* # */}
                    <td style={{ padding: '12px 16px', color: 'var(--jex-text-light)', fontSize: '0.8rem', fontWeight: '700' }}>
                      {filtered.length - idx}
                    </td>
                    {/* Date */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{dt.date}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--jex-text-light)' }}>{dt.time}</div>
                    </td>
                    {/* Product */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.productId?.name || 'Deleted'}</div>
                      {m.productId?.units && <div style={{ fontSize: '0.72rem', color: 'var(--jex-text-muted)' }}>{m.productId.units}</div>}
                    </td>
                    {/* Type */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem',
                        fontWeight: '800', background: tc.bg, color: tc.color
                      }}>
                        {tc.arrow} {m.type}
                      </span>
                    </td>
                    {/* Qty */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem', color: tc.color }}>
                        {m.type === 'IN' ? '+' : '-'}{m.quantity}
                      </span>
                    </td>
                    {/* Before → After */}
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--jex-text-muted)' }}>{m.stockBefore}</span>
                      <span style={{ margin: '0 6px', color: 'var(--jex-text-light)' }}>→</span>
                      <span style={{ fontWeight: '700', color: m.type === 'IN' ? '#10b981' : '#ef4444' }}>{m.stockAfter}</span>
                    </td>
                    {/* Reason */}
                    <td style={{ padding: '12px 16px', fontSize: '0.83rem', color: 'var(--jex-text-muted)' }}>
                      {m.reason}
                      {m.referenceId && <div style={{ fontSize: '0.72rem', color: 'var(--jex-primary)', fontWeight: '600' }}>Ref: {m.referenceId}</div>}
                      {m.performedBy && <div style={{ fontSize: '0.72rem', color: 'var(--jex-text-light)' }}>By: {m.performedBy}</div>}
                    </td>
                    {/* Note */}
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--jex-text-muted)', maxWidth: '160px' }}>
                      {m.note || <span style={{ color: 'var(--jex-text-light)' }}>—</span>}
                    </td>
                    {/* Delete */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {!isConfirming ? (
                        <button className="action-link link-delete" style={{ margin: 0, padding: '5px 8px' }}
                          onClick={() => setConfirmDeleteId(m._id)}>🗑️</button>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button className="action-link link-delete" onClick={() => handleDelete(m._id)}>Yes</button>
                          <button className="action-link" onClick={() => setConfirmDeleteId(null)}>No</button>
                        </div>
                      )}
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
