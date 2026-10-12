import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  dimensions?: string;
  description?: string;
  shape_class?: string;
  shapeClass?: string;
  shape?: string;
  frame_ratio?: string;
  tagline?: string;
  is_trending?: number;
  stock?: number | string;
  image_url?: string;
}

export default function Products() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialForm = {
    id: '',
    name: '',
    price: '',
    originalPrice: '',
    dimensions: '3 × 4 in',
    shapeClass: 'Rectangle',
    stock: '500',
    tagline: '',
    description: '',
    image_url: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.products || []);
        setProducts(items);
      }
    } catch (err) {
      console.error('fetchProducts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (product: ProductItem) => {
    setEditingId(product.id);
    setFormData({
      id: product.id,
      name: product.name || '',
      price: String(product.price || ''),
      originalPrice: String(product.originalPrice || product.original_price || ''),
      dimensions: product.dimensions || '3 × 4 in',
      shapeClass: product.shapeClass || product.shape_class || product.shape || 'Rectangle',
      stock: String(product.stock !== undefined ? product.stock : '500'),
      tagline: product.tagline || '',
      description: product.description || '',
      image_url: product.image_url || ''
    });
    setFormError(null);
    setFormSuccess(null);
    setAdding(true);
  };

  const handleCancel = () => {
    setAdding(false);
    setEditingId(null);
    setFormData(initialForm);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFormError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/admin/uploads/public', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ dataUrl, fileName: file.name })
        });
        if (res.ok) {
          const { url } = await res.json();
          setFormData(prev => ({ ...prev, image_url: url }));
        } else {
          setFormError('Failed to upload image. Please try again.');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setFormError('Image upload error occurred.');
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Price must be a valid positive number.');
      return;
    }

    try {
      const payload = {
        id: formData.id.trim() || undefined,
        name: formData.name.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        dimensions: formData.dimensions.trim(),
        shapeClass: formData.shapeClass,
        stock: Number(formData.stock) || 500,
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok) {
        setFormSuccess(editingId ? 'Product updated successfully.' : 'Product created successfully.');
        setTimeout(() => {
          handleCancel();
          fetchProducts();
        }, 800);
      } else {
        setFormError(resData.error || 'Failed to save product.');
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Server connection error.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete product "${id}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      alert('Delete request failed.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Products Catalog</h2>
          <p className="text-xs text-neutral-500 mt-1">Live synchronized catalog: prices set here directly govern checkout charges.</p>
        </div>
        <button 
          onClick={() => {
            if (adding) handleCancel();
            else {
              setFormData(initialForm);
              setEditingId(null);
              setAdding(true);
            }
          }} 
          className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {adding ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleSaveProduct} className="bg-white p-6 border border-[#E3E8EE] rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-semibold text-[#111827]">
              {editingId ? `Edit Product: ${formData.name || editingId}` : 'New Catalog Product'}
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              {editingId ? `ID: ${editingId}` : 'ID auto-generated if left blank'}
            </span>
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Product ID / Slug</label>
              <input 
                type="text" 
                value={formData.id} 
                disabled={!!editingId}
                placeholder="e.g. love, polaroid (or leave blank)" 
                onChange={e => setFormData({ ...formData, id: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm bg-neutral-50 disabled:opacity-60" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Product Name *</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                placeholder="e.g. Sculpted Heart" 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Price (₹) *</label>
              <input 
                required 
                type="number" 
                min="0"
                value={formData.price} 
                placeholder="299" 
                onChange={e => setFormData({ ...formData, price: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm font-mono" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Original / Strikethrough Price (₹)</label>
              <input 
                type="number" 
                min="0"
                value={formData.originalPrice} 
                placeholder="429" 
                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm font-mono" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Physical Dimensions</label>
              <input 
                type="text" 
                value={formData.dimensions} 
                placeholder="3 × 4 in" 
                onChange={e => setFormData({ ...formData, dimensions: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Shape Silhouette</label>
              <select 
                value={formData.shapeClass} 
                onChange={e => setFormData({ ...formData, shapeClass: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm bg-white"
              >
                <option value="Rectangle">Rectangle / Polaroid</option>
                <option value="Square">Square</option>
                <option value="Arch">Arch</option>
                <option value="Heart">Heart</option>
                <option value="Circle">Circle</option>
                <option value="Hexagon">Hexagon</option>
                <option value="Oval">Oval</option>
                <option value="Filmstrip">Vintage Filmstrip</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Inventory Units in Stock</label>
              <input 
                type="number" 
                min="0"
                value={formData.stock} 
                placeholder="500" 
                onChange={e => setFormData({ ...formData, stock: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm font-mono" 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Short Tagline</label>
              <input 
                type="text" 
                value={formData.tagline} 
                placeholder="e.g. Romantic sculpted silhouette keepsake." 
                onChange={e => setFormData({ ...formData, tagline: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm" 
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Description</label>
              <textarea 
                rows={2}
                value={formData.description} 
                placeholder="Product description for storefront..." 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm" 
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-[#4B5563] mb-1">Product Reference Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm bg-white" />
              {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 h-20 object-contain rounded border" />}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="submit" 
              disabled={uploading} 
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {editingId ? 'Update Product' : 'Save Product'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E3E8EE] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products by name or ID..." 
              className="pl-9 pr-4 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E3E8EE] text-[#4B5563]">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Shape / Class</th>
                <th className="px-6 py-4 font-medium">Dimensions</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#6B7280]">Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#6B7280]">No products found.</td></tr>
              ) : (
                filteredProducts.map(product => {
                  const stockNum = typeof product.stock === 'number' ? product.stock : parseInt(String(product.stock)) || 0;
                  const inStock = stockNum > 0;
                  return (
                    <tr key={product.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#F3F4F6] border border-[#E3E8EE] flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-[#111827] block">{product.name}</span>
                            <span className="text-xs text-neutral-400 font-mono">id: {product.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#4B5563]">{product.shapeClass || product.shape_class || product.shape || 'Standard'}</td>
                      <td className="px-6 py-4 text-[#4B5563]">{product.dimensions || '3 × 4 in'}</td>
                      <td className="px-6 py-4 font-medium text-[#111827]">
                        ₹{product.price}
                        {(product.originalPrice || product.original_price) && (
                          <span className="text-xs text-neutral-400 line-through ml-1.5 font-normal">
                            ₹{product.originalPrice || product.original_price}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${inStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {inStock ? `${stockNum} in stock` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleStartEdit(product)}
                            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
