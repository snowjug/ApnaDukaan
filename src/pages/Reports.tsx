import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { SalesOverview } from '@/components/Reports/SalesOverview';
import { RevenueChart } from '@/components/Reports/RevenueChart';
import { TopProducts } from '@/components/Reports/TopProducts';
import { ProfitAnalysis } from '@/components/Reports/ProfitAnalysis';
import { useReports } from '@/hooks/useReports';

export default function Reports() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data, loading } = useReports(
    startOfDay(dateRange.from).toISOString(),
    endOfDay(dateRange.to).toISOString()
  );

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ['Sales Report', `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`],
      [],
      ['Summary'],
      ['Total Sales', data?.summary.totalSales || 0],
      ['Total Revenue', `₹${data?.summary.totalRevenue.toFixed(2) || 0}`],
      ['Total Profit', `₹${data?.summary.totalProfit.toFixed(2) || 0}`],
      ['Average Order Value', `₹${data?.summary.averageOrderValue.toFixed(2) || 0}`],
      [],
      ['Top Products'],
      ['Product', 'Quantity Sold', 'Revenue', 'Profit'],
      ...(data?.topProducts || []).map(p => [
        p.product_name,
        p.total_quantity,
        `₹${p.total_revenue.toFixed(2)}`,
        `₹${p.total_profit.toFixed(2)}`
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Sales Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Comprehensive insights into your sales performance
          </p>
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
          {/* Date Range Pickers */}
          <div className="flex flex-row gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start flex-1 sm:flex-initial px-2 sm:px-4 h-9 sm:h-10">
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate text-xs sm:text-sm">{format(dateRange.from, 'PP')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                />
              </PopoverContent>
            </Popover>
            <span className="text-sm text-muted-foreground shrink-0">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start flex-1 sm:flex-initial px-2 sm:px-4 h-9 sm:h-10">
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate text-xs sm:text-sm">{format(dateRange.to, 'PP')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Period Toggle Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm"
              onClick={() => setPeriod('daily')}
            >
              Daily
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm"
              onClick={() => setPeriod('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm"
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </Button>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm"
              onClick={() => setDateRange({
                from: subDays(new Date(), 7),
                to: new Date(),
              })}
            >
              <span className="hidden sm:inline">Last 7 Days</span>
              <span className="sm:hidden">7D</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm"
              onClick={() => setDateRange({
                from: subDays(new Date(), 30),
                to: new Date(),
              })}
            >
              <span className="hidden sm:inline">Last 30 Days</span>
              <span className="sm:hidden">30D</span>
            </Button>
          </div>
        </div>
      </Card>

      <SalesOverview data={data?.summary} loading={loading} />

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="revenue" className="text-xs sm:text-sm py-2 whitespace-nowrap">
            <span className="hidden sm:inline">Revenue Trends</span>
            <span className="sm:hidden">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm py-2 whitespace-nowrap">
            <span className="hidden sm:inline">Top Products</span>
            <span className="sm:hidden">Products</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="text-xs sm:text-sm py-2 whitespace-nowrap">
            <span className="hidden sm:inline">Profit Analysis</span>
            <span className="sm:hidden">Profit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueChart data={data?.dailySales} loading={loading} period={period} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <TopProducts data={data?.topProducts} loading={loading} />
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <ProfitAnalysis data={data?.profitAnalysis} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
