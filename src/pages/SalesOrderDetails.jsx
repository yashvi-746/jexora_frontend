import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function SalesOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sales-orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/sales-orders/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const generateInvoicePDF = () => {
    const printWindow = window.open('', '_blank');
    const invoiceDate = new Date(order.createdAt).toLocaleDateString();
    const customerName = order.customerId?.name || 'Walk-in Customer';

    const html = `
      <html>
        <head>
          <title>Sales Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0891b2; padding-bottom: 20px; margin-bottom: 40px; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #0891b2; }
            .company-info { text-align: right; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .total-row { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-title">SALES INVOICE</div>
            <div class="company-info">
              <strong>InventIQ Systems</strong><br>
              Order #: ${order.orderNumber}<br>
              Date: ${invoiceDate}
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">Bill To:</div>
              <strong>${customerName}</strong><br>
              ${order.customerId?.companyName || ''}<br>
              ${order.customerId?.address || ''}<br>
              ${order.customerId?.city || ''}<br>
              ${order.customerId?.phone || ''}
            </div>
            <div>
              <div class="section-title">Payment Info:</div>
              Status: <strong>${order.paymentStatus?.toUpperCase() || 'UNPAID'}</strong><br>
              Order Status: <strong>${order.status?.toUpperCase()}</strong><br>
              Currency: INR (₹)
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.productId?.name || 'Unknown Item'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice.toFixed(2)}</td>
                  <td><strong>₹${item.total.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-row">
            Grand Total: ₹${order.totalAmount.toFixed(2)}
          </div>

          <div class="footer">
            Thank you for your business!<br>
            This is a computer-generated invoice.
          </div>

          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) return <div className="categories-page">Loading order details...</div>;
  if (!order) return <div className="categories-page">Order not found.</div>;

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <button className="jex-btn btn-ghost" onClick={() => navigate('/sales-orders')} style={{ marginRight: '15px' }}>
             ← Back
          </button>
          <div className="title-icon-box" style={{ background: 'var(--jex-secondary-soft)' }}>
            <span style={{ fontSize: '24px' }}>📄</span>
          </div>
          <h1 className="page-headline">Sale: {order.orderNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="jex-btn btn-ghost" onClick={generateInvoicePDF} style={{ background: 'white' }}>
            🖨️ Print Invoice
          </button>
          {order.status === 'draft' && (
            <button className="jex-btn btn-primary" onClick={() => updateStatus('confirmed')}>
              Confirm Order
            </button>
          )}
          {order.status === 'confirmed' && (
            <button className="jex-btn btn-primary" onClick={() => updateStatus('shipped')}>
              Mark as Shipped
            </button>
          )}
        </div>
      </div>

      <div className="creation-grid" style={{ marginTop: '20px' }}>
        <div className="creation-card">
          <h3 style={{ marginBottom: '15px' }}>Customer Information</h3>
          <p><strong>Name:</strong> {order.customerId?.name}</p>
          <p><strong>Company:</strong> {order.customerId?.companyName || 'N/A'}</p>
          <p><strong>Email:</strong> {order.customerId?.email}</p>
          <p><strong>Address:</strong> {order.customerId?.address || 'N/A'}, {order.customerId?.city || ''}</p>
        </div>
        <div className="creation-card">
          <h3 style={{ marginBottom: '15px' }}>Order Summary</h3>
          <p><strong>Order #:</strong> {order.orderNumber}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> <span className="status-badge" style={{ background: 'var(--jex-primary-soft)', color: 'var(--jex-primary)' }}>{order.status.toUpperCase()}</span></p>
          <p><strong>Total Amount:</strong> <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--jex-primary)' }}>₹{order.totalAmount.toLocaleString()}</span></p>
        </div>
      </div>

      <div className="creation-card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Order Items</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px 0' }}>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid #fafafa' }}>
                <td style={{ padding: '12px 0' }}>
                  <div style={{ fontWeight: '600' }}>{item.productId?.name || 'Deleted Product'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>ID: {item.productId?._id}</div>
                </td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice.toLocaleString()}</td>
                <td><strong>₹{item.total.toLocaleString()}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div className="creation-card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Notes</h3>
          <p style={{ fontStyle: 'italic', color: '#666' }}>{order.notes}</p>
        </div>
      )}
    </div>
  );
}
