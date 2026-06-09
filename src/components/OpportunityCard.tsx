import { useState } from 'react';
import { DollarSign, Calendar, User, TrendingUp, FileText } from 'lucide-react';
import { Opportunity, STAGE_COLORS, STAGE_LABELS } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
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
  const { users, getCustomerById, getQuotesByOpportunity } = useCRMStore();
  const owner = users.find(u => u.id === opportunity.ownerId);
  const customer = getCustomerById(opportunity.customerId);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const quotes = getQuotesByOpportunity(opportunity.id);
  const latestQuote = quotes[0];

  const daysUntil = getDaysUntil(opportunity.expectedCloseDate);
  const isOverdue = daysUntil < 0 && opportunity.stage !== 'won' && opportunity.stage !== 'lost';

  const stageOptions: Opportunity['stage'][] = ['initial', 'needs', 'proposal', 'negotiation', 'won', 'lost'];

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
                  <span className="text-xs text-slate-500">{owner.name}</span>
                </div>
              )}
              {showQuoteButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuoteModal(true);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
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
      </Card>
      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        opportunity={opportunity}
      />
    </>
  );
};
