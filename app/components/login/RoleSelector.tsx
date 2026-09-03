import React from 'react';
import { ChevronRight } from 'lucide-react';

type IconComponent = React.ComponentType<{ size?: number }>;

interface RoleOption {
  id: string;
  title: string;
  subtitle: string;
  icon: IconComponent;
  variant?: 'default' | 'primary' | 'outline';
  badge?: string;
}

interface RoleSelectorProps {
  roles: RoleOption[];
  onRoleSelect: (roleId: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, onRoleSelect }) => {
  const getButtonClasses = (variant: string = 'default') => {
    const baseClasses = "group w-full p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between hover:shadow-lg transform hover:-translate-y-1";
    
    const variants = {
      default: "bg-white border-[#E0E1E6] hover:border-[#5850DE] hover:bg-[#F8F9FB]",
      primary: "bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white border-transparent shadow-lg hover:shadow-xl",
      outline: "bg-white border-2 border-[#5850DE] text-[#5850DE] hover:bg-[#5850DE] hover:text-white"
    };

    return `${baseClasses} ${variants[variant as keyof typeof variants] || variants.default}`;
  };

  const getIconClasses = (variant: string = 'default') => {
    const baseClasses = "w-12 h-12 rounded-xl flex items-center justify-center transition-colors";
    
    const variants = {
      default: "bg-[#F0F0F3] text-[#1B173A] group-hover:bg-[#5850DE] group-hover:text-white",
      primary: "bg-white/20 text-white",
      outline: "bg-[#5850DE]/10 text-[#5850DE] group-hover:bg-white/20 group-hover:text-white"
    };

    return `${baseClasses} ${variants[variant as keyof typeof variants] || variants.default}`;
  };

  const getTextClasses = (variant: string = 'default', isTitle: boolean = true) => {
    if (isTitle) {
      const variants = {
        default: "text-[#1B173A] group-hover:text-[#5850DE]",
        primary: "text-white",
        outline: "group-hover:text-white"
      };
      return `font-bold text-lg ${variants[variant as keyof typeof variants] || variants.default}`;
    } else {
      const variants = {
        default: "text-[#8E8E93]",
        primary: "text-white/80",
        outline: "text-[#8E8E93]"
      };
      return `text-sm font-medium mt-1 ${variants[variant as keyof typeof variants] || variants.default}`;
    }
  };

  const getChevronClasses = (variant: string = 'default') => {
    const variants = {
      default: "text-[#8E8E93] group-hover:text-[#5850DE] group-hover:translate-x-1",
      primary: "text-white/70 group-hover:translate-x-1",
      outline: "group-hover:text-white group-hover:translate-x-1"
    };

    return `transition-all ${variants[variant as keyof typeof variants] || variants.default}`;
  };

  return (
    <div className="space-y-4">
      {roles.map((role) => {
        const Icon = role.icon;
        
        return (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={getButtonClasses(role.variant)}
          >
            <div className="flex items-center gap-4">
              <div className={getIconClasses(role.variant)}>
                <Icon size={24} />
              </div>
              <div className="text-left">
                <h3 className={getTextClasses(role.variant, true)}>
                  {role.title}
                </h3>
                <p className={getTextClasses(role.variant, false)}>
                  {role.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {role.badge && (
                <span className="px-3 py-1 bg-[#4DAB46]/10 text-[#4DAB46] rounded-full text-xs font-bold uppercase tracking-wider border border-[#4DAB46]/20">
                  {role.badge}
                </span>
              )}
              <ChevronRight size={20} className={getChevronClasses(role.variant)} />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;