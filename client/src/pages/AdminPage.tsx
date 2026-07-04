// ============================================================
// ADMIN PAGE — Product management dashboard
// Admin-only: create, edit, update stock, discontinue products
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, type Product } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/appConstants';
import './AdminPage.css';

interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  status: 'ACTIVE' | 'DISCONTINUED';
}

const defaultForm: ProductFormData = {
  name: '',
  price: 0,
  stock: 0,
  description: '',
  imageUrl: '',
  status: 'ACTIVE',
};

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Inline stock update
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

  // Redirect non-admin users
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProductsAdmin();
      setProducts(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      status: product.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, form);
      } else {
        await productService.createProduct(form);
      }
      setShowModal(false);
      await fetchProducts();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!window.confirm(`Discontinue "${productName}"? This will prevent it from being purchased.`)) return;
    try {
      await productService.deleteProduct(productId);
      await fetchProducts();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Delete failed');
    }
  };

  const handleStockUpdate = async (productId: string) => {
    const newStock = parseInt(stockEdits[productId] ?? '');
    if (isNaN(newStock) || newStock < 0) return;
    try {
      await productService.updateStock(productId, newStock);
      setStockEdits((prev) => { const n = { ...prev }; delete n[productId]; return n; });
      await fetchProducts();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Stock update failed');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="admin-page__title">🛠 Admin Panel</h1>
          <button className="admin-page__add-btn" onClick={openCreateModal} id="add-product-btn">
            + Add Product
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading products…</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Update Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} id={`admin-product-${product._id}`}>
                    <td>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="admin-table__image" />
                      ) : (
                        <div className="admin-table__image-placeholder">🛍️</div>
                      )}
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td>₹{product.price.toLocaleString('en-IN')}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${product.status.toLowerCase()}`}>
                        {product.status === 'ACTIVE' ? '✓ Active' : '✗ Discontinued'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__stock-form">
                        <input
                          type="number"
                          className="admin-table__stock-input"
                          min="0"
                          placeholder={String(product.stock)}
                          value={stockEdits[product._id] ?? ''}
                          onChange={(e) =>
                            setStockEdits((prev) => ({ ...prev, [product._id]: e.target.value }))
                          }
                          id={`stock-input-${product._id}`}
                        />
                        <button
                          className="admin-table__stock-btn"
                          onClick={() => handleStockUpdate(product._id)}
                          disabled={!stockEdits[product._id]}
                          id={`stock-update-${product._id}`}
                        >
                          Set
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="admin-table__action-btn admin-table__action-btn--edit"
                          onClick={() => openEditModal(product)}
                          id={`edit-product-${product._id}`}
                        >
                          ✏ Edit
                        </button>
                        {product.status === 'ACTIVE' && (
                          <button
                            className="admin-table__action-btn admin-table__action-btn--delete"
                            onClick={() => handleDelete(product._id, product.name)}
                            id={`delete-product-${product._id}`}
                          >
                            🗑 Discontinue
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Create/Edit Modal ---- */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal__title">
              {editingProduct ? '✏ Edit Product' : '+ New Product'}
            </h2>
            <div className="admin-modal__form">
              <div className="admin-modal__field">
                <label className="admin-modal__label">Product Name *</label>
                <input
                  className="admin-modal__input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. MacBook Pro 14"
                  id="modal-product-name"
                />
              </div>
              <div className="admin-modal__field">
                <label className="admin-modal__label">Price (₹) *</label>
                <input
                  type="number"
                  className="admin-modal__input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  min="0"
                  id="modal-product-price"
                />
              </div>
              <div className="admin-modal__field">
                <label className="admin-modal__label">Stock Quantity *</label>
                <input
                  type="number"
                  className="admin-modal__input"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  min="0"
                  id="modal-product-stock"
                />
              </div>
              <div className="admin-modal__field">
                <label className="admin-modal__label">Description</label>
                <textarea
                  className="admin-modal__textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description…"
                  id="modal-product-description"
                />
              </div>
              <div className="admin-modal__field">
                <label className="admin-modal__label">Image URL</label>
                <input
                  className="admin-modal__input"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  id="modal-product-image"
                />
              </div>
              {editingProduct && (
                <div className="admin-modal__field">
                  <label className="admin-modal__label">Status</label>
                  <select
                    className="admin-modal__select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    id="modal-product-status"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>
              )}
              <div className="admin-modal__actions">
                <button
                  className="admin-modal__cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="admin-modal__submit-btn"
                  onClick={handleSave}
                  disabled={saving || !form.name}
                  id="modal-save-btn"
                >
                  {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
