import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, Download, Printer, X, Image as ImageIcon, CheckCircle, Package, Truck, ExternalLink } from 'lucide-react';

interface OrderItem {
  id: string;
  shapeId: string;
  shapeName: string;
  quantity: number;
  previewUrl: string; // Adjusted / cropped photo
  photoName: string;
  objectKey?: string; // Stored customer upload
  photoScale?: number;
  photoPanX?: number;
  photoPanY?: number;
  cropSpec?: {
    scale: number;
    panX: number;
    panY: number;
    shapeId: string;
  };
  captionText?: string;
}

interface Order {
  id: string;
  status: string;
  customer?: string;
  shippingDetails?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  cart?: OrderItem[];
  grandTotal: number;
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSignedUrl = async (objectKey: string): Promise<string> => {
    if (signedUrls[objectKey]) return signedUrls[objectKey];
    try {
      const res = await fetch('/api/admin/photos/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ objectKey })
      });
      const data = await res.json();
      if (data.signedUrl) {
        setSignedUrls(prev => ({ ...prev, [objectKey]: data.signedUrl }));
        return data.signedUrl;
      }
    } catch (e) {
      console.error('Error getting signed URL:', e);
    }
    return '';
  };

  const handleDownload = async (imageUrl: string, filename: string, objectKey?: string) => {
    try {
      setDownloadingKey(filename);
      let targetUrl = imageUrl;
      if (objectKey) {
        const signed = await getSignedUrl(objectKey);
        if (signed) targetUrl = signed;
      }
      
      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Download error: ' + err.message);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handlePrint = (imageUrl: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KRIA Print</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Paid</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">Processing</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full border border-purple-200">Shipped</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-700 rounded-full border border-gray-200">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingDetails?.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Orders</h2>
          <p className="text-sm text-[#6B7280] mt-1">View customer orders, inspect Original vs Adjusted photos, and download/print.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E3E8EE] text-[#4B5563] text-sm font-medium rounded-lg hover:bg-[#F9FAFB] shadow-xs cursor-pointer transition w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
          />
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      {/* Orders Table */}
      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4B5563]">
            <thead className="bg-[#F9FAFB] border-b border-[#E3E8EE] text-xs uppercase font-semibold text-[#6B7280]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#6B7280]">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    No orders found.
                  </td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-[#111827]">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#111827]">{order.shippingDetails?.fullName || order.customer || 'Customer'}</div>
                    <div className="text-xs text-gray-500">{order.shippingDetails?.phone || ''}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#111827]">
                    {order.cart?.length || 1} frame{(order.cart?.length || 1) > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 text-[#111827] font-semibold">₹{order.grandTotal}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Frames
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frame Inspection Modal: Original vs Adjusted Photos */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E3E8EE] flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Order {selectedOrder.id} — Photo Production</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Customer: {selectedOrder.shippingDetails?.fullName} • {selectedOrder.shippingDetails?.phone} • {selectedOrder.cart?.length || 1} Photo Frame(s)
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {(selectedOrder.cart || []).map((item, idx) => {
                const origFilename = `${selectedOrder.id}-item${idx + 1}-original.png`;
                const adjFilename = `${selectedOrder.id}-item${idx + 1}-adjusted-${item.shapeId}.png`;

                return (
                  <div key={item.id || idx} className="bg-[#FAF8F5] border border-neutral-200 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                          Frame #{idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-neutral-900 capitalize">
                          {item.shapeName || item.shapeId} Frame (Qty: {item.quantity || 1})
                        </h4>
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        Scale: {item.cropSpec?.scale || item.photoScale || 1.0}x | Pan: ({item.cropSpec?.panX || item.photoPanX || 0}, {item.cropSpec?.panY || item.photoPanY || 0})
                      </div>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Box 1: Original Image */}
                      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-between space-y-3">
                        <div className="w-full text-center">
                          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                            📷 1. Original Customer Upload
                          </span>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Raw uncropped photo uploaded by buyer</p>
                        </div>

                        <div className="w-full h-64 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center p-2">
                          <img 
                            src={item.previewUrl} 
                            alt="Original Upload"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <button
                          onClick={() => handleDownload(item.previewUrl, origFilename, item.objectKey)}
                          disabled={downloadingKey === origFilename}
                          className="w-full py-2.5 px-4 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingKey === origFilename ? 'Downloading...' : 'Download Original Image'}
                        </button>
                      </div>

                      {/* Box 2: Adjusted Image */}
                      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-between space-y-3">
                        <div className="w-full text-center">
                          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                            ✨ 2. Adjusted / Cropped Preview
                          </span>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Exactly as framed and scaled by buyer</p>
                        </div>

                        <div className="w-full h-64 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
                          <img 
                            src={item.previewUrl} 
                            alt="Adjusted Preview"
                            style={{
                              transform: `scale(${item.cropSpec?.scale || item.photoScale || 1.0}) translate(${item.cropSpec?.panX || item.photoPanX || 0}%, ${item.cropSpec?.panY || item.photoPanY || 0}%)`
                            }}
                            className="max-h-full max-w-full object-contain transition-transform"
                          />
                        </div>

                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => handleDownload(item.previewUrl, adjFilename)}
                            disabled={downloadingKey === adjFilename}
                            className="flex-1 py-2.5 px-3 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloadingKey === adjFilename ? 'Downloading...' : 'Download Adjusted'}
                          </button>
                          <button
                            onClick={() => handlePrint(item.previewUrl)}
                            className="py-2.5 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                            title="Print Directly on Paper"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E3E8EE] bg-[#F9FAFB] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-white border border-[#E3E8EE] hover:bg-[#F9FAFB] text-neutral-700 text-sm font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
