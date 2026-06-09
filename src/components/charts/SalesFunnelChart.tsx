import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer, Cell } from 'recharts';
import { FunnelData } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface SalesFunnelChartProps {
  data: FunnelData[];
}

const COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];

export const SalesFunnelChart = ({ data }: SalesFunnelChartProps) => {
  const chartData = data.map(item => ({
    ...item,
    value: item.count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900">{item.stageLabel}</p>
          <p className="text-sm text-slate-600">商机数量: {item.count}</p>
          <p className="text-sm text-slate-600">预计金额: {formatCurrency(item.amount)}</p>
          <p className="text-sm text-emerald-600">转化率: {item.conversionRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            data={chartData}
            isAnimationActive
            animationDuration={800}
          >
            <LabelList
              position="right"
              fill="#334155"
              stroke="none"
              dataKey="stageLabel"
              fontSize={12}
            />
            <LabelList
              position="center"
              fill="#fff"
              stroke="none"
              dataKey="count"
              fontSize={14}
              fontWeight="bold"
            />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};
