import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function PurchaseOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      setPo(res.data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="categories-page">Loading PO Details...</div>;
  if (!po) return <div className="categories-page">Purchase Order not found.</div>;

  const totalAmount = po.items?.reduce((acc, item) => acc + (item.total || (item.quantity * (item.Price || item.unitPrice || 0))), 0) || 0;

  const generateInvoicePDF = () => {
    const printWindow = window.open('', '_blank');
    const invoiceDate = new Date().toLocaleDateString();
    const supplierName = po.supplierId?.companyName || po.supplierId?.name || 'Unknown Supplier';

    const html = `
      <html>
        <head>
          <title>Invoice - ${po.purchaseNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #4f46e5; }
            .company-info { text-align: right; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .total-row { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-title">INVOICE</div>
            <div class="company-info">
              <strong>InventIQ Systems</strong><br>
              Order #: ${po.purchaseNumber}<br>
              Date: ${invoiceDate}
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">Bill To:</div>
              <strong>${supplierName}</strong><br>
              ${po.supplierId?.email || ''}<br>
              Status: <strong>${po.status?.toUpperCase() || 'DRAFT'}</strong>
            </div>
            <div>
              <div class="section-title">Order Info:</div>
              Reference: ${po.rfqId?.rfqNumber || 'N/A'}<br>
              Project: ${po.notes || 'General Inventory'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(po.items || []).map(item => {
                const up = item.Price || item.unitPrice || 0;
                const tot = item.total || (item.quantity * up);
                return `
                <tr>
                  <td>${item.productId?.name || 'Unknown Item'}</td>
                  <td>${item.quantity}</td>
                  <td>$${up.toFixed(2)}</td>
                  <td><strong>$${tot.toFixed(2)}</strong></td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <div class="total-row">
            Total Amount: $${totalAmount.toFixed(2)}
          </div>

          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <button className="jex-btn btn-ghost" onClick={() => navigate('/purchase-orders')} style={{ marginRight: '15px' }}>
             ← Back
          </button>
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>📄</span>
          </div>
          <h1 className="page-headline">{po.purchaseNumber} Details</h1>
        </div>
        <button 
          className="jex-btn btn-ghost" 
          onClick={generateInvoicePDF}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}
        >
          🖨️ Print Invoice PDF
        </button>
      </div>

      <div className="creation-card" style={{ marginBottom: '20px' }}>
         <h3 style={{ marginBottom: '10px' }}>General Information</h3>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
           <p><strong>Status:</strong> <span className="status-badge">{po.status ? po.status.toUpperCase() : 'DRAFT'}</span></p>
           <p><strong>RFQ Reference:</strong> {po.rfqId?.rfqNumber || po.rfqId?.title || 'N/A'}</p>
           <p><strong>Supplier:</strong> {po.supplierId?.companyName || po.supplierId?.name || po.supplierId?.Name || 'Unknown'}</p>
           <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
         </div>
         <p style={{ marginTop: '15px' }}><strong>Notes:</strong> {po.notes || 'N/A'}</p>
      </div>

      <div className="creation-card" style={{ marginTop: '20px' }}>
         <h3 style={{ marginBottom: '15px' }}>Purchase Items</h3>
         {!po.items || po.items.length === 0 ? (
             <p style={{ color: 'var(--jex-text-light)' }}>No items in this purchase order.</p>
         ) : (
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                 <thead>
                     <tr style={{ borderBottom: '1px solid #eee' }}>
                         <th style={{ padding: '10px 0' }}>Product</th>
                         <th>Quantity</th>
                         <th>Unit Price</th>
                         <th>Total</th>
                     </tr>
                 </thead>
                 <tbody>
                      {po.items.map(item => {
                          const unitPrice = item.Price || item.unitPrice || 0;
                          const total = item.total || (item.quantity * unitPrice);
                          return (
                            <tr key={item._id} style={{ borderBottom: '1px solid #fafafa' }}>
                                <td style={{ padding: '10px 0' }}>{item.productId?.name || 'Unknown'}</td>
                                <td>{item.quantity}</td>
                                <td>${unitPrice}</td>
                                <td><strong>${total}</strong></td>
                            </tr>
                          );
                      })}
                 </tbody>
             </table>
         )}
      </div>

    </div>
  );
}
