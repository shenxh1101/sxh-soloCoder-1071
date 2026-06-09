import { useNavigate } from 'react-router-dom';
import { Building2, Clock, User, Tag } from 'lucide-react';
import { Customer, LEVEL_COLORS, SIZE_LABELS } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { formatDate, getRelativeTime } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';

interface CustomerCardProps {
  customer: Customer;
}

export const CustomerCard = ({ customer }: CustomerCardProps) => {
  const navigate = useNavigate();
  const { users } = useCRMStore();
  const owner = users.find(u => u.id === customer.ownerId);

  const levelVariant = {
    A: 'danger' as const,
    B: 'warning' as const,
    C: 'info' as const,
    D: 'default' as const,
  };

  const primaryContact = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];
  const openOpportunities = customer.opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost');
  const totalOpportunityAmount = openOpportunities.reduce((sum, o) => sum + o.amount, 0);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/customers/${customer.id}`)}
      className="group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} size="lg" variant="square" />
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                {customer.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={LEVEL_COLORS[customer.level]}>
                  {customer.level}级客户
                </Badge>
                <Badge variant="default" size="sm">
                  {SIZE_LABELS[customer.size]}
                </Badge>
              </div>
            </div>
          </div>
          <Badge variant={levelVariant[customer.level]} size="sm">
            {customer.source}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{customer.industry}</span>
          </div>
          {primaryContact && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>{primaryContact.name} · {primaryContact.position}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>{openOpportunities.length}个商机 · ¥{(totalOpportunityAmount / 10000).toFixed(0)}万</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              上次跟进: {customer.lastFollowUp ? getRelativeTime(customer.lastFollowUp) : '暂无'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {owner && (
              <>
                <Avatar name={owner.name} size="sm" />
                <span className="text-xs text-slate-500">{owner.name}</span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-400">
            创建于 {formatDate(customer.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
};
