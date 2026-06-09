import { useState } from 'react';
import { X, DollarSign, FileText, Calendar, Plus, Trash2, Download, ArrowDown, ArrowUp, Minus, GitCompare } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import { Quote, Opportunity } from '../types';
import { formatCurrency, formatDate, getToday } from '../utils/helpers';
import { useCRMStore } from '../store/useCRMStore';
import { cn } from '../utils/helpers';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
}

export const QuoteModal = ({ isOpen, onClose, opportunity }: QuoteModalProps) => {
  const { addQuote, getQuotesByOpportunity, getCustomerById, users } = useCRMStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    amount: '',
    notes: '',
    date: getToday(),
  });

  if (!opportunity) return null;

  const quotes = getQuotesByOpportunity(opportunity.id);
  const customer = getCustomerById(opportunity.customerId);
  const owner = users.find(u => u.id === opportunity.ownerId);
  const latestQuote = quotes[0];

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteForm.amount) {
      addQuote(opportunity.id, {
        opportunityId: opportunity.id,
        amount: Number(quoteForm.amount),
        date: quoteForm.date,
        notes: quoteForm.notes,
      });
      setShowAddForm(false);
      setQuoteForm({
        amount: '',
        notes: '',
        date: getToday(),
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="报价管理" size="xl">
      <div className="p-6 space-y-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                {opportunity.name}
              </h4>
              {customer && (
                <p className="text-sm text-slate-500 mt-1">{customer.name}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(opportunity.amount)}
              </p>
              <p className="text-xs text-slate-500 mt-1">预估金额</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">成交概率</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {opportunity.probability}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">当前阶段</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {opportunity.stage === 'initial' && '初步接触'}
                {opportunity.stage === 'needs' && '需求确认'}
                {opportunity.stage === 'proposal' && '方案报价'}
                {opportunity.stage === 'negotiation' && '商务谈判'}
                {opportunity.stage === 'won' && '成交'}
                {opportunity.stage === 'lost' && '流失'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">负责人</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {owner?.name || '-'}
              </p>
            </div>
          </div>
          {latestQuote && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">最新报价</Badge>
                  <span className="text-sm text-slate-500">
                    {formatDate(latestQuote.date)}
                  </span>
                </div>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(latestQuote.amount)}
                </span>
              </div>
              {latestQuote.notes && (
                <p className="text-sm text-slate-600 mt-2 bg-white rounded p-2">
                  {latestQuote.notes}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <h5 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            报价历史
            <Badge variant="default" size="sm">{quotes.length}</Badge>
          </h5>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            新增报价
          </Button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddQuote} className="bg-blue-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h6 className="font-medium text-slate-900">添加新报价</h6>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="报价金额 (元) *"
                type="number"
                value={quoteForm.amount}
                onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                placeholder="请输入报价金额"
                required
              />
              <Input
                label="报价日期"
                type="date"
                value={quoteForm.date}
                onChange={(e) => setQuoteForm({ ...quoteForm, date: e.target.value })}
                required
              />
            </div>
            <Textarea
              label="报价备注"
              value={quoteForm.notes}
              onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
              placeholder="请输入报价相关说明..."
              rows={2}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                取消
              </Button>
              <Button type="submit" size="sm">
                保存报价
              </Button>
            </div>
          </form>
        )}

        {quotes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>暂无报价记录</p>
            <p className="text-sm mt-1">点击上方"新增报价"添加第一条报价</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {quotes.map((quote, index) => {
              const prevQuote = quotes[index + 1];
              const amountDiff = prevQuote ? quote.amount - prevQuote.amount : 0;
              const notesChanged = prevQuote && quote.notes !== prevQuote.notes;

              return (
                <div
                  key={quote.id}
                  className={cn(
                    'border rounded-lg p-4 hover:border-slate-300 transition-colors',
                    index === 0 ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                        index === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      )}>
                        #{quotes.length - index}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-emerald-600 text-lg">
                            {formatCurrency(quote.amount)}
                          </span>
                          {prevQuote && (
                            <div className={cn(
                              'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
                              amountDiff > 0
                                ? 'bg-red-100 text-red-700'
                                : amountDiff < 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            )}>
                              {amountDiff > 0 ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : amountDiff < 0 ? (
                                <ArrowDown className="w-3 h-3" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              {amountDiff > 0 ? '+' : ''}{formatCurrency(amountDiff)}
                            </div>
                          )}
                          {index === 0 && (
                            <Badge variant="success" size="sm">最新</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(quote.date)}
                          </span>
                          {prevQuote && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <GitCompare className="w-3 h-3" />
                              版本 {quotes.length - index} / {quotes.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                      title="下载报价单"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  {quote.notes && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-500">备注</span>
                        {notesChanged && (
                          <Badge variant="warning" size="sm">已更新</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 bg-white rounded p-2 border border-slate-100">
                        {quote.notes}
                      </p>
                      {notesChanged && prevQuote?.notes && (
                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                          <p className="text-xs font-medium text-amber-700 mb-1">上一版本备注:</p>
                          <p className="text-xs text-amber-600">{prevQuote.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {prevQuote && !quote.notes && prevQuote.notes && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-600">备注已删除，上一版本: {prevQuote.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
};
