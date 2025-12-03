import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  description?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, children, description }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden mb-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="px-8 py-6 border-b border-gray-100/50 flex items-center gap-4 bg-gradient-to-r from-white/50 to-transparent">
        <div className="p-3 bg-indigo-600/10 rounded-2xl">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          {description && <p className="text-sm text-slate-500 font-medium">{description}</p>}
        </div>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {children}
      </div>
    </div>
  );
};