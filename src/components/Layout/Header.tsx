import { useState } from 'react';
import { Bell, Search, ChevronDown, Users, Shield } from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

export const Header = () => {
  const { currentUser, users, setCurrentUser, setSearchKeyword, searchKeyword } = useCRMStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserSwitch = (userId: string) => {
    setCurrentUser(userId);
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索客户名称、行业、联系人..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative pl-4 border-l border-slate-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Avatar name={currentUser.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">
                  {currentUser.role === 'manager' ? '销售主管' : '销售人员'}
                </p>
                <Badge variant="info" size="sm">
                  切换角色
                </Badge>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95">
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-500 px-3 py-2 uppercase tracking-wide">
                  选择登录角色
                </p>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      user.id === currentUser.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Avatar name={user.name} size="sm" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <div className="flex items-center gap-1.5">
                        {user.role === 'manager' ? (
                          <Shield className="w-3.5 h-3.5 text-purple-500" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        <span className="text-xs text-slate-500">
                          {user.role === 'manager' ? '销售主管' : '销售人员'}
                        </span>
                      </div>
                    </div>
                    {user.id === currentUser.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  提示：切换角色可体验不同权限功能
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
