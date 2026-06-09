import { History, TrendingUp, User, FileText, MessageSquare } from 'lucide-react';
import { OpportunityActivityType } from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { formatDate } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';
import { cn } from '../utils/helpers';

interface OpportunityActivityLogProps {
  opportunityId: string;
  maxItems?: number;
}

const activityTypeIcons: Record<OpportunityActivityType, React.ReactNode> = {
  stage_change: <TrendingUp className="w-4 h-4" />,
  quote_add: <FileText className="w-4 h-4" />,
  owner_change: <User className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
};

const activityTypeColors: Record<OpportunityActivityType, string> = {
  stage_change: 'bg-purple-500',
  quote_add: 'bg-emerald-500',
  owner_change: 'bg-blue-500',
  note: 'bg-amber-500',
};

const activityTypeLabels: Record<OpportunityActivityType, string> = {
  stage_change: '阶段变更',
  quote_add: '报价新增',
  owner_change: '负责人调整',
  note: '备注',
};

export const OpportunityActivityLog = ({ opportunityId, maxItems }: OpportunityActivityLogProps) => {
  const { getOpportunityActivityLog, users } = useCRMStore();
  const activityLog = getOpportunityActivityLog(opportunityId);
  
  const displayLog = maxItems ? activityLog.slice(0, maxItems) : activityLog;

  if (activityLog.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">暂无协作记录</p>
        <p className="text-xs text-slate-400 mt-1">阶段变更、报价新增、负责人调整都会在这里显示</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          协作记录
          <Badge variant="default" size="sm">{activityLog.length}</Badge>
        </h4>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />
        <div className="space-y-4">
          {displayLog.map((activity, index) => {
            const user = users.find(u => u.id === activity.userId);
            const activityDate = new Date(activity.createdAt);
            
            return (
              <div key={activity.id} className="relative pl-10 group">
                <div
                  className={cn(
                    'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm',
                    activityTypeColors[activity.type]
                  )}
                >
                  {activityTypeIcons[activity.type]}
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activity.type === 'quote_add'
                            ? 'success'
                            : activity.type === 'stage_change'
                            ? 'warning'
                            : activity.type === 'owner_change'
                            ? 'info'
                            : 'default'
                        }
                        size="sm"
                      >
                        {activityTypeLabels[activity.type]}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {formatDate(activity.createdAt)} {activityDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {user && (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={user.name} size="sm" />
                        <span className="text-xs text-slate-500">{user.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-700">{activity.description}</p>
                  
                  {(activity.oldValue || activity.newValue) && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {activity.oldValue && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                          {activity.oldValue}
                        </span>
                      )}
                      {activity.oldValue && activity.newValue && (
                        <span className="text-slate-400">→</span>
                      )}
                      {activity.newValue && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {activity.newValue}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {maxItems && activityLog.length > maxItems && (
        <p className="text-center text-xs text-slate-400">
          还有 {activityLog.length - maxItems} 条记录，点击查看全部
        </p>
      )}
    </div>
  );
};
