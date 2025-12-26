'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/format-utils';
import { useTranslations } from 'next-intl';

interface SurveyResult {
  date: string;
  percentage: number;
  completedAt: string | null;
  answeredQuestions: number;
  totalQuestions: number;
}

interface SurveyResultsChartProps {
  data: SurveyResult[];
}

export function SurveyResultsChart({ data }: SurveyResultsChartProps) {
  const t = useTranslations('admin.users.detail.chartTooltip');

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No survey data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: formatDate(item.date, {
      includeTime: false,
      monthFormat: 'short',
    }),
    percentage: Math.round(item.percentage * 10) / 10,
    fullDate: formatDate(item.date, {
      includeTime: true,
      monthFormat: 'long',
    }),
    answeredQuestions: item.answeredQuestions,
    totalQuestions: item.totalQuestions,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          domain={[0, 100]}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          label={{
            value: 'Satisfaction %',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' },
          }}
        />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg border bg-popover p-3 shadow-md">
                  <p className="text-sm font-medium">{data.fullDate}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('satisfaction')}: <span className="font-semibold">{data.percentage}%</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('answeredQuestions')}: <span className="font-semibold">{data.answeredQuestions}</span> / <span className="font-semibold">{data.totalQuestions}</span>
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

