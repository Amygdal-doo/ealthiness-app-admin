import React from 'react';
import { Bell, RefreshCw, HeartPulse } from 'lucide-react';

interface User {
  name: string;
  email: string;
  role: string;
}

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onRefresh, 
  refreshing = false 
}) => {
  const getRoleInitials = (role: string) => {
    switch (role) {
      case 'super_admin': return 'SA';
      case 'country_admin': return 'CA';
      case 'company_admin': return 'CO';
      default: return 'AD';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Global Admin Portal';
      case 'country_admin': return 'Country Admin Portal';
      case 'company_admin': return 'Company Admin Portal';
      default: return 'Admin Portal';
    }
  };

  return (
    <nav className="bg-white border-b border-[#E0E1E6] p-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5850DE] to-[#248FEC] rounded-xl flex items-center justify-center text-white shadow-md">
            <HeartPulse size={20} />
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#1B173A] leading-tight block">
              Ealthiness
            </span>
            <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              disabled={refreshing}
              className="p-3 bg-[#F8F9FB] hover:bg-[#E0E1E6] rounded-xl transition-colors"
            >
              <RefreshCw 
                size={18} 
                className={`text-[#5850DE] ${refreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          )}
          
          <div className="relative">
            <button className="p-3 bg-[#F8F9FB] hover:bg-[#E0E1E6] rounded-xl transition-colors">
              <Bell size={18} className="text-[#1B173A]" />
            </button>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
          </div>

          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-gradient-to-r from-[#5850DE] to-[#248FEC] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            title={`${user.name} (${user.email})`}
          >
            {getRoleInitials(user.role)}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;