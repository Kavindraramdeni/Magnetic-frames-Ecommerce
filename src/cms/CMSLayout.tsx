import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Image as ImageIcon, Settings, Tag, LogOut, Menu, X } from 'lucide-react';
import Dashboard from './Dashboard';
import Orders from './Orders';
import Products from './Products';
import Banners from './Banners';
import SettingsPage from './Settings';
import Coupons from './Coupons';

interface CMSLayoutProps {
  onBackToHome: () => void;
}

export default function CMSLayout({ onBackToHome }: CMSLayoutProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'banners' | 'settings' | 'coupons'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'coupons', label: 'Coupons & Reviews', icon: Tag },
    { id: 'settings', label: 'Settings & Warehouses', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <Orders />;
      case 'products': return <Products />;
      case 'banners': return <Banners />;
      case 'coupons': return <Coupons />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1A1F36] font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-[#E3E8EE] px-4 py-3">
        <span className="font-bold text-lg tracking-tight">CMS Admin</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E3E8EE] transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-[#E3E8EE]">
          <h1 className="text-xl font-bold tracking-tight text-[#111827]">KRIA Admin</h1>
          <p className="text-xs text-[#6B7280] mt-1">Professional CMS</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                ${activeTab === item.id 
                  ? 'bg-[#F3F4F6] text-[#111827]' 
                  : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]'
                }
              `}
            >
              <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${activeTab === item.id ? 'text-[#111827]' : 'text-[#6B7280]'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E3E8EE]">
          <button
            onClick={onBackToHome}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-[#4B5563] rounded-md hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-[#6B7280]" />
            Exit to Storefront
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F9FC]">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
