export interface User {
  id: string;
  name: string;
  email: string;
  role: 'sales' | 'manager';
  avatar: string;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface FollowUp {
  id: string;
  customerId: string;
  type: 'call' | 'meeting' | 'email' | 'other';
  content: string;
  result: string;
  date: string;
  userId: string;
  nextContactDate?: string;
}

export interface Attachment {
  id: string;
  customerId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  data?: string;
  uploadedAt: string;
}

export interface Quote {
  id: string;
  opportunityId: string;
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
}

export type TimelineEventType = 'followup' | 'attachment' | 'quote' | 'opportunity' | 'task';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  time: string;
  title: string;
  description: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface Opportunity {
  id: string;
  customerId: string;
  name: string;
  stage: 'initial' | 'needs' | 'proposal' | 'negotiation' | 'won' | 'lost';
  amount: number;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  quotes: Quote[];
  activityLog: OpportunityActivityLog[];
}

export interface Task {
  id: string;
  customerId: string;
  followUpId?: string;
  title: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  assignedTo: string;
}

export type OpportunityActivityType = 'stage_change' | 'quote_add' | 'owner_change' | 'note';

export interface OpportunityActivityLog {
  id: string;
  type: OpportunityActivityType;
  description: string;
  userId: string;
  createdAt: string;
  oldValue?: string;
  newValue?: string;
}

export interface CustomerSummary {
  lastContact: {
    date: string;
    type: string;
    content: string;
    user: string;
  } | null;
  lastQuote: {
    date: string;
    amount: number;
    opportunityName: string;
  } | null;
  nextTask: {
    title: string;
    date: string;
    assignedTo: string;
  } | null;
  risks: string[];
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
  source: string;
  level: 'A' | 'B' | 'C' | 'D';
  address: string;
  website: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lastFollowUp?: string;
  contacts: Contact[];
  followUps: FollowUp[];
  attachments: Attachment[];
  opportunities: Opportunity[];
  tasks: Task[];
}

export interface FunnelData {
  stage: string;
  stageLabel: string;
  count: number;
  amount: number;
  conversionRate: number;
}

export interface TeamPerformance {
  userId: string;
  name: string;
  avatar: string;
  totalOpportunities: number;
  wonOpportunities: number;
  wonAmount: number;
  conversionRate: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
}

export interface TaskStats {
  userId: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface WeeklyWorkload {
  userId: string;
  name: string;
  avatar: string;
  newFollowUps: number;
  completedTasks: number;
  overdueTasks: number;
  quoteCount: number;
}

export const STAGE_LABELS: Record<Opportunity['stage'], string> = {
  initial: '初步接触',
  needs: '需求确认',
  proposal: '方案报价',
  negotiation: '商务谈判',
  won: '成交',
  lost: '流失',
};

export const STAGE_COLORS: Record<Opportunity['stage'], string> = {
  initial: 'bg-slate-500',
  needs: 'bg-blue-500',
  proposal: 'bg-amber-500',
  negotiation: 'bg-purple-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
};

export const LEVEL_COLORS: Record<Customer['level'], string> = {
  A: 'bg-red-100 text-red-700 border-red-200',
  B: 'bg-amber-100 text-amber-700 border-amber-200',
  C: 'bg-blue-100 text-blue-700 border-blue-200',
  D: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const SIZE_LABELS: Record<Customer['size'], string> = {
  small: '小型',
  medium: '中型',
  large: '大型',
};

export const FOLLOWUP_TYPE_LABELS: Record<FollowUp['type'], string> = {
  call: '电话',
  meeting: '会议',
  email: '邮件',
  other: '其他',
};

export const TIMELINE_TYPE_LABELS: Record<TimelineEventType, string> = {
  followup: '跟进记录',
  attachment: '附件上传',
  quote: '报价记录',
  opportunity: '商机创建',
  task: '任务创建',
};

export const SOURCES = ['官网', '转介绍', '展会', '电话营销', '网络推广', '合作伙伴', '其他'];
export const INDUSTRIES = ['互联网', '金融', '制造业', '零售', '教育', '医疗', '房地产', '能源', '物流', '其他'];
