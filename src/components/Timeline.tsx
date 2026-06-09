import { Phone, Users, Mail, MoreHorizontal } from 'lucide-react';
import { FollowUp, FOLLOWUP_TYPE_LABELS } from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { formatDate } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';
import { cn } from '../utils/helpers';

interface TimelineProps {
  followUps: FollowUp[];
}

const typeIcons = {
  call: Phone,
  meeting: Users,
  email: Mail,
  other: MoreHorizontal,
};

const typeColors = {
  call: 'bg-blue-500',
  meeting: 'bg-emerald-500',
  email: 'bg-amber-500',
  other: 'bg-slate-500',
};

export const Timeline = ({ followUps }: TimelineProps) => {
  const { users } = useCRMStore();

  const sortedFollowUps = [...followUps].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedFollowUps.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>暂无跟进记录</p>
        <p className="text-sm mt-1">点击上方按钮添加第一条跟进记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="space-y-6">
        {sortedFollowUps.map((followUp, index) => {
          const Icon = typeIcons[followUp.type];
          const user = users.find(u => u.id === followUp.userId);
          const isLatest = index === 0;

          return (
            <div key={followUp.id} className="relative pl-12 group">
              <div
                className={cn(
                  'absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md',
                  typeColors[followUp.type],
                  isLatest && 'ring-4 ring-slate-100'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className={cn(
                'bg-white border border-slate-200 rounded-lg p-4 transition-all',
                isLatest && 'border-slate-300 shadow-sm'
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="info" size="sm">
                      {FOLLOWUP_TYPE_LABELS[followUp.type]}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {formatDate(followUp.date)}
                    </span>
                    {isLatest && (
                      <Badge variant="success" size="sm">最新</Badge>
                    )}
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} size="sm" />
                      <span className="text-xs text-slate-500">{user.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">沟通内容</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{followUp.content}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">沟通结果</p>
                    <p className="text-sm text-slate-600">{followUp.result}</p>
                  </div>
                  {followUp.nextContactDate && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-sm text-amber-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        下次联系: {formatDate(followUp.nextContactDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
