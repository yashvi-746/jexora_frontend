import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import BarcodeScanner from '../components/BarcodeScanner';
import { QRCodeCanvas } from 'qrcode.react';

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    items: [],
    notes: '',
    status: 'draft'
  });

  const [itemEntry, setItemEntry] = useState({ productId: '', quantity: 1, unitPrice: 0 });

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, custRes, prodRes] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(orderRes.data);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching sales data:', err);
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
      quantity: parseInt(itemEntry.quantity),
      unitPrice: parseFloat(itemEntry.unitPrice || prod?.price || 0),
      total: parseInt(itemEntry.quantity) * parseFloat(itemEntry.unitPrice || prod?.price || 0)
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
    setItemEntry({ productId: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    try {
      await api.post('/sales-orders', formData);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setFormData({ customerId: '', items: [], notes: '', status: 'draft' });
    setItemEntry({ productId: '', quantity: 1, unitPrice: 0 });
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customerId?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return { bg: '#ecfdf5', text: '#10b981' };
      case 'shipped':   return { bg: '#eff6ff', text: '#3b82f6' };
      case 'delivered': return { bg: '#f0fdf4', text: '#16a34a' };
      case 'cancelled': return { bg: '#fef2f2', text: '#ef4444' };
      default:          return { bg: '#f8fafc', text: '#64748b' };
    }
  };

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const showUpiQr = (order) => {
    setActiveOrder(order);
    setShowUpiModal(true);
  };

  const confirmPayment = async (orderId) => {
    try {
      await api.post('/payments/verify-manual', { salesOrderId: orderId });
      alert('Order marked as PAID successfully!');
      setShowUpiModal(false);
      fetchData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background: 'var(--jex-secondary-soft)' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
          </div>
          <h1 className="page-headline">Sales Orders</h1>
          <div className="search-container" style={{ marginLeft: '20px', flex: 1 }}>
            <input 
              type="text" className="search-input" 
              placeholder="Search by order # or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="jex-btn btn-primary" onClick={() => setShowModal(true)}>
          New Sale +
        </button>
      </div>

      {loading ? (
        <div className="creation-card">Loading sales history...</div>
      ) : (
        <div className="cards-grid">
          {filteredOrders.map(order => {
            const statusStyle = getStatusColor(order.status);
            const isPaid = order.paymentStatus === 'paid';
            
            return (
              <div key={order._id} className="entity-card" onClick={() => navigate(`/sales-orders/${order._id}`)} style={{ cursor: 'pointer' }}>
                <div className="card-top">
                  <div className="card-main-info">
                    <h3 className="card-title">{order.orderNumber}</h3>
                    <p className="card-subtitle">{order.customerId?.name || 'Walk-in Customer'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {isPaid && (
                      <div className="card-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>PAID</div>
                    )}
                    <div className="card-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                      {order.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">💰</span>
                    <span className="detail-text" style={{ fontWeight: '700', color: 'var(--jex-primary)' }}>
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button className="action-link" onClick={(e) => { e.stopPropagation(); navigate(`/sales-orders/${order._id}`); }}>View Details</button>
                  {!isPaid && order.status !== 'cancelled' && (
                    <button 
                      className="jex-btn btn-primary" 
                      style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); showUpiQr(order); }}
                    >
                      💳 Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPI QR MODAL */}
      {showUpiModal && activeOrder && (
        <div className="modal-overlay" onClick={() => setShowUpiModal(false)}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ background: '#f0fdf4', display: 'inline-block', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}>
                 <span style={{ fontSize: '2rem' }}>📱</span>
              </div>
              <h2 style={{ margin: 0 }}>Scan to Pay</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>Use Google Pay, PhonePe, or Paytm</p>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '20px' }}>
              <QRCodeCanvas 
                value={`upi://pay?pa=shahyashvi746@okicici&pn=InventIQ&am=${activeOrder.totalAmount}&cu=INR&tn=Order_${activeOrder.orderNumber}`} 
                size={200}
                level="H"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--jex-primary)' }}>₹{activeOrder.totalAmount.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Order: {activeOrder.orderNumber}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="jex-btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => confirmPayment(activeOrder._id)}
              >
                I have paid successfully
              </button>
              <button 
                className="jex-btn btn-ghost" 
                style={{ width: '100%' }}
                onClick={() => setShowUpiModal(false)}
              >
                Cancel
              </button>
            </div>
            
            <p style={{ marginTop: '20px', fontSize: '0.7rem', color: '#94a3b8' }}>
              Money goes directly to your bank account with 0% fees.
            </p>
          </div>
        </div>
      )}


      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create New Sales Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="creation-grid">
                <div className="input-wrapper">
                  <label className="input-label">Customer *</label>
                  <select className="jex-input" required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.companyName || 'Individual'})</option>
                    ))}
                  </select>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Status</label>
                  <select className="jex-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed (Reduces Stock)</option>
                  </select>
                </div>
              </div>

              {/* Item Entry Section */}
              <div style={{ background: 'var(--jex-bg-alt)', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Add Products</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="input-wrapper">
                    <label className="input-label">Product</label>
                    <select className="jex-input" value={itemEntry.productId} onChange={e => {
                      const p = products.find(x => x._id === e.target.value);
                      setItemEntry({...itemEntry, productId: e.target.value, unitPrice: p?.price || 0});
                    }}>
                      <option value="">-- Select --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Qty</label>
                    <input type="number" className="jex-input" min="1" value={itemEntry.quantity} onChange={e => setItemEntry({...itemEntry, quantity: e.target.value})} />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Price</label>
                    <input type="number" className="jex-input" value={itemEntry.unitPrice} onChange={e => setItemEntry({...itemEntry, unitPrice: e.target.value})} />
                  </div>
                  <button type="button" className="jex-btn btn-primary" onClick={handleAddItem}>Add</button>
                  <button type="button" className="jex-btn btn-ghost" onClick={() => setShowScanner(true)} title="Scan Barcode">📷 Scan</button>
                </div>

                {/* Barcode Scanner Modal Integration */}
                {showScanner && (
                  <BarcodeScanner 
                    onScan={(barcode) => {
                      const prod = products.find(p => p.barcode === barcode);
                      if (prod) {
                        setItemEntry({ productId: prod._id, quantity: 1, unitPrice: prod.price });
                        setShowScanner(false);
                      } else {
                        alert('Product not found for barcode: ' + barcode);
                        setShowScanner(false);
                      }
                    }}
                    onClose={() => setShowScanner(false)}
                  />
                )}

                {/* Items List */}
                <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--jex-border-light)' }}>
                      <th style={{ padding: '8px' }}>Product</th>
                      <th style={{ padding: '8px' }}>Qty</th>
                      <th style={{ padding: '8px' }}>Price</th>
                      <th style={{ padding: '8px' }}>Total</th>
                      <th style={{ padding: '8px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--jex-border-light)' }}>
                        <td style={{ padding: '8px' }}>{it.productName}</td>
                        <td style={{ padding: '8px' }}>{it.quantity}</td>
                        <td style={{ padding: '8px' }}>₹{it.unitPrice}</td>
                        <td style={{ padding: '8px' }}>₹{it.total}</td>
                        <td style={{ padding: '8px' }}>
                          <button type="button" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removeItem(idx)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '10px', fontWeight: 'bold' }}>
                  Total: ₹{formData.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}
                </div>
              </div>

              <div className="input-wrapper" style={{ marginTop: '20px' }}>
                <label className="input-label">Notes</label>
                <textarea className="jex-input" style={{ minHeight: '60px' }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="jex-btn btn-primary" style={{ flex: 1 }}>Create Sales Order</button>
                <button type="button" className="jex-btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
