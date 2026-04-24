import React from 'react';

type IconComponent = React.ComponentType<{ size?: number }>;

interface QuickAction {
  icon: IconComponent;
  label: string;
  onClick: () => void;
  color?: string;
  bgColor?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActionButton: React.FC<QuickAction> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "text-[#5850DE]", 
  bgColor = "bg-[#E8E6FC]" 
}) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-[#E0E1E6] hover:border-[#5850DE] hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <span className="text-sm font-bold text-[#1B173A] text-center">{label}</span>
  </button>
);

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <QuickActionButton key={index} {...action} />
      ))}
    </div>
  );
};

export default QuickActions;