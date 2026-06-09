import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Customer, Opportunity, STAGE_LABELS } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

export const getDaysUntil = (date: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};

export const getFileIcon = (type: string): string => {
  if (type.includes('pdf')) return 'FileText';
  if (type.includes('doc') || type.includes('docx')) return 'FileText';
  if (type.includes('xls') || type.includes('xlsx')) return 'FileSpreadsheet';
  if (type.includes('ppt') || type.includes('pptx')) return 'FilePresentation';
  if (type.includes('image')) return 'FileImage';
  return 'File';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const calculateSalesFunnel = (opportunities: Opportunity[]) => {
  const stages: Opportunity['stage'][] = ['initial', 'needs', 'proposal', 'negotiation', 'won', 'lost'];
  const funnel = stages.map(stage => {
    const stageOpportunities = opportunities.filter(o => o.stage === stage);
    return {
      stage,
      stageLabel: STAGE_LABELS[stage],
      count: stageOpportunities.length,
      amount: stageOpportunities.reduce((sum, o) => sum + o.amount, 0),
      conversionRate: 0,
    };
  });

  const activeFunnel = funnel.filter(f => f.stage !== 'lost');
  for (let i = 1; i < activeFunnel.length; i++) {
    activeFunnel[i].conversionRate = activeFunnel[i - 1].count > 0
      ? Math.round((activeFunnel[i].count / activeFunnel[i - 1].count) * 100)
      : 0;
  }
  activeFunnel[0].conversionRate = 100;

  return activeFunnel;
};

export const calculateSourceStats = (customers: Customer[]) => {
  const sourceMap = new Map<string, { count: number; wonAmount: number }>();
  
  customers.forEach(customer => {
    if (!sourceMap.has(customer.source)) {
      sourceMap.set(customer.source, { count: 0, wonAmount: 0 });
    }
    const data = sourceMap.get(customer.source)!;
    data.count += 1;
    
    const wonOpportunities = customer.opportunities.filter(o => o.stage === 'won');
    data.wonAmount += wonOpportunities.reduce((sum, o) => sum + o.amount, 0);
  });

  return Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    count: data.count,
    wonAmount: data.wonAmount,
  }));
};

export const calculateIndustryStats = (customers: Customer[]) => {
  const industryMap = new Map<string, number>();
  
  customers.forEach(customer => {
    industryMap.set(customer.industry, (industryMap.get(customer.industry) || 0) + 1);
  });

  return Array.from(industryMap.entries()).map(([industry, count]) => ({
    industry,
    count,
  }));
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  const endPadding = 42 - days.length;
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

export const downloadFile = (data: string, filename: string, mimeType: string) => {
  const link = document.createElement('a');
  link.href = data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
