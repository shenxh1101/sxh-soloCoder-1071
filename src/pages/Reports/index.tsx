import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  UserCheck,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  Filter,
  AlertCircle,
  Calendar,
  ExternalLink,
  MessageSquare,
  TrendingDown,
} from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Select } from '../../components/ui/Select';
import { SalesFunnelChart } from '../../components/charts/SalesFunnelChart';
import { SourcePieChart } from '../../components/charts/SourcePieChart';
import { IndustryBarChart } from '../../components/charts/IndustryBarChart';
import {
  formatCurrency,
  calculateSourceStats,
  calculateIndustryStats,
  formatDate,
} from '../../utils/helpers';
import { RISK_TYPE_LABELS, RISK_SEVERITY_COLORS, RiskItemType } from '../../types';

export const Reports = () => {
  const navigate = useNavigate();
  const {
    customers,
    getAllOpportunities,
    getSalesFunnel,
    getTeamPerformance,
    getWeeklyWorkload,
    getTeamRiskView,
    currentUser,
    users,
  } = useCRMStore();

  const [riskOwnerFilter, setRiskOwnerFilter] = useState<string>('all');
  const [riskTypeFilter, setRiskTypeFilter] = useState<string>('all');
  const [riskSeverityFilter, setRiskSeverityFilter] = useState<string>('all');

  const allOpportunities = getAllOpportunities();
  const salesFunnel = getSalesFunnel();
  const teamPerformance = getTeamPerformance();
  const weeklyWorkload = getWeeklyWorkload();
  const sourceStats = calculateSourceStats(customers);
  const industryStats = calculateIndustryStats(customers);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOpportunities = allOpportunities.length;
    const wonOpportunities = allOpportunities.filter(o => o.stage === 'won');
    const totalWonAmount = wonOpportunities.reduce((sum, o) => sum + o.amount, 0);
    const conversionRate = totalOpportunities > 0
      ? Math.round((wonOpportunities.length / totalOpportunities) * 100)
      : 0;
    const activeOpportunities = allOpportunities.filter(
      o => o.stage !== 'won' && o.stage !== 'lost'
    );
    const pipelineAmount = activeOpportunities.reduce(
      (sum, o) => sum + (o.amount * o.probability / 100),
      0
    );

    return {
      totalCustomers,
      totalOpportunities,
      totalWonAmount,
      conversionRate,
      pipelineAmount,
      wonCount: wonOpportunities.length,
    };
  }, [customers, allOpportunities]);

  const sortedTeamPerformance = useMemo(() => {
    return [...teamPerformance].sort((a, b) => b.wonAmount - a.wonAmount);
  }, [teamPerformance]);

  const allRisks = useMemo(() => {
    return getTeamRiskView();
  }, [getTeamRiskView]);

  const filteredRisks = useMemo(() => {
    return allRisks.filter((risk) => {
      if (riskOwnerFilter !== 'all' && risk.ownerId !== riskOwnerFilter) return false;
      if (riskTypeFilter !== 'all' && risk.type !== riskTypeFilter) return false;
      if (riskSeverityFilter !== 'all' && risk.severity !== riskSeverityFilter) return false;
      return true;
    });
  }, [allRisks, riskOwnerFilter, riskTypeFilter, riskSeverityFilter]);

  const riskStats = useMemo(() => {
    return {
      total: allRisks.length,
      high: allRisks.filter(r => r.severity === 'high').length,
      medium: allRisks.filter(r => r.severity === 'medium').length,
      low: allRisks.filter(r => r.severity === 'low').length,
    };
  }, [allRisks]);

  const salesUserOptions = users
    .filter(u => u.role === 'sales')
    .map(u => ({ value: u.id, label: u.name }));

  const riskTypeOptions = Object.entries(RISK_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  const handleRiskClick = (risk: any) => {
    if (risk.opportunityId) {
      navigate(`/opportunities`);
    } else {
      navigate(`/customers/${risk.customerId}`);
    }
  };

  const getRiskIcon = (type: RiskItemType) => {
    switch (type) {
      case 'overdue_task': return <Clock className="w-4 h-4" />;
      case 'no_followup': return <MessageSquare className="w-4 h-4" />;
      case 'stalled_opportunity': return <TrendingDown className="w-4 h-4" />;
      case 'quote_no_progress': return <DollarSign className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          统计报表
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          查看销售数据和团队表现
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">客户总数</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.totalCustomers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">商机总数</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.totalOpportunities}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">成交金额</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(stats.totalWonAmount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">整体转化率</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.conversionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">销售漏斗</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              按阶段展示商机数量和转化情况
            </p>
          </CardHeader>
          <CardContent>
            <SalesFunnelChart data={salesFunnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">客户来源分布</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              各渠道获客数量对比
            </p>
          </CardHeader>
          <CardContent>
            <SourcePieChart data={sourceStats} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">行业分布</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              客户所属行业统计
            </p>
          </CardHeader>
          <CardContent>
            <IndustryBarChart data={industryStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">团队业绩排行</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              销售人员成交金额排名
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedTeamPerformance.map((member, index) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'bg-amber-100 text-amber-700'
                        : index === 1
                        ? 'bg-slate-200 text-slate-600'
                        : index === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar name={member.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">
                        {member.name}
                      </p>
                      {member.userId === currentUser.id && (
                        <Badge variant="info" size="sm">我</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">
                        {member.totalOpportunities}个商机
                      </span>
                      <span className="text-xs text-slate-500">
                        成交{member.wonOpportunities}个
                      </span>
                      <span className="text-xs text-emerald-600">
                        转化率{member.conversionRate}%
                      </span>
                      <span className="text-xs text-blue-600">
                        任务完成率{member.taskCompletionRate}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          任务进度: {member.completedTasks}/{member.totalTasks}
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${member.taskCompletionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(member.wonAmount)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {(member.wonAmount / 10000).toFixed(0)}万
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">团队工作量视图</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              本周各销售人员工作负荷统计
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600">新增跟进</p>
                  <p className="text-xl font-bold text-blue-700">
                    {weeklyWorkload.reduce((sum, w) => sum + w.newFollowUps, 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600">完成任务</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {weeklyWorkload.reduce((sum, w) => sum + w.completedTasks, 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-600">逾期任务</p>
                  <p className="text-xl font-bold text-red-700">
                    {weeklyWorkload.reduce((sum, w) => sum + w.overdueTasks, 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-600">报价次数</p>
                  <p className="text-xl font-bold text-amber-700">
                    {weeklyWorkload.reduce((sum, w) => sum + w.quoteCount, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {weeklyWorkload.map((member) => {
                const workloadScore = member.newFollowUps + member.completedTasks + member.quoteCount;
                const needsSupport = member.overdueTasks > 2 || (workloadScore < 5 && member.overdueTasks > 0);

                return (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      needsSupport
                        ? 'bg-red-50 border-red-200 hover:bg-red-100'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Avatar name={member.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        {needsSupport && (
                          <Badge variant="danger" size="sm">需要支援</Badge>
                        )}
                        {member.userId === currentUser.id && (
                          <Badge variant="info" size="sm">我</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-3 mt-2">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">新增跟进</p>
                          <p className="text-lg font-semibold text-blue-600">{member.newFollowUps}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">完成任务</p>
                          <p className="text-lg font-semibold text-emerald-600">{member.completedTasks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">逾期任务</p>
                          <p className={`text-lg font-semibold ${member.overdueTasks > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                            {member.overdueTasks}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">报价次数</p>
                          <p className="text-lg font-semibold text-amber-600">{member.quoteCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center relative overflow-hidden">
                        <div
                          className={`absolute bottom-0 left-0 right-0 transition-all ${
                            workloadScore >= 15 ? 'bg-emerald-500' : workloadScore >= 8 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${Math.min(100, workloadScore * 5)}%` }}
                        />
                        <span className="relative z-10 text-sm font-bold text-slate-700">{workloadScore}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">工作量指数</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900">销售漏斗明细</h3>
          <p className="text-sm text-slate-500 mt-1">
            各阶段商机数量、金额和转化率
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                    阶段
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    商机数量
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    预计金额
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    转化率
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    平均金额
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesFunnel.map((item, index) => (
                  <tr
                    key={item.stage}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: [
                              '#64748b',
                              '#3b82f6',
                              '#f59e0b',
                              '#8b5cf6',
                              '#10b981',
                            ][index],
                          }}
                        />
                        <span className="font-medium text-slate-900">
                          {item.stageLabel}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 text-slate-600">
                      {item.count}
                    </td>
                    <td className="text-center py-4 px-4 font-medium text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge
                        variant={
                          item.conversionRate >= 70
                            ? 'success'
                            : item.conversionRate >= 40
                            ? 'default'
                            : 'danger'
                        }
                      >
                        {item.conversionRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-4 px-4 text-slate-600">
                      {item.count > 0
                        ? formatCurrency(Math.round(item.amount / item.count))
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-slate-900">团队风险视图</h3>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                汇总逾期任务、长时间未跟进、商机停滞等风险项
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">{riskStats.high}</span>
                <span className="text-slate-500">高风险</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">{riskStats.medium}</span>
                <span className="text-slate-500">中风险</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">{riskStats.low}</span>
                <span className="text-slate-500">低风险</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-1">
              <Select
                label="按人员筛选"
                value={riskOwnerFilter}
                onChange={(e) => setRiskOwnerFilter(e.target.value)}
                options={[{ value: 'all', label: '全部销售人员' }, ...salesUserOptions]}
              />
            </div>
            <div className="md:col-span-1">
              <Select
                label="按类型筛选"
                value={riskTypeFilter}
                onChange={(e) => setRiskTypeFilter(e.target.value)}
                options={[{ value: 'all', label: '全部类型' }, ...riskTypeOptions]}
              />
            </div>
            <div className="md:col-span-1">
              <Select
                label="按严重程度筛选"
                value={riskSeverityFilter}
                onChange={(e) => setRiskSeverityFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部程度' },
                  { value: 'high', label: '高风险' },
                  { value: 'medium', label: '中风险' },
                  { value: 'low', label: '低风险' },
                ]}
              />
            </div>
          </div>

          {filteredRisks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
              <p className="font-medium">暂无风险项</p>
              <p className="text-sm mt-1">所有客户和商机进展正常</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRisks.map((risk) => (
                <div
                  key={risk.id}
                  onClick={() => handleRiskClick(risk)}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                    RISK_SEVERITY_COLORS[risk.severity]
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0',
                    risk.severity === 'high' ? 'bg-red-500' :
                    risk.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  )}>
                    {getRiskIcon(risk.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge
                        variant={risk.severity === 'high' ? 'danger' : risk.severity === 'medium' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {RISK_TYPE_LABELS[risk.type]}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {risk.severity === 'high' ? '高风险' : risk.severity === 'medium' ? '中风险' : '低风险'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        已 {risk.days} 天
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">{risk.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{risk.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {risk.customerName}
                      </span>
                      {risk.opportunityName && (
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          {risk.opportunityName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {risk.ownerName}
                      </span>
                      {risk.lastActivity && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          最后活动: {formatDate(risk.lastActivity)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
