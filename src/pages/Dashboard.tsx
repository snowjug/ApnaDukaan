import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricsCards } from '@/components/Dashboard/MetricsCards';
import { RecentSales } from '@/components/Dashboard/RecentSales';
import { SalesTrendChart } from '@/components/Dashboard/SalesTrendChart';
import { LowStockWidget } from '@/components/Dashboard/LowStockWidget';
import { TopProductsChart } from '@/components/Dashboard/TopProductsChart';
import { CategorySalesChart } from '@/components/Dashboard/CategorySalesChart';
import { useDashboard } from '@/hooks/useDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, refreshData } = useDashboard();

  useEffect(() => {
    refreshData();
  }, []);

  const quickActions = [
    {
      label: 'New Sale',
      icon: ShoppingCart,
      onClick: () => navigate('/pos'),
      color: 'bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-300',
    },
    {
      label: 'Add Product',
      icon: Package,
      onClick: () => navigate('/products'),
      color: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-300',
    },
    {
      label: 'View Reports',
      icon: TrendingUp,
      onClick: () => navigate('/reports'),
      color: 'bg-gradient-to-br from-purple-50 to-pink-100 text-purple-700 dark:from-purple-950 dark:to-pink-950 dark:text-purple-300',
    },
    {
      label: 'Stock Alerts',
      icon: AlertTriangle,
      onClick: () => navigate('/inventory'),
      color: 'bg-gradient-to-br from-orange-50 to-red-100 text-orange-700 dark:from-orange-950 dark:to-red-950 dark:text-orange-300',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.label}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${action.color} border-0`}
              onClick={action.onClick}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Decorative Circle */}
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="text-sm sm:text-base font-semibold tracking-wide">{action.label}</span>
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Card>
          );
        })}
      </div>

      {/* Metrics Cards */}
      <MetricsCards data={data?.metrics} loading={loading} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChart data={data?.salesTrend} loading={loading} />
        </div>
        <div>
          <CategorySalesChart data={data?.salesByCategory} loading={loading} />
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <TopProductsChart data={data?.topProducts} loading={loading} />
        </div>
        <div>
          <LowStockWidget products={data?.lowStockProducts} loading={loading} />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentSales sales={data?.recentSales} loading={loading} />
    </div>
  );
}
