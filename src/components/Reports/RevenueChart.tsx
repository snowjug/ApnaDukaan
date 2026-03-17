import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface RevenueChartProps {
  data?: Array<{
    date: string;
    revenue: number;
    profit: number;
    sales_count: number;
  }>;
  loading: boolean;
  period: 'daily' | 'weekly' | 'monthly';
}

export function RevenueChart({ data, loading, period }: RevenueChartProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No sales data available for the selected period</p>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: format(new Date(item.date), period === 'daily' ? 'MMM dd' : 'MMM yyyy'),
    Revenue: item.revenue,
    Profit: item.profit,
    Sales: item.sales_count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Revenue & Profit Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line
              type="monotone"
              dataKey="Profit"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(142, 76%, 36%)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Sales Volume</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Sales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
