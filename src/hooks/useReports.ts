import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useReports(startDate: string, endDate: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch sales with items
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (salesError) throw salesError;

      // Fetch products with categories for cost calculation
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, cost, category_id, categories(name)');

      if (productsError) throw productsError;

      const productCostMap = new Map(
        productsData.map(p => [p.id, { cost: p.cost, category: p.categories?.name || 'Uncategorized' }])
      );

      // Calculate summary metrics
      const totalSales = salesData?.length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      let totalCost = 0;
      let itemsSold = 0;
      const productStats = new Map();
      const categoryStats = new Map();

      salesData?.forEach(sale => {
        sale.sale_items?.forEach((item: any) => {
          itemsSold += item.quantity;
          const productInfo = productCostMap.get(item.product_id);
          const itemCost = (productInfo?.cost || 0) * item.quantity;
          const itemProfit = item.subtotal - itemCost;
          
          totalCost += itemCost;

          // Track product stats
          const existing = productStats.get(item.product_id) || {
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            total_quantity: 0,
            total_revenue: 0,
            total_cost: 0,
            total_profit: 0,
          };

          existing.total_quantity += item.quantity;
          existing.total_revenue += Number(item.subtotal);
          existing.total_cost += itemCost;
          existing.total_profit += itemProfit;
          productStats.set(item.product_id, existing);

          // Track category stats
          const category = productInfo?.category || 'Uncategorized';
          const catExisting = categoryStats.get(category) || {
            category,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
          catExisting.revenue += Number(item.subtotal);
          catExisting.cost += itemCost;
          catExisting.profit += itemProfit;
          categoryStats.set(category, catExisting);
        });
      });

      const totalProfit = totalRevenue - totalCost;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Calculate top products
      const topProducts = Array.from(productStats.values())
        .map(p => ({
          ...p,
          profit_margin: p.total_revenue > 0 ? (p.total_profit / p.total_revenue) * 100 : 0,
        }))
        .sort((a, b) => b.total_quantity - a.total_quantity);

      // Calculate daily sales
      const dailySalesMap = new Map();
      salesData?.forEach(sale => {
        const date = sale.created_at.split('T')[0];
        const existing = dailySalesMap.get(date) || {
          date,
          revenue: 0,
          cost: 0,
          sales_count: 0,
        };

        existing.revenue += Number(sale.total_amount);
        existing.sales_count += 1;
        
        sale.sale_items?.forEach((item: any) => {
          const productInfo = productCostMap.get(item.product_id);
          existing.cost += (productInfo?.cost || 0) * item.quantity;
        });

        dailySalesMap.set(date, existing);
      });

      const dailySales = Array.from(dailySalesMap.values()).map(day => ({
        ...day,
        profit: day.revenue - day.cost,
      }));

      // Calculate category profit analysis
      const byCategory = Array.from(categoryStats.values()).map(cat => ({
        ...cat,
        margin: cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0,
      }));

      setData({
        summary: {
          totalSales,
          totalRevenue,
          totalProfit,
          averageOrderValue,
          profitMargin,
          itemsSold,
        },
        topProducts,
        dailySales,
        profitAnalysis: {
          totalRevenue,
          totalCost,
          totalProfit,
          profitMargin,
          byCategory,
        },
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading };
}
