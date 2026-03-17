import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorder_level: number;
  shortage: number;
  preferredSupplier?: {
    supplier_id: string;
    supplier_name: string;
    cost_price: number;
    lead_time_days: number | null;
    minimum_order_quantity: number | null;
  };
}

export const useReorderAlerts = () => {
  const { data: lowStockProducts = [], isLoading, refetch } = useQuery({
    queryKey: ['reorder-alerts'],
    queryFn: async () => {
      // Get products below reorder level
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, stock, reorder_level')
        .eq('is_active', true);

      if (productsError) throw productsError;

      const lowStock = products?.filter(p => p.stock <= p.reorder_level) || [];

      // Get preferred suppliers for these products
      const productIds = lowStock.map(p => p.id);
      
      if (productIds.length === 0) return [];

      const { data: supplierProducts, error: spError } = await supabase
        .from('supplier_products')
        .select(`
          product_id,
          cost_price,
          lead_time_days,
          minimum_order_quantity,
          supplier_id,
          suppliers (id, name)
        `)
        .in('product_id', productIds)
        .eq('is_preferred', true);

      if (spError) throw spError;

      // Map supplier info to products
      const supplierMap = new Map();
      supplierProducts?.forEach((sp: any) => {
        supplierMap.set(sp.product_id, {
          supplier_id: sp.supplier_id,
          supplier_name: sp.suppliers?.name,
          cost_price: sp.cost_price,
          lead_time_days: sp.lead_time_days,
          minimum_order_quantity: sp.minimum_order_quantity,
        });
      });

      return lowStock.map(product => ({
        ...product,
        shortage: product.reorder_level - product.stock + 10, // Suggest ordering 10 above reorder level
        preferredSupplier: supplierMap.get(product.id),
      })) as LowStockProduct[];
    },
  });

  // Group by supplier for suggested POs
  const suggestedPOs = lowStockProducts.reduce((acc, product) => {
    if (!product.preferredSupplier) return acc;
    
    const supplierId = product.preferredSupplier.supplier_id;
    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplier_id: supplierId,
        supplier_name: product.preferredSupplier.supplier_name,
        items: [],
        total: 0,
      };
    }
    
    const quantity = Math.max(
      product.shortage,
      product.preferredSupplier.minimum_order_quantity || 1
    );
    const subtotal = quantity * product.preferredSupplier.cost_price;
    
    acc[supplierId].items.push({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      current_stock: product.stock,
      reorder_level: product.reorder_level,
      suggested_quantity: quantity,
      unit_cost: product.preferredSupplier.cost_price,
      subtotal,
    });
    acc[supplierId].total += subtotal;
    
    return acc;
  }, {} as Record<string, any>);

  return {
    lowStockProducts,
    suggestedPOs: Object.values(suggestedPOs),
    isLoading,
    refetch,
  };
};
