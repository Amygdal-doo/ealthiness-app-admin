import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '~/components/ui';

type IconComponent = React.ComponentType<{ size?: number }>;

interface FloatingInputProps {
  label: string;
  error?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: IconComponent;
  dark?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ 
  label, 
  error, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  dark = false 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;
  
  const baseClasses = dark ? 
    "bg-[#1C1C1E] border-[#38383A] text-white focus:border-[#5850DE]" : 
    "bg-white border-[#E0E1E6] text-[#1B173A] focus:border-[#5850DE]";
  const errorClasses = error ? "border-[#EF4444] focus:border-[#EF4444]" : "";
  const labelBase = dark ? "bg-[#1C1C1E] text-[#8E8E93]" : "bg-white text-[#60646C]";
  const labelError = error ? "text-[#EF4444]" : "peer-focus:text-[#5850DE]";

  return (
    <div className="relative pt-2">
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93] z-10">
            <Icon size={18} />
          </div>
        )}
        <Input
          type={inputType} 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          className={`peer w-full ${Icon ? 'pl-11' : 'pl-4'} pr-12 py-3 rounded-xl border-2 outline-none transition-colors font-medium placeholder-transparent ${baseClasses} ${errorClasses}`} 
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93] hover:text-[#5850DE] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <label className={`absolute left-3 -top-1 px-1 text-xs font-bold transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-medium peer-focus:-top-1 peer-focus:text-xs peer-focus:font-bold ${labelBase} ${labelError} ${Icon ? 'peer-placeholder-shown:left-11 peer-focus:left-3' : ''}`}>
        {label}
      </label>
      {error && <p className="text-xs text-[#EF4444] font-semibold mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default FloatingInput;