import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  HeartPulse, ShieldAlert, MapPin, Building2, 
  Mail, Lock, Shield, ArrowRight, CheckCircle2, 
  UserCheck, Sparkles
} from 'lucide-react';
import RoleSelector from './RoleSelector';
import FloatingInput from './FloatingInput';
import { Button } from '~/components/ui';

interface LoginState {
  mode: 'select' | 'form';
  selectedRole: string | null;
  credentials: {
    email: string;
    password: string;
  };
  errors: {
    email?: string;
    password?: string;
  };
  isLoading: boolean;
}

const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const [loginState, setLoginState] = useState<LoginState>({
    mode: 'select',
    selectedRole: null,
    credentials: { email: '', password: '' },
    errors: {},
    isLoading: false
  });

  const roles = [
    {
      id: 'super_admin',
      title: 'Super Admin',
      subtitle: 'Global system management',
      icon: ShieldAlert,
      variant: 'primary' as const,
      badge: 'Full Access'
    },
    {
      id: 'country_admin',
      title: 'Country Admin',
      subtitle: 'Regional oversight (BA)',
      icon: MapPin,
      variant: 'outline' as const
    },
    {
      id: 'company_admin',
      title: 'Company Admin',
      subtitle: 'Organization management',
      icon: Building2,
      variant: 'default' as const
    }
  ];

  const getRoleDetails = (role: string) => {
    const roleConfig = {
      super_admin: {
        title: 'Global Super Admin',
        subtitle: 'Complete system control',
        description: 'Manage all regions, countries, and companies globally',
        permissions: ['Global Analytics', 'User Management', 'System Settings', 'Security Controls'],
        icon: ShieldAlert,
        color: 'from-[#1B173A] to-[#2D2D2D]'
      },
      country_admin: {
        title: 'Country Administrator',
        subtitle: 'Regional management access',
        description: 'Manage companies and users within your assigned region',
        permissions: ['Regional Analytics', 'Company Management', 'User Oversight', 'Local Reports'],
        icon: MapPin,
        color: 'from-[#5850DE] to-[#248FEC]'
      },
      company_admin: {
        title: 'Company Administrator',
        subtitle: 'Organization-level access',
        description: 'Manage your company\'s users and wellness programs',
        permissions: ['Company Analytics', 'Employee Management', 'Wellness Programs', 'Performance Reports'],
        icon: Building2,
        color: 'from-[#248FEC] to-[#4DAB46]'
      }
    };
    return roleConfig[role as keyof typeof roleConfig];
  };

  const handleRoleSelect = (roleId: string) => {
    setLoginState(prev => ({
      ...prev,
      selectedRole: roleId,
      mode: 'form'
    }));
  };

  const handleCredentialChange = (field: 'email' | 'password', value: string) => {
    setLoginState(prev => ({
      ...prev,
      credentials: { ...prev.credentials, [field]: value },
      errors: { ...prev.errors, [field]: undefined }
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoginState(prev => ({ ...prev, errors: {}, isLoading: true }));

    // Basic validation
    const newErrors: { email?: string; password?: string } = {};
    if (!loginState.credentials.email) newErrors.email = 'Email is required';
    if (!loginState.credentials.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setLoginState(prev => ({ ...prev, errors: newErrors, isLoading: false }));
      return;
    }

    // Simulate API call
    setTimeout(() => {
      navigate(`/?role=${loginState.selectedRole}`);
    }, 1500);
  };

  const handleBackToRoles = () => {
    setLoginState(prev => ({
      ...prev,
      mode: 'select',
      selectedRole: null,
      credentials: { email: '', password: '' },
      errors: {},
      isLoading: false
    }));
  };

  if (loginState.mode === 'form' && loginState.selectedRole) {
    const roleDetails = getRoleDetails(loginState.selectedRole);
    const Icon = roleDetails.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] via-white to-[#F0F4FF] flex items-center justify-center p-4 font-sans selection:bg-[#5850DE] selection:text-white">
        <div className="max-w-md w-full">
          
          {/* Back Button */}
          <button 
            onClick={handleBackToRoles}
            className="flex items-center text-[#5850DE] font-bold hover:bg-white/50 px-3 py-2 rounded-xl transition w-fit gap-2 mb-6 backdrop-blur-sm"
          >
            ← Back to Role Selection
          </button>

          {/* Login Form Card */}
          <div className="bg-white rounded-[32px] shadow-2xl border border-white relative overflow-hidden backdrop-blur-sm">
            
            {/* Header with Role Badge */}
            <div className={`p-8 bg-gradient-to-r ${roleDetails.color} text-white relative`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Icon size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold">{roleDetails.title}</h1>
                  <p className="text-white/80 font-medium text-sm mt-1">{roleDetails.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-[#1B173A] mb-2">Secure Access Portal</h2>
                <p className="text-[#8E8E93] text-sm font-medium">{roleDetails.description}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <FloatingInput 
                  label="Email Address" 
                  type="email" 
                  placeholder="admin@ealthiness.com"
                  value={loginState.credentials.email}
                  onChange={(e) => handleCredentialChange('email', e.target.value)}
                  error={loginState.errors.email}
                  icon={Mail}
                />
                
                <FloatingInput 
                  label="Password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={loginState.credentials.password}
                  onChange={(e) => handleCredentialChange('password', e.target.value)}
                  error={loginState.errors.password}
                  icon={Lock}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#60646C] font-medium cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#5850DE] border-[#E0E1E6] rounded focus:ring-[#5850DE]" />
                    Remember me
                  </label>
                  <button type="button" className="text-[#5850DE] font-bold hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  disabled={loginState.isLoading}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
                    loginState.isLoading 
                      ? 'bg-[#8E8E93] cursor-not-allowed' 
                      : `bg-gradient-to-r ${roleDetails.color} hover:shadow-xl transform hover:-translate-y-1`
                  }`}
                >
                  {loginState.isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Secure Login
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>

              {/* Permissions Preview */}
              <div className="mt-8 p-6 bg-[#F8F9FB] rounded-2xl border border-[#E0E1E6]">
                <h4 className="font-bold text-[#1B173A] mb-3 text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-[#4DAB46]" />
                  Access Permissions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {roleDetails.permissions.map((permission, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#60646C]">
                      <CheckCircle2 size={12} className="text-[#4DAB46]" />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#8E8E93] font-medium flex items-center justify-center gap-2">
              <Shield size={12} className="text-[#4DAB46]" />
              Your connection is secured with end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] via-white to-[#F0F4FF] flex items-center justify-center p-4 font-sans selection:bg-[#5850DE] selection:text-white relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#5850DE]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#248FEC]/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-lg w-full relative z-10">
        
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#5850DE] to-[#248FEC] rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <HeartPulse size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-[#1B173A] mb-3">Ealthiness Admin</h1>
          <p className="text-[#8E8E93] font-medium">Choose your administrative role to continue</p>
        </div>

        {/* Role Selection Cards */}
        <RoleSelector roles={roles} onRoleSelect={handleRoleSelect} />

        {/* Features Preview */}
        <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#5850DE]" />
            <h3 className="font-bold text-[#1B173A] text-sm uppercase tracking-wider">Platform Features</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-[#E8E6FC] rounded-xl flex items-center justify-center">
                <Shield size={16} className="text-[#5850DE]" />
              </div>
              <span className="text-xs font-bold text-[#60646C]">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-[#E5F6E4] rounded-xl flex items-center justify-center">
                <CheckCircle2 size={16} className="text-[#4DAB46]" />
              </div>
              <span className="text-xs font-bold text-[#60646C]">Reliable</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-[#FFF4E5] rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-[#FFB900]" />
              </div>
              <span className="text-xs font-bold text-[#60646C]">AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-[#8E8E93] font-medium">
            © 2025 Ealthiness Platform • Secure Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginContainer;