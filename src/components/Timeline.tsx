import { useState, useMemo } from 'react';
import {
  Phone,
  Users,
  Mail,
  MoreHorizontal,
  Paperclip,
  DollarSign,
  Target,
  CheckCircle2,
  Circle,
  Filter,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  FollowUp,
  TimelineEvent,
  TimelineEventType,
  FOLLOWUP_TYPE_LABELS,
  TIMELINE_TYPE_LABELS,
  User,
} from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { formatDate, formatCurrency, formatShortDate } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';
import { cn } from '../utils/helpers';

interface TimelineProps {
  followUps?: FollowUp[];
  events?: TimelineEvent[];
  customerId?: string;
  showSummary?: boolean;
}

const typeIcons: Record<TimelineEventType, React.ReactNode> = {
  followup: <Phone className="w-5 h-5" />,
  attachment: <Paperclip className="w-5 h-5" />,
  quote: <DollarSign className="w-5 h-5" />,
  opportunity: <Target className="w-5 h-5" />,
  task: <CheckCircle2 className="w-5 h-5" />,
};

const typeColors: Record<TimelineEventType, string> = {
  followup: 'bg-blue-500',
  attachment: 'bg-purple-500',
  quote: 'bg-emerald-500',
  opportunity: 'bg-amber-500',
  task: 'bg-indigo-500',
};

const followUpTypeIcons = {
  call: Phone,
  meeting: Users,
  email: Mail,
  other: MoreHorizontal,
};

