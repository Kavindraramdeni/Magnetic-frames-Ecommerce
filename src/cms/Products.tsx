import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: 'In Stock', shape: 'Rectangle', image_url: '' });

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
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/uploads/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, fileName: file.name, isPublic: true })
        });
        if (res.ok) {
          const { url } = await res.json();
          setNewProduct({ ...newProduct, image_url: url });
        } else {
          alert('Failed to upload image');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...newProduct, price: Number(newProduct.price) })
      });
      if (res.ok) {
        setAdding(false);
        setNewProduct({ name: '', price: '', stock: 'In Stock', shape: 'Rectangle', image_url: '' });
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111827]">Products</h2>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" />
          {adding ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 border border-[#E3E8EE] rounded-xl shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-[#111827]">New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Name</label>
              <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Price</label>
              <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Shape</label>
              <select value={newProduct.shape} onChange={e => setNewProduct({...newProduct, shape: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm">
                <option>Rectangle</option>
                <option>Square</option>
                <option>Arch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Stock Status</label>
              <select value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm">
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm bg-white" />
              {newProduct.image_url && <img src={newProduct.image_url} alt="Preview" className="mt-2 h-24 object-contain rounded border" />}
            </div>
          </div>
          <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Save Product</button>
        </form>
      )}

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E3E8EE] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-9 pr-4 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E3E8EE] text-[#4B5563]">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Shape</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#6B7280]">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#6B7280]">No products found.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id || product._id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F3F4F6] border border-[#E3E8EE] flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                        <span className="font-medium text-[#111827]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{product.shape}</td>
                    <td className="px-6 py-4 font-medium text-[#111827]">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${product.stock === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id || product._id)} className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
