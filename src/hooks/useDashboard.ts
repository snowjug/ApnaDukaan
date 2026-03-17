import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const last7Days = subDays(today, 7);
      const last30Days = subDays(today, 30);
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      // Fetch today's sales
      const { data: todaySales, error: todayError } = await supabase
        .from('sales')
        .select(`*, sale_items (*)`)
        .gte('created_at', startOfDay(today).toISOString())
        .lte('created_at', endOfDay(today).toISOString());

      if (todayError) throw todayError;

      // Fetch yesterday's sales for comparison
      const { data: yesterdaySales } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startOfDay(yesterday).toISOString())
        .lte('created_at', endOfDay(yesterday).toISOString());

      // Fetch this month's sales
      const { data: monthSales } = await supabase
        .from('sales')
        .select(`*, sale_items (*)`)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Fetch last 30 days sales for trend
      const { data: trendSales } = await supabase
        .from('sales')
        .select(`*, sale_items (*)`)
        .gte('created_at', startOfDay(last30Days).toISOString())
        .order('created_at', { ascending: true });

      // Fetch products with cost and category
      const { data: products } = await supabase
        .from('products')
        .select('id, name, cost, stock, reorder_level, sku, category_id');

      // Fetch categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      // Fetch customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, created_at');

      // Fetch recent stock movements
      const { data: stockMovements } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const productCostMap = new Map(products?.map(p => [p.id, p.cost]) || []);
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

      // Calculate today's metrics
      const todayRevenue = todaySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      let todayCost = 0;
      todaySales?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          todayCost += (productCostMap.get(item.product_id) || 0) * item.quantity;
        });
      });
      const todayProfit = todayRevenue - todayCost;

      // Monthly metrics
      const monthRevenue = monthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      let monthCost = 0;
      monthSales?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          monthCost += (productCostMap.get(item.product_id) || 0) * item.quantity;
        });
      });
      const monthProfit = monthRevenue - monthCost;

      // Yesterday's metrics for comparison
      const yesterdayRevenue = yesterdaySales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Percentage changes
      const salesChange = yesterdaySales?.length 
        ? (((todaySales?.length || 0) - yesterdaySales.length) / yesterdaySales.length) * 100
        : (todaySales?.length || 0) > 0 ? 100 : 0;

      const revenueChange = yesterdayRevenue 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0 ? 100 : 0;

      // Sales trend for last 7 days
      const salesByDate = new Map();
      trendSales?.forEach(sale => {
        const date = sale.created_at.split('T')[0];
        const existing = salesByDate.get(date) || { revenue: 0, sales: 0, profit: 0 };
        existing.revenue += Number(sale.total_amount);
        existing.sales += 1;
        let cost = 0;
        sale.sale_items?.forEach((item: any) => {
          cost += (productCostMap.get(item.product_id) || 0) * item.quantity;
        });
        existing.profit += Number(sale.total_amount) - cost;
        salesByDate.set(date, existing);
      });

      const salesTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        const data = salesByDate.get(date) || { revenue: 0, sales: 0, profit: 0 };
        salesTrend.push({ date, ...data });
      }

      // Top selling products
      const productSales = new Map();
      trendSales?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          const existing = productSales.get(item.product_id) || { 
            name: item.product_name, 
            quantity: 0, 
            revenue: 0 
          };
          existing.quantity += item.quantity;
          existing.revenue += Number(item.subtotal);
          productSales.set(item.product_id, existing);
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Sales by category
      const categorySales = new Map();
      trendSales?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          const product = products?.find(p => p.id === item.product_id);
          const categoryId = product?.category_id || 'uncategorized';
          const categoryName = categoryMap.get(categoryId) || 'Uncategorized';
          const existing = categorySales.get(categoryId) || { name: categoryName, value: 0 };
          existing.value += Number(item.subtotal);
          categorySales.set(categoryId, existing);
        });
      });

      const salesByCategory = Array.from(categorySales.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      // Low stock products
      const lowStockProducts = products?.filter(p => p.stock <= p.reorder_level) || [];

      // New customers this month
      const newCustomersThisMonth = customers?.filter(c => 
        new Date(c.created_at) >= monthStart
      ).length || 0;

      // Average order value
      const avgOrderValue = monthSales?.length 
        ? monthRevenue / monthSales.length 
        : 0;

      setData({
        metrics: {
          todaySales: todaySales?.length || 0,
          todayRevenue,
          todayProfit,
          lowStockCount: lowStockProducts.length,
          salesChange,
          revenueChange,
          monthRevenue,
          monthProfit,
          monthSales: monthSales?.length || 0,
          totalProducts: products?.length || 0,
          totalCustomers: customers?.length || 0,
          newCustomersThisMonth,
          avgOrderValue,
        },
        salesTrend,
        lowStockProducts,
        recentSales: todaySales?.slice(0, 5) || [],
        topProducts,
        salesByCategory,
        stockMovements,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refreshData };
}