export const Timeline = ({ followUps, events: propEvents, customerId, showSummary = true }: TimelineProps) => {
  const { users, getTimelineEvents, getCustomerSummary } = useCRMStore();
  const [activeTypeFilter, setActiveTypeFilter] = useState<TimelineEventType | 'all'>('all');
  const [activeUserFilter, setActiveUserFilter] = useState<string>('all');

  let events: TimelineEvent[] = [];
  if (propEvents) {
    events = propEvents;
  } else if (customerId) {
    events = getTimelineEvents(customerId);
  } else if (followUps) {
    events = followUps.map((followUp) => {
      const dateTime = new Date(followUp.date);
      return {
        id: `followup-${followUp.id}`,
        type: 'followup' as TimelineEventType,
        date: followUp.date,
        time: dateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        title: followUp.type === 'call' ? '电话沟通' : followUp.type === 'meeting' ? '会议洽谈' : followUp.type === 'email' ? '邮件往来' : '其他跟进',
        description: followUp.content,
        userId: followUp.userId,
        metadata: {
          result: followUp.result,
          nextContactDate: followUp.nextContactDate,
          followUpType: followUp.type,
        },
      };
    });
  }

  const eventUserIds = useMemo(() => {
    const ids = new Set(events.map(e => e.userId));
    return Array.from(ids);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const typeMatch = activeTypeFilter === 'all' || e.type === activeTypeFilter;
      const userMatch = activeUserFilter === 'all' || e.userId === activeUserFilter;
      return typeMatch && userMatch;
    });
  }, [events, activeTypeFilter, activeUserFilter]);

  const customerSummary = customerId ? getCustomerSummary(customerId) : null;

  const typeFilterOptions: { value: TimelineEventType | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'followup', label: '跟进记录' },
    { value: 'attachment', label: '附件' },
    { value: 'quote', label: '报价' },
    { value: 'opportunity', label: '商机' },
    { value: 'task', label: '任务' },
  ];

  const userFilterOptions = useMemo(() => {
    const options: { value: string; label: string; user?: User }[] = [
      { value: 'all', label: '全部负责人' },
    ];
    eventUserIds.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user) {
        options.push({ value: userId, label: user.name, user });
      }
    });
    return options;
  }, [eventUserIds, users]);

  const handleResetFilters = () => {
    setActiveTypeFilter('all');
    setActiveUserFilter('all');
  };

  const hasActiveFilters = activeTypeFilter !== 'all' || activeUserFilter !== 'all';

  return (
    <div className="space-y-6">
      {showSummary && customerSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">最近联系</span>
                <Phone className="w-4 h-4 text-blue-400" />
              </div>
              {customerSummary.lastContact ? (
                <>
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {FOLLOWUP_TYPE_LABELS[customerSummary.lastContact.type as keyof typeof FOLLOWUP_TYPE_LABELS]}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{customerSummary.lastContact.content}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatShortDate(customerSummary.lastContact.date)}</span>
                    <span>{customerSummary.lastContact.user}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">暂无联系记录</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">最近报价</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              {customerSummary.lastQuote ? (
                <>
                  <p className="text-lg font-bold text-emerald-600 mb-1">
                    {formatCurrency(customerSummary.lastQuote.amount)}
                  </p>
                  <p className="text-xs text-slate-600 mb-2 truncate">{customerSummary.lastQuote.opportunityName}</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatShortDate(customerSummary.lastQuote.date)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">暂无报价记录</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">下一步待办</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              {customerSummary.nextTask ? (
                <>
                  <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">
                    {customerSummary.nextTask.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatShortDate(customerSummary.nextTask.date)}</span>
                    <span>{customerSummary.nextTask.assignedTo}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">暂无待办任务</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-red-100 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">当前风险</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              {customerSummary.risks.length > 0 ? (
                <ul className="space-y-1">
                  {customerSummary.risks.map((risk, index) => (
                    <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-600">跟进状态良好 ✓</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-slate-900">客户时间线</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              重置筛选
            </button>
          )}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex bg-slate-100 rounded-lg p-1">
              {typeFilterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveTypeFilter(option.value)}
                  className={cn(
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    activeTypeFilter === option.value
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            {userFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveUserFilter(option.value)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeUserFilter === option.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {option.user && <Avatar name={option.user.name} size="sm" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-medium text-slate-600 mb-1">暂无符合筛选条件的记录</p>
          <p className="text-sm text-slate-400 mb-4">尝试调整筛选条件或查看全部记录</p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              查看全部记录
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const user = users.find((u) => u.id === event.userId);
              const isLatest = index === 0;
              const Icon = event.type === 'followup' && event.metadata?.followUpType
                ? followUpTypeIcons[event.metadata.followUpType as keyof typeof followUpTypeIcons] || null
                : null;

              return (
                <div key={event.id} className="relative pl-12 group">
                  <div
                    className={cn(
                      'absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md',
                      typeColors[event.type],
                      isLatest && 'ring-4 ring-slate-100'
                    )}
                  >
                    {Icon ? <Icon className="w-5 h-5" /> : typeIcons[event.type]}
                  </div>

                  <div
                    className={cn(
                      'bg-white border border-slate-200 rounded-lg p-4 transition-all',
                      isLatest && 'border-slate-300 shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            event.type === 'quote'
                              ? 'success'
                              : event.type === 'attachment'
                              ? 'info'
                              : event.type === 'opportunity'
                              ? 'warning'
                              : event.type === 'task'
                              ? 'default'
                              : 'info'
                          }
                          size="sm"
                        >
                          {event.type === 'followup' && event.metadata?.followUpType
                            ? FOLLOWUP_TYPE_LABELS[event.metadata.followUpType as keyof typeof FOLLOWUP_TYPE_LABELS]
                            : TIMELINE_TYPE_LABELS[event.type]}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {formatDate(event.date)} {event.time}
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
                        <p className="text-sm font-medium text-slate-700 mb-1">{event.title}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
                      </div>

                      {event.type === 'followup' && event.metadata?.result && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">沟通结果</p>
                          <p className="text-sm text-slate-600">{event.metadata.result}</p>
                        </div>
                      )}

                      {event.type === 'followup' && event.metadata?.nextContactDate && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-sm text-amber-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            下次联系: {formatDate(event.metadata.nextContactDate)}
                          </p>
                        </div>
                      )}

                      {event.type === 'quote' && event.metadata?.amount && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600">
                              {formatCurrency(event.metadata.amount)}
                            </span>
                          </div>
                        </div>
                      )}

                      {event.type === 'attachment' && event.metadata?.size && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>
                              {(event.metadata.size / 1024).toFixed(1)} KB
                            </span>
                            {event.metadata.type && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span>{event.metadata.type}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {event.type === 'opportunity' && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-500">
                              成交概率: <span className="font-medium text-slate-700">{event.metadata?.probability}%</span>
                            </span>
                            <span className="text-slate-500">
                              预估金额: <span className="font-medium text-emerald-600">{formatCurrency(event.metadata?.amount || 0)}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {event.type === 'task' && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            {event.metadata?.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300" />
                            )}
                            <span className={cn(
                              'text-xs',
                              event.metadata?.completed ? 'text-emerald-600' : 'text-slate-500'
                            )}>
                              {event.metadata?.completed ? '已完成' : '待完成'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
