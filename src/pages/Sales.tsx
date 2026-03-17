import { useState, useEffect } from 'react';
import { Search, Filter, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { SalesTable } from '@/components/Sales/SalesTable';
import { ReceiptModal } from '@/components/POS/ReceiptModal';
import { useSales } from '@/hooks/useSales';

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const { fetchSales, loading } = useSales();

  useEffect(() => {
    loadSales();
  }, [dateRange]);

  const loadSales = async () => {
    try {
      const startDate = dateRange.from ? startOfDay(dateRange.from).toISOString() : undefined;
      const endDate = dateRange.to ? endOfDay(dateRange.to).toISOString() : undefined;
      const data = await fetchSales(startDate, endDate);
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      sale.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const handleViewReceipt = (sale: any) => {
    setSelectedSale({
      ...sale,
      items: sale.sale_items,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPaymentFilter('all');
    setDateRange({});
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Sales History
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage all past transactions
          </p>
        </div>
        <Button variant="outline" onClick={loadSales} className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by sale number or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-row gap-2 items-center flex-1 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start flex-1 sm:w-auto px-2 sm:px-4 h-9 sm:h-10">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{dateRange.from ? format(dateRange.from, 'PP') : 'Start Date'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground text-sm shrink-0">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start flex-1 sm:w-auto px-2 sm:px-4 h-9 sm:h-10">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{dateRange.to ? format(dateRange.to, 'PP') : 'End Date'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(searchQuery || paymentFilter !== 'all' || dateRange.from || dateRange.to) && (
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          <h2 className="font-semibold text-base sm:text-lg">
            {filteredSales.length} Transaction{filteredSales.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <SalesTable
          sales={filteredSales}
          loading={loading}
          onViewReceipt={handleViewReceipt}
        />
      </Card>

      <ReceiptModal
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
      />
    </div>
  );
}
