import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/categories/${editId}`, formData);
      } else {
        await api.post('/categories/create', formData);
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    const targetId = cat._id || cat.id;
    setEditId(targetId);
    setFormData({ name: cat.name, description: cat.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteAction = async (id) => {
    try {
      await api.post(`/categories/delete/${id}`);
      setConfirmDeleteId(null);
      fetchCategories();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="categories-page">
      <div className="top-section">
        <div className="page-title-wrap">
          <div className="title-icon-box">
            <span style={{ fontSize: '24px' }}>📂</span>
          </div>
          <h1 className="page-headline">{isEditing ? 'Edit Category' : 'Categories'}</h1>
        </div>
        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search categories..." />
        </div>
      </div>

      <div className="creation-card">
        <form className="creation-grid" onSubmit={handleSubmit}>
          <div className="input-wrapper" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">{isEditing ? 'Category Name' : 'Name your new category'}</label>
            <input 
              className="jex-input" placeholder="e.g. Electronics, Medicine" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="input-wrapper" style={{ gridColumn: 'span 1', display: 'flex', gap: '0.5rem' }}>
            {isEditing && (
              <button type="button" className="jex-btn btn-ghost" onClick={resetForm} style={{ flex: 1 }}>
                Cancel
              </button>
            )}
            <button type="submit" className="jex-btn btn-primary" style={{ flex: 2 }}>
              {isEditing ? 'Update' : 'Create +'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="creation-card">Loading categories...</div>
      ) : (
        <div className="cards-grid">
          {categories.map((cat) => {
            const cId = cat._id || cat.id;
            const isConfirming = confirmDeleteId === cId;
            return (
              <div key={cId} className="entity-card">
                <div className="card-top">
                  <div className="card-main-info">
                    <h3 className="card-title">{cat.name}</h3>
                    <span className="status-badge">CATEGORY</span>
                  </div>
                  <div className="card-initial-box">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="card-actions">
                  {!isConfirming ? (
                    <>
                      <button type="button" className="action-link link-edit" onClick={() => handleEdit(cat)}>✏️ Edit</button>
                      <button type="button" className="action-link link-delete" onClick={() => setConfirmDeleteId(cId)}>🗑️ Del</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ef4444' }}>DEL?</span>
                      <button type="button" className="action-link link-delete" style={{ background: '#fff1f2' }} onClick={() => executeDeleteAction(cId)}>YES</button>
                      <button type="button" className="action-link" onClick={() => setConfirmDeleteId(null)}>NO</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {categories.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--jex-text-light)' }}>No categories found.</p>}
        </div>
      )}
    </div>
  );
}
