import { NavLink } from 'react-router-dom';
import { Users, Calendar, Target, BarChart3, Building2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/customers', label: '客户管理', icon: Users },
  { path: '/schedule', label: '跟进日程', icon: Calendar },
  { path: '/opportunities', label: '销售机会', icon: Target },
  { path: '/reports', label: '统计报表', icon: BarChart3 },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-40">
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              CRM系统
            </h1>
            <p className="text-xs text-slate-400">客户关系管理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-slate-800 text-white shadow-inner'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                )
              }
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                'text-slate-400 group-hover:text-white'
              )} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          © 2026 CRM管理系统
        </div>
      </div>
    </aside>
  );
};
