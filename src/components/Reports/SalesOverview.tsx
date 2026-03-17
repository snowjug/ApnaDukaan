import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesOverviewProps {
  data?: {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    profitMargin: number;
    itemsSold: number;
  };
  loading: boolean;
}

export function SalesOverview({ data, loading }: SalesOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Sales',
      value: data?.totalSales || 0,
      icon: ShoppingCart,
      format: 'number',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Revenue',
      value: data?.totalRevenue || 0,
      icon: DollarSign,
      format: 'currency',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Profit',
      value: data?.totalProfit || 0,
      icon: TrendingUp,
      format: 'currency',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Average Order Value',
      value: data?.averageOrderValue || 0,
      icon: DollarSign,
      format: 'currency',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Items Sold',
      value: data?.itemsSold || 0,
      icon: Package,
      format: 'number',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Profit Margin',
      value: data?.profitMargin || 0,
      icon: Percent,
      format: 'percent',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `₹${value.toFixed(2)}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.value > 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card key={metric.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <h3 className="text-2xl font-bold mb-1">
                  {formatValue(metric.value, metric.format)}
                </h3>
                {metric.format === 'currency' && (
                  <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{isPositive ? 'Revenue generated' : 'No sales yet'}</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
