import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        // 1. Upload public banner image via admin endpoint
        const uploadRes = await fetch('/api/admin/uploads/public', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ dataUrl, fileName: file.name })
        });
        
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          
          // 2. Save banner to database
          const res = await fetch('/api/admin/banners', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: `banner_${Date.now()}`,
              url: url,
              title: file.name,
              status: 'Active',
              created_at: new Date().toISOString()
            })
          });
          
          if (res.ok) {
            fetchBanners();
          } else {
            alert('Failed to save banner record');
          }
        } else {
          alert('Failed to upload banner image');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">Banner Management</h2>
      </div>

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#111827] mb-4">Hero Banner</h3>
        
        <label className="border-2 border-dashed border-[#E3E8EE] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#F9FAFB] cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E3E8EE] mb-4">
            <Upload className="w-5 h-5 text-[#6B7280]" />
          </div>
          <p className="text-sm font-medium text-[#111827]">Click to upload or drag and drop</p>
          <p className="text-xs text-[#6B7280] mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>

        <div className="mt-6 space-y-4">
          {loading ? (
             <div className="text-sm text-gray-500">Loading banners...</div>
          ) : banners.length === 0 ? (
             <div className="text-sm text-gray-500">No banners found.</div>
          ) : (
            banners.map((banner, idx) => (
              <div key={idx} className="p-4 border border-[#E3E8EE] rounded-lg flex items-center gap-4">
                <div className="w-24 h-12 bg-[#F3F4F6] rounded flex items-center justify-center border border-[#E3E8EE] overflow-hidden">
                  {banner.url ? (
                    <img src={banner.url} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#9CA3AF]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#111827]">{banner.title || 'Banner'}</p>
                  <p className="text-xs text-[#6B7280]">{banner.status || 'Active'}</p>
                </div>
                <button className="text-sm font-medium text-red-600 hover:underline">Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
