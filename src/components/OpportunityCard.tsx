import { useState } from 'react';
import { DollarSign, Calendar, User, TrendingUp, FileText, History, MessageSquare, UserPlus, CheckCircle2 } from 'lucide-react';
import { Opportunity, STAGE_COLORS, STAGE_LABELS, NOTE_CATEGORY_LABELS, NOTE_CATEGORY_COLORS } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';
import { cn } from '../utils/helpers';
import { QuoteModal } from './QuoteModal';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStageChange?: (stage: Opportunity['stage']) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  showQuoteButton?: boolean;
}

export const OpportunityCard = ({
  opportunity,
  onStageChange,
  draggable = false,
  onDragStart,
  showQuoteButton = true,
}: OpportunityCardProps) => {
  const { users, getCustomerById, getQuotesByOpportunity, getOpportunityActivityLog, updateOpportunity, addOpportunityNote, currentUser } = useCRMStore();
  const owner = users.find(u => u.id === opportunity.ownerId);
  const customer = getCustomerById(opportunity.customerId);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState(opportunity.ownerId);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'discussion' | 'risk' | 'action'>('discussion');

  const quotes = getQuotesByOpportunity(opportunity.id);
  const latestQuote = quotes[0];
  const activityLog = getOpportunityActivityLog(opportunity.id);
  const recentActivities = activityLog.slice(0, 3);

  const daysUntil = getDaysUntil(opportunity.expectedCloseDate);
  const isOverdue = daysUntil < 0 && opportunity.stage !== 'won' && opportunity.stage !== 'lost';

  const stageOptions: Opportunity['stage'][] = ['initial', 'needs', 'proposal', 'negotiation', 'won', 'lost'];
  const salesUsers = users.filter(u => u.role === 'sales');
  const userOptions = salesUsers.map(u => ({ value: u.id, label: u.name }));

  const handleOwnerChange = () => {
    if (newOwnerId !== opportunity.ownerId) {
      updateOpportunity(opportunity.id, { ownerId: newOwnerId });
    }
    setShowOwnerModal(false);
  };

  const handleAddNote = () => {
    if (noteContent.trim()) {
      addOpportunityNote(opportunity.id, noteContent.trim(), noteCategory);
      setNoteContent('');
      setNoteCategory('discussion');
      setShowNoteModal(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stage_change': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'quote_add': return <FileText className="w-3.5 h-3.5" />;
      case 'owner_change': return <User className="w-3.5 h-3.5" />;
      case 'note': return <MessageSquare className="w-3.5 h-3.5" />;
      default: return <History className="w-3.5 h-3.5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'stage_change': return 'bg-purple-500';
      case 'quote_add': return 'bg-emerald-500';
      case 'owner_change': return 'bg-blue-500';
      case 'note': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <>
      <Card
        className={cn(
          'cursor-grab active:cursor-grabbing transition-all',
          isOverdue && 'border-red-300'
        )}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        <div className={`h-1 ${STAGE_COLORS[opportunity.stage]}`} />
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 text-sm mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                {opportunity.name}
              </h4>
              {customer && (
                <p className="text-xs text-slate-500">{customer.name}</p>
              )}
            </div>
            {onStageChange && (
              <select
                value={opportunity.stage}
                onChange={(e) => onStageChange(e.target.value as Opportunity['stage'])}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500"
                onClick={(e) => e.stopPropagation()}
              >
                {stageOptions.map(stage => (
                  <option key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-900">
                  {formatCurrency(opportunity.amount)}
                </span>
              </div>
              <Badge
                variant={opportunity.stage === 'won' ? 'success' : opportunity.stage === 'lost' ? 'danger' : 'default'}
                size="sm"
              >
                {STAGE_LABELS[opportunity.stage]}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    opportunity.probability >= 70 ? 'bg-emerald-500' :
                    opportunity.probability >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                  )}
                  style={{ width: `${opportunity.probability}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-right">{opportunity.probability}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Calendar className={cn('w-4 h-4', isOverdue ? 'text-red-500' : 'text-slate-400')} />
              <span className={cn(isOverdue && 'text-red-600')}>
                {formatDate(opportunity.expectedCloseDate)}
                {isOverdue && ` (已逾期${Math.abs(daysUntil)}天)`}
                {!isOverdue && daysUntil <= 7 && daysUntil > 0 && ` (还有${daysUntil}天)`}
              </span>
            </div>
          </div>

          {recentActivities.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <History className="w-3.5 h-3.5" />
                  最近动态
                </span>
                <span className="text-xs text-slate-400">{activityLog.length}条记录</span>
              </div>
              <div className="space-y-2">
                {recentActivities.map((activity) => {
                  const user = users.find(u => u.id === activity.userId);
                  const activityDate = new Date(activity.createdAt);
                  return (
                    <div key={activity.id} className="flex items-start gap-2 text-xs">
                      <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5', getActivityColor(activity.type))}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 line-clamp-2">{activity.description}</p>
                        <p className="text-slate-400 mt-0.5">
                          {formatDate(activity.createdAt)} {activityDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · {user?.name || '未知'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100">
            {latestQuote && (
              <div className="mb-3 p-2 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">最新报价</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(latestQuote.amount)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(latestQuote.date)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              {owner && (
                <div className="flex items-center gap-2">
                  <Avatar name={owner.name} size="sm" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">{owner.name}</span>
                    {currentUser.role === 'manager' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewOwnerId(opportunity.ownerId);
                          setShowOwnerModal(true);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                        title="调整负责人"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNoteModal(true);
                  }}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors px-2 py-1 rounded hover:bg-amber-50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  备注
                </button>
                {showQuoteButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuoteModal(true);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {quotes.length > 0 ? `${quotes.length}次报价` : '管理报价'}
                  </button>
                )}
                {!showQuoteButton && quotes.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {quotes.length}次报价
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        opportunity={opportunity}
      />

      <Modal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
        title="调整负责人"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Avatar name={owner?.name || ''} size="md" />
            <div>
              <p className="text-sm text-slate-500">当前负责人</p>
              <p className="font-medium text-slate-900">{owner?.name || '-'}</p>
            </div>
          </div>
          <Select
            label="选择新负责人"
            value={newOwnerId}
            onChange={(e) => setNewOwnerId(e.target.value)}
            options={userOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowOwnerModal(false)}>
              取消
            </Button>
            <Button onClick={handleOwnerChange}>
              确认调整
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="添加协作备注"
        size="md"
      >
        <div className="p-6 space-y-4">
          <Select
            label="备注类型"
            value={noteCategory}
            onChange={(e) => setNoteCategory(e.target.value as 'discussion' | 'risk' | 'action')}
            options={[
              { value: 'discussion', label: '内部讨论' },
              { value: 'risk', label: '风险提醒' },
              { value: 'action', label: '下一步动作' },
            ]}
          />
          <Textarea
            label="备注内容"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="请输入备注内容..."
            rows={4}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              保存备注
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
