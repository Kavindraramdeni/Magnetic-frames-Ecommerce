import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Eye, Download, Printer, X, Image as ImageIcon, 
  CheckCircle, Package, Truck, ExternalLink, Archive, FileText, Clock, AlertTriangle, Send
} from 'lucide-react';
import JSZip from 'jszip';

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
  subtotal?: number;
  bulkDiscount?: number;
  deliveryCharge?: number;
  trackingNumber?: string;
  courierName?: string;
  shipmentId?: string | number;
  shiprocketOrderId?: string | number;
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
  const [isZipping, setIsZipping] = useState(false);
  const [shipActionLoading, setShipActionLoading] = useState<string | null>(null);
  const [shipActionNotice, setShipActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [parcelWeight, setParcelWeight] = useState<number>(0.3);
  const [parcelLength, setParcelLength] = useState<number>(15);
  const [parcelBreadth, setParcelBreadth] = useState<number>(15);
  const [parcelHeight, setParcelHeight] = useState<number>(5);

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

  const handleDownloadAdjusted = async (orderId: string, itemIndex: number, filename: string, fallbackUrl: string) => {
    try {
      setDownloadingKey(filename);
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/orders/${orderId}/items/${itemIndex}/adjusted-image`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Fallback to client-side download if server adjustment fails
        await handleDownload(fallbackUrl, filename);
      }
    } catch (err: any) {
      console.warn('Falling back to direct download:', err);
      await handleDownload(fallbackUrl, filename);
    } finally {
      setDownloadingKey(null);
    }
  };

  // Download all original customer images for this order as a single ZIP file
  const handleDownloadAllOriginalZip = async (order: Order) => {
    if (!order.cart || order.cart.length === 0) return;
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const folder = zip.folder(`${order.id}-original-photos`);

      for (let i = 0; i < order.cart.length; i++) {
        const item = order.cart[i];
        let targetUrl = item.previewUrl;
        if (item.objectKey) {
          const signed = await getSignedUrl(item.objectKey);
          if (signed) targetUrl = signed;
        }

        const res = await fetch(targetUrl);
        const blob = await res.blob();
        const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png';
        const filename = `Frame-${String(i + 1).padStart(2, '0')}-${item.shapeId || 'photo'}.${ext}`;
        folder?.file(filename, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.id}-all-original-photos.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to generate ZIP: ' + err.message);
    } finally {
      setIsZipping(false);
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

  // Step 1: Create Real Shiprocket Shipment
  const handleCreateShipment = async (order: Order) => {
    try {
      setShipActionLoading('create');
      setShipActionNotice(null);
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/orders/${order.id}/sync-shiprocket`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          weight: Number(parcelWeight),
          length: Number(parcelLength),
          breadth: Number(parcelBreadth),
          height: Number(parcelHeight)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Shiprocket shipment.');

      const awbText = data.order?.trackingNumber ? `AWB: ${data.order.trackingNumber}` : 'AWB assignment in progress';
      const courierText = data.order?.courierName ? `(${data.order.courierName})` : '';

      setShipActionNotice({
        type: 'success',
        message: `Shipment created successfully! Shipment ID: #${data.order?.shipmentId}. ${awbText} ${courierText}`
      });
      setSelectedOrder(data.order);
      fetchOrders();
    } catch (err: any) {
      setShipActionNotice({ type: 'error', message: err.message });
    } finally {
      setShipActionLoading(null);
    }
  };

  // Step 2: Print Official Shipping Label
  const handlePrintLabel = async (order: Order) => {
    try {
      setShipActionLoading('label');
      setShipActionNotice(null);
      const token = localStorage.getItem('adminToken') || '';
      const shipmentId = order.shipmentId || order.shiprocketOrderId;
      if (!shipmentId) throw new Error('Shipment must be created before generating a label.');

      const res = await fetch('/api/shiprocket/courier/label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shipment_id: [Number(shipmentId)] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate shipping label.');

      const labelUrl = data.label_url || data.response?.label_url;
      if (labelUrl) {
        window.open(labelUrl, '_blank');
        setShipActionNotice({ type: 'success', message: 'Shipping label opened in new window.' });
      } else {
        throw new Error('No label URL returned by Shiprocket.');
      }
    } catch (err: any) {
      setShipActionNotice({ type: 'error', message: err.message });
    } finally {
      setShipActionLoading(null);
    }
  };

  // Step 3: Request Courier Pickup
  const handleRequestPickup = async (order: Order) => {
    try {
      setShipActionLoading('pickup');
      setShipActionNotice(null);
      const token = localStorage.getItem('adminToken') || '';
      const shipmentId = order.shipmentId || order.shiprocketOrderId;
      if (!shipmentId) throw new Error('Shipment must be created before requesting pickup.');

      const res = await fetch('/api/shiprocket/courier/generate/pickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shipment_id: [Number(shipmentId)] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Pickup request declined by Shiprocket.');

      setShipActionNotice({
        type: 'success',
        message: 'Courier pickup scheduled with Shiprocket! Leave parcel ready for collection.'
      });
      fetchOrders();
    } catch (err: any) {
      setShipActionNotice({ type: 'error', message: err.message });
    } finally {
      setShipActionLoading(null);
    }
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
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Orders & Shipping Hub</h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Verify customer parcel dimensions, download original photos as ZIP, and execute 3-step Shiprocket fulfillment.
          </p>
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
                <th className="px-6 py-4">Tracking (AWB)</th>
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
                  <td className="px-6 py-4 font-mono text-xs">
                    {order.trackingNumber ? (
                      <div className="text-emerald-700 font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {order.trackingNumber}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not Shipped</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShipActionNotice(null);
                        const frameCount = order.cart?.length || 1;
                        setParcelWeight(Math.max(0.2, Number((0.15 * frameCount).toFixed(2))));
                        setParcelLength(15);
                        setParcelBreadth(15);
                        setParcelHeight(Math.max(5, frameCount * 2));
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Manage Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Order Production & Shipping Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E3E8EE] flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Order {selectedOrder.id}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Ordered on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'Recent'} • Status: {selectedOrder.status}
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
              
              {/* SECTION 1: Customer Details & Parcel Specifications */}
              <div className="bg-[#FAF8F5] border border-neutral-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-700" />
                    Customer Delivery & Parcel Dimensions
                  </h4>
                  <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-md border border-neutral-300 font-semibold text-neutral-700">
                    Grand Total: ₹{selectedOrder.grandTotal}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200">
                    <div className="font-bold text-neutral-900 text-sm">{selectedOrder.shippingDetails?.fullName}</div>
                    <div className="text-neutral-600 flex items-center gap-1 font-mono">{selectedOrder.shippingDetails?.phone}</div>
                    <div className="text-neutral-600">{selectedOrder.shippingDetails?.email}</div>
                    <div className="text-neutral-800 pt-1 leading-relaxed border-t border-neutral-100 mt-1">
                      {selectedOrder.shippingDetails?.address}, {selectedOrder.shippingDetails?.city}, {selectedOrder.shippingDetails?.state} - <span className="font-bold font-mono">{selectedOrder.shippingDetails?.pincode}</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <div className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">Parcel Shipping Specifications</div>
                      <span className="text-[10px] text-neutral-500 font-mono">Editable</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Weight (kg):</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          value={parcelWeight}
                          onChange={(e) => setParcelWeight(parseFloat(e.target.value) || 0.2)}
                          className="w-full px-2 py-1 border border-neutral-300 rounded font-mono text-xs focus:ring-1 focus:ring-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Box L × B × H (cm):</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={parcelLength}
                            onChange={(e) => setParcelLength(parseInt(e.target.value, 10) || 15)}
                            className="w-1/3 px-1.5 py-1 border border-neutral-300 rounded font-mono text-xs text-center"
                            title="Length"
                          />
                          <span className="text-neutral-400">×</span>
                          <input
                            type="number"
                            min="1"
                            value={parcelBreadth}
                            onChange={(e) => setParcelBreadth(parseInt(e.target.value, 10) || 15)}
                            className="w-1/3 px-1.5 py-1 border border-neutral-300 rounded font-mono text-xs text-center"
                            title="Breadth"
                          />
                          <span className="text-neutral-400">×</span>
                          <input
                            type="number"
                            min="1"
                            value={parcelHeight}
                            onChange={(e) => setParcelHeight(parseInt(e.target.value, 10) || 5)}
                            className="w-1/3 px-1.5 py-1 border border-neutral-300 rounded font-mono text-xs text-center"
                            title="Height"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500">Courier Partner:</div>
                        <span className="font-bold font-mono text-emerald-800">{selectedOrder.courierName || 'Delhivery / Air'}</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500">AWB Tracking:</div>
                        <span className="font-bold font-mono text-emerald-800">{selectedOrder.trackingNumber || 'Pending'}</span>
                      </div>
                    </div>

                    {/* Shiprocket 3-Step Operations Bar */}
                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCreateShipment(selectedOrder)}
                        disabled={shipActionLoading !== null}
                        className="flex-1 py-2 px-3 bg-[#111827] hover:bg-black text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                      >
                        <Package className="w-3.5 h-3.5" />
                        {shipActionLoading === 'create' ? 'Creating...' : '1. Create Shipment'}
                      </button>

                      <button
                        onClick={() => handlePrintLabel(selectedOrder)}
                        disabled={shipActionLoading !== null || !selectedOrder.shipmentId}
                        className="py-2 px-3 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                        title={!selectedOrder.shipmentId ? 'Create shipment first' : 'Print shipping label'}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        {shipActionLoading === 'label' ? 'Loading...' : '2. Print Shipping Label'}
                      </button>

                      <button
                        onClick={() => handleRequestPickup(selectedOrder)}
                        disabled={shipActionLoading !== null || !selectedOrder.shipmentId}
                        className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-50"
                        title={!selectedOrder.shipmentId ? 'Create shipment first' : 'Request courier pickup'}
                      >
                        <Send className="w-3.5 h-3.5" />
                        {shipActionLoading === 'pickup' ? 'Requesting...' : '3. Request Pickup'}
                      </button>
                    </div>
                  </div>
                </div>

                {shipActionNotice && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    shipActionNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {shipActionNotice.message}
                  </div>
                )}
              </div>

              {/* SECTION 2: Frame Production Files & Download All Original ZIP */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-neutral-900">Frame Production Files</h4>
                    <p className="text-xs text-neutral-500">Compare original raw photo with buyer's zoom/pan position. Zero shape outlines applied.</p>
                  </div>

                  {/* Download All Original Images as ZIP button */}
                  <button
                    onClick={() => handleDownloadAllOriginalZip(selectedOrder)}
                    disabled={isZipping}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition w-fit disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    {isZipping ? 'Archiving ZIP...' : 'Download All Original Images (ZIP)'}
                  </button>
                </div>

                {/* Individual Frames */}
                {(selectedOrder.cart || []).map((item, idx) => {
                  const origFilename = `${selectedOrder.id}-frame${String(idx + 1).padStart(2, '0')}-original.png`;
                  const adjFilename = `${selectedOrder.id}-frame${String(idx + 1).padStart(2, '0')}-adjusted-${item.shapeId}.png`;

                  return (
                    <div key={item.id || idx} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div>
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Frame {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="ml-2 font-bold text-neutral-900 capitalize text-sm">
                            {item.shapeName || item.shapeId} Frame (Qty: {item.quantity || 1})
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 font-mono">
                          Scale: {item.cropSpec?.scale || item.photoScale || 1.0}x | Pan: ({item.cropSpec?.panX || item.photoPanX || 0}, {item.cropSpec?.panY || item.photoPanY || 0})
                        </div>
                      </div>

                      {/* Side-by-Side Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Box 1: Original Image */}
                        <div className="bg-[#FAF8F5] border border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-between space-y-3">
                          <div className="w-full text-center">
                            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                              📷 1. Original Customer Upload
                            </span>
                            <p className="text-[11px] text-neutral-500 mt-0.5">Raw uncropped photo uploaded by buyer</p>
                          </div>

                          <div className="w-full h-64 bg-white rounded-lg overflow-hidden flex items-center justify-center p-2 border border-neutral-200">
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
                        <div className="bg-[#FAF8F5] border border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-between space-y-3">
                          <div className="w-full text-center">
                            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                              ✨ 2. Adjusted / Cropped Preview
                            </span>
                            <p className="text-[11px] text-neutral-500 mt-0.5">Exactly as framed and scaled by buyer</p>
                          </div>

                          <div className="w-full h-64 bg-white rounded-lg overflow-hidden flex items-center justify-center p-2 border border-neutral-200 relative">
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
                              onClick={() => handleDownloadAdjusted(selectedOrder.id, idx, adjFilename, item.previewUrl)}
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
