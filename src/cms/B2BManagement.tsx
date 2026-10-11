import React, { useState, useEffect } from 'react';
import { Building2, MessageSquare, Phone, Mail, Calendar, FileText, CheckCircle, Clock, XCircle, Search, RefreshCw, Send } from 'lucide-react';

interface B2BEnquiry {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  estimated_quantity: number;
  preferred_shapes: string[];
  custom_notes: string;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'DECLINED';
  quoted_price_per_unit?: number;
  quoted_total?: number;
  created_at: string;
}

export default function B2BManagement() {
  const [enquiries, setEnquiries] = useState<B2BEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<B2BEnquiry | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/b2b/enquiries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load wholesale B2B enquiries.');
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err: any) {
      setError(err.message || 'Error loading enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.phone?.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
      case 'QUOTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><FileText className="w-3 h-3" /> Quoted</span>;
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'DECLINED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3 h-3" /> Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getWhatsAppLink = (enquiry: B2BEnquiry) => {
    const cleanPhone = enquiry.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${enquiry.contact_person} from ${enquiry.company_name}!\n\nThis is KRIA Studio factory sales team regarding your Wholesale Acrylic Magnet inquiry for ${enquiry.estimated_quantity} units.\n\nWe have reviewed your request and would love to assist you with the custom quotation and free production sample.`
    );
    return `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">B2B & Wholesale Enquiries</h2>
          <p className="text-sm text-[#6B7280] mt-1">Manage bulk corporate quotations, MOQ orders, and direct factory negotiations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchEnquiries}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E3E8EE] text-[#4B5563] text-sm font-medium rounded-lg hover:bg-[#F9FAFB] shadow-xs cursor-pointer transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, person, email or phone..."
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

      {/* Table */}
      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4B5563]">
            <thead className="bg-[#F9FAFB] border-b border-[#E3E8EE] text-xs uppercase font-semibold text-[#6B7280]">
              <tr>
                <th className="px-6 py-3.5">Company & Client</th>
                <th className="px-6 py-3.5">Quantity & Shapes</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading B2B enquiries...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    No B2B wholesale enquiries received yet.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#111827]">{enquiry.company_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span>{enquiry.contact_person}</span>
                        <span>•</span>
                        <span>{enquiry.email}</span>
                      </div>
                      <div className="text-xs font-mono text-gray-600 mt-0.5">{enquiry.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#111827]">{enquiry.estimated_quantity} units</div>
                      <div className="text-xs text-gray-500">
                        {enquiry.preferred_shapes?.length > 0 
                          ? enquiry.preferred_shapes.join(', ') 
                          : 'Custom Specifications'}
                      </div>
                      {enquiry.custom_notes && (
                        <div className="text-xs text-neutral-600 italic mt-1 line-clamp-1 max-w-xs">
                          "{enquiry.custom_notes}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={getWhatsAppLink(enquiry)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp Quote
                      </a>
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
