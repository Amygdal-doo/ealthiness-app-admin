import React from 'react';
import { TrendingUp } from 'lucide-react';

type IconComponent = React.ComponentType<{ size?: number }>;

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconComponent;
  trend?: number;
  color?: string;
  bgColor?: string;
  accentColor?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = "text-[#1B173A]", 
  bgColor = "bg-white", 
  accentColor 
}) => (
  <div className={`${bgColor} rounded-2xl p-6 border border-[#E0E1E6] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${accentColor || 'bg-[#F0F0F3]'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-[#4DAB46]/10 text-[#4DAB46]' : 'bg-[#EF4444]/10 text-[#EF4444]'
        }`}>
          <TrendingUp size={12} className={trend > 0 ? 'rotate-0' : 'rotate-180'} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className={`text-3xl font-extrabold ${color} mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm font-medium text-[#8E8E93]">{title}</p>
      {subtitle && <p className="text-xs text-[#60646C] mt-1">{subtitle}</p>}
    </div>
  </div>
);

export default MetricsCard;