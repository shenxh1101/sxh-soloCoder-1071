import { useState } from 'react';
import {
  Phone,
  Users,
  Mail,
  MoreHorizontal,
  FileText,
  Paperclip,
  DollarSign,
  Target,
  CheckCircle2,
  Circle,
  Filter,
} from 'lucide-react';
import {
  FollowUp,
  TimelineEvent,
  TimelineEventType,
  FOLLOWUP_TYPE_LABELS,
  TIMELINE_TYPE_LABELS,
} from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { formatDate, formatCurrency } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';
import { cn } from '../utils/helpers';

interface TimelineProps {
  followUps?: FollowUp[];
  events?: TimelineEvent[];
  customerId?: string;
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

export const Timeline = ({ followUps, events: propEvents, customerId }: TimelineProps) => {
  const { users, getTimelineEvents } = useCRMStore();
  const [activeFilter, setActiveFilter] = useState<TimelineEventType | 'all'>('all');

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

  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter((e) => e.type === activeFilter);

  const filterOptions: { value: TimelineEventType | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'followup', label: '跟进记录' },
    { value: 'attachment', label: '附件' },
    { value: 'quote', label: '报价' },
    { value: 'opportunity', label: '商机' },
    { value: 'task', label: '任务' },
  ];

  if (filteredEvents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">客户时间线</h3>
        </div>
        <div className="text-center py-12 text-slate-500">
          <p>暂无记录</p>
          <p className="text-sm mt-1">添加跟进记录后将在这里显示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-slate-900">客户时间线</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-100 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  activeFilter === option.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
};
