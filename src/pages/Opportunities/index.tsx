import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { OpportunityCard } from '../../components/OpportunityCard';
import { Opportunity, STAGE_LABELS, STAGE_COLORS } from '../../types';
import { formatCurrency, getToday } from '../../utils/helpers';

const STAGES: Opportunity['stage'][] = ['initial', 'needs', 'proposal', 'negotiation', 'won', 'lost'];

export const Opportunities = () => {
  const navigate = useNavigate();
  const {
    getAllOpportunities,
    customers,
    users,
    currentUser,
    addOpportunity,
    updateOpportunityStage,
    updateOpportunity,
  } = useCRMStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedOpportunity, setDraggedOpportunity] = useState<string | null>(null);
  const [opportunityForm, setOpportunityForm] = useState({
    customerId: '',
    name: '',
    amount: '',
    stage: 'initial' as Opportunity['stage'],
    probability: 20,
    expectedCloseDate: getToday(),
    ownerId: currentUser.id,
  });

  const allOpportunities = getAllOpportunities();

  const opportunitiesByStage = useMemo(() => {
    const grouped: Record<Opportunity['stage'], Opportunity[]> = {
      initial: [],
      needs: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    allOpportunities.forEach(opp => {
      grouped[opp.stage].push(opp);
    });
    return grouped;
  }, [allOpportunities]);

  const totalAmount = useMemo(() => {
    return allOpportunities
      .filter(o => o.stage !== 'lost')
      .reduce((sum, o) => sum + o.amount, 0);
  }, [allOpportunities]);

  const wonAmount = useMemo(() => {
    return allOpportunities
      .filter(o => o.stage === 'won')
      .reduce((sum, o) => sum + o.amount, 0);
  }, [allOpportunities]);

  const weightedAmount = useMemo(() => {
    return allOpportunities
      .filter(o => o.stage !== 'won' && o.stage !== 'lost')
      .reduce((sum, o) => sum + (o.amount * o.probability / 100), 0);
  }, [allOpportunities]);

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (opportunityForm.customerId && opportunityForm.name && opportunityForm.amount) {
      addOpportunity(opportunityForm.customerId, {
        name: opportunityForm.name,
        amount: Number(opportunityForm.amount),
        stage: opportunityForm.stage,
        probability: Number(opportunityForm.probability),
        expectedCloseDate: opportunityForm.expectedCloseDate,
        ownerId: opportunityForm.ownerId,
      });
      setShowAddModal(false);
      setOpportunityForm({
        customerId: '',
        name: '',
        amount: '',
        stage: 'initial',
        probability: 20,
        expectedCloseDate: getToday(),
        ownerId: currentUser.id,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, opportunityId: string) => {
    setDraggedOpportunity(opportunityId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: Opportunity['stage']) => {
    e.preventDefault();
    if (draggedOpportunity) {
      updateOpportunityStage(draggedOpportunity, stage);
      setDraggedOpportunity(null);
    }
  };

  const handleStageChange = (opportunityId: string, stage: Opportunity['stage']) => {
    updateOpportunityStage(opportunityId, stage);
  };

  const customerOptions = customers.map(c => ({
    value: c.id,
    label: c.name,
  }));

  const userOptions = users.map(u => ({
    value: u.id,
    label: u.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            销售机会
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            管理销售漏斗，跟踪商机进度
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          新增商机
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">商机总数</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {allOpportunities.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">预计总额</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">加权预测</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatCurrency(weightedAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">已成交金额</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(wonAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => (
            <div
              key={stage}
              className="w-72 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`} />
                  <h3 className="font-semibold text-slate-700 text-sm">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <Badge variant="default" size="sm">
                    {opportunitiesByStage[stage].length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 min-h-96 p-2 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                {opportunitiesByStage[stage].length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    拖拽商机到此处
                  </div>
                ) : (
                  opportunitiesByStage[stage].map(opportunity => (
                    <div
                      key={opportunity.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opportunity.id)}
                      onDragEnd={() => setDraggedOpportunity(null)}
                    >
                      <OpportunityCard
                        opportunity={opportunity}
                        draggable
                        onStageChange={(newStage) => handleStageChange(opportunity.id, newStage)}
                        onDragStart={(e) => handleDragStart(e, opportunity.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增销售机会"
        size="lg"
      >
        <form onSubmit={handleAddOpportunity} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="选择客户"
              value={opportunityForm.customerId}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, customerId: e.target.value })}
              options={[{ value: '', label: '请选择客户' }, ...customerOptions]}
              required
            />
            <Input
              label="商机名称"
              value={opportunityForm.name}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, name: e.target.value })}
              placeholder="如：企业版系统采购"
              required
            />
            <Input
              label="预估金额 (元)"
              type="number"
              value={opportunityForm.amount}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, amount: e.target.value })}
              placeholder="请输入预估金额"
              required
            />
            <Select
              label="当前阶段"
              value={opportunityForm.stage}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, stage: e.target.value as Opportunity['stage'] })}
              options={STAGES.map(s => ({ value: s, label: STAGE_LABELS[s] }))}
            />
            <Input
              label="成交概率 (%)"
              type="number"
              min="0"
              max="100"
              value={opportunityForm.probability}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, probability: Number(e.target.value) })}
              required
            />
            <Input
              label="预计成交日期"
              type="date"
              value={opportunityForm.expectedCloseDate}
              onChange={(e) => setOpportunityForm({ ...opportunityForm, expectedCloseDate: e.target.value })}
              required
            />
            {currentUser.role === 'manager' && (
              <Select
                label="负责人"
                value={opportunityForm.ownerId}
                onChange={(e) => setOpportunityForm({ ...opportunityForm, ownerId: e.target.value })}
                options={userOptions}
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              取消
            </Button>
            <Button type="submit">
              创建商机
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
