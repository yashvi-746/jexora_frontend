import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    costPrice: '', 
    categoryId: '', 
    initialStock: 100, 
    currentStock: 100, 
    barcode: '', 
    units: 'pcs' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/products/${editId}`, { 
          ...formData, 
          currentStock: formData.currentStock 
        });
      } else {
        await api.post('/products/create', formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product._id || product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      costPrice: product.costPrice || 0,
      categoryId: product.categoryId?._id || product.categoryId?.id || '',
      initialStock: product.initialStock || 100,
      currentStock: product.currentStock || 100,
      barcode: product.barcode || '',
      units: product.units || 'pcs'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteAction = async (id) => {
    try {
      await api.post(`/products/delete/${id}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      costPrice: '',
      categoryId: '', 
      initialStock: 100, 
      currentStock: 100, 
      barcode: '', 
      units: 'pcs' 
    });
  };

  return (
    <div className="products-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>📦</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit Product' : 'Products'}</h1>
        </div>
        <div className="search-container">
          <input 
            type="text" className="search-input" 
            placeholder="Search products by name or barcode..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="creation-card">
        <form onSubmit={handleSubmit}>
          <div className="creation-grid">
            <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Product Name</label>
              <input 
                className="jex-input" placeholder="e.g. Industrial Laptop" required
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Category</label>
              {!showCategoryInput ? (
                <select 
                  className="jex-input jex-select" required
                  value={formData.categoryId} 
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setShowCategoryInput(true);
                    } else {
                      setFormData({...formData, categoryId: e.target.value});
                    }
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                  <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--jex-primary)' }}>+ Add New Category</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className="jex-input" 
                    placeholder="Enter category name..." 
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="jex-btn btn-primary" 
                    style={{ padding: '8px 12px' }}
                    onClick={async () => {
                      if (!newCategoryName.trim()) return;
                      try {
                        const res = await api.post('/categories/create', { name: newCategoryName });
                        const newCat = res.data.category || res.data;
                        setCategories([...categories, newCat]);
                        setFormData({...formData, categoryId: newCat._id || newCat.id});
                        setNewCategoryName('');
                        setShowCategoryInput(false);
                      } catch (err) {
                        alert('Error adding category: ' + (err.response?.data?.message || err.message));
                      }
                    }}
                  >
                    Add
                  </button>
                  <button 
                    type="button" 
                    className="jex-btn btn-ghost" 
                    style={{ padding: '8px 12px' }}
                    onClick={() => setShowCategoryInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="creation-grid">
            <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Description (optional)</label>
              <input 
                className="jex-input" placeholder="Technical specifications..."
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Units</label>
              <input 
                className="jex-input" placeholder="e.g. pcs, kg, boxes"
                value={formData.units} onChange={(e) => setFormData({...formData, units: e.target.value})}
              />
            </div>
          </div>
          <div className="creation-grid">
            <div className="input-wrapper">
              <label className="input-label">Base Price (₹) - Selling</label>
              <input 
                type="number" className="jex-input" placeholder="0.00" required
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Cost Price (₹) - Buying</label>
              <input 
                type="number" className="jex-input" placeholder="0.00" required
                value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">{isEditing ? 'Current Stock' : 'Initial Stock'}</label>
              <input 
                type="number" className="jex-input" required
                value={isEditing ? formData.currentStock : formData.initialStock} 
                onChange={(e) => setFormData({...formData, [isEditing ? 'currentStock' : 'initialStock']: parseInt(e.target.value)})}
              />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Barcode (optional)</label>
              <input 
                className="jex-input" placeholder="Scan or enter barcode"
                value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="jex-btn btn-primary">
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
            {isEditing && (
              <button type="button" className="jex-btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="creation-card" style={{ textAlign: 'center' }}>Loading products...</div>
      ) : (
        <div className="cards-grid">
          {filteredProducts.map((product) => {
            const pId = product._id || product.id;
            const isConfirming = confirmDeleteId === pId;

            return (
              <div key={pId} className="entity-card">
                <div className="card-top">
                  <div className="card-main-info">
                    <h3 className="card-title">{product.name}</h3>
                    <div className="info-item">
                      <span className="status-badge">{product.categoryId?.name || 'Uncategorized'}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>{product.units || 'pcs'}</span>
                    </div>
                  </div>
                  <div className="card-initial-box">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '12px 0' }}>
                  {product.description || 'No description provided.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>STOCK LEVEL</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: product.currentStock < 10 ? '#ef4444' : '#1e293b' }}>
                      {product.currentStock}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>SELLING PRICE</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#6366f1' }}>₹{product.price}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>BUYING (COST)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>₹{product.costPrice || 0}</div>
                  </div>
                </div>

                {product.barcode && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '1rem' }}>
                    📑 Barcode: {product.barcode}
                  </div>
                )}

                <div className="card-actions" style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  {!isConfirming ? (
                    <>
                      <button className="action-link link-edit" onClick={() => handleEdit(product)}>✏️ Edit</button>
                      <button className="action-link link-delete" onClick={() => setConfirmDeleteId(pId)}>🗑️ Delete</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>Delete?</span>
                      <button className="action-link link-delete" onClick={() => executeDeleteAction(pId)}>Yes</button>
                      <button className="action-link" onClick={() => setConfirmDeleteId(null)}>No</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
