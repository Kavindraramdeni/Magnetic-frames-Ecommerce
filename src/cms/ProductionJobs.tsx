import React, { useState, useEffect } from 'react';
import { Box, RefreshCw, CheckCircle2, Clock, AlertTriangle, Search, Filter, ExternalLink, Printer } from 'lucide-react';

interface ProductionJob {
  id: string;
  order_id: string;
  item_index: number;
  shape_id: string;
  quantity: number;
  photo_object_key: string;
  photo_bucket: string;
  crop_scale: number;
  crop_pan_x: number;
  crop_pan_y: number;
  status: 'QUEUED' | 'PRINTING' | 'LASER_CUT' | 'QUALITY_CHECK' | 'PACKED';
  created_at: string;
}

export default function ProductionJobs() {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/production-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load factory production jobs.');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Error loading production jobs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.shape_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Queued</span>;
      case 'PRINTING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">UV Printing</span>;
      case 'LASER_CUT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Laser Cut</span>;
      case 'QUALITY_CHECK':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">QC Review</span>;
      case 'PACKED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Packed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Factory Production Jobs</h2>
          <p className="text-sm text-[#6B7280] mt-1">Real-time status tracking for UV print beds, laser cutting, and packaging.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchJobs}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E3E8EE] text-[#4B5563] text-sm font-medium rounded-lg hover:bg-[#F9FAFB] shadow-xs cursor-pointer transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID or Shape..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4B5563]">
            <thead className="bg-[#F9FAFB] border-b border-[#E3E8EE] text-xs uppercase font-semibold text-[#6B7280]">
              <tr>
                <th className="px-6 py-3.5">Order & Item</th>
                <th className="px-6 py-3.5">Shape & Qty</th>
                <th className="px-6 py-3.5">Crop Coordinates</th>
                <th className="px-6 py-3.5">Factory Stage</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Production Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading factory production jobs...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Box className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    No active production jobs in queue.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-[#111827]">{job.order_id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Item #{job.item_index + 1}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold capitalize text-[#111827]">{job.shape_id} Magnet</div>
                      <div className="text-xs text-gray-500">{job.quantity} pcs</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600">
                      Scale: {job.crop_scale}x | Pan: ({job.crop_pan_x}, {job.crop_pan_y})
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={job.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const res = await fetch(`/api/admin/production-jobs/${job.id}/status`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                              },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (!res.ok) {
                              const errData = await res.json();
                              throw new Error(errData.error || 'Failed to update status');
                            }
                            fetchJobs();
                          } catch (err: any) {
                            alert('Stage update error: ' + err.message);
                          }
                        }}
                        className="text-xs font-semibold px-2 py-1 rounded-md border border-neutral-300 bg-white cursor-pointer"
                      >
                        <option value="QUEUED">Queued</option>
                        <option value="PRINTING">UV Printing</option>
                        <option value="LASER_CUT">Laser Cut</option>
                        <option value="QUALITY_CHECK">QC Review</option>
                        <option value="PACKED">Packed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!job.photo_object_key ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing Asset
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/photos/signed-url', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                                },
                                body: JSON.stringify({ 
                                  objectKey: job.photo_object_key, 
                                  bucket: job.photo_bucket || 'customer-photos',
                                  orderId: job.order_id 
                                })
                              });
                              const data = await res.json();
                              if (data.signedUrl) {
                                window.open(data.signedUrl, '_blank');
                              } else {
                                alert('Could not generate signed download URL: ' + (data.error || 'Unknown error'));
                              }
                            } catch (e: any) {
                              alert('Export failed: ' + e.message);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Asset
                        </button>
                      )}
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
