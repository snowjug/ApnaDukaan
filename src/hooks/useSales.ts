import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SaleItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface CreateSaleData {
  items: SaleItem[];
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: 'cash' | 'card' | 'mobile' | 'other';
  notes: string | null;
  customer_id?: string | null;
}

export function useSales() {
  const [loading, setLoading] = useState(false);

  const createSale = async (data: CreateSaleData) => {
    setLoading(true);
    try {
      // Generate sale number
      const { data: saleNumberData, error: saleNumberError } = await supabase
        .rpc('generate_sale_number');

      if (saleNumberError) throw saleNumberError;

      // Create sale with customer_id
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          sale_number: saleNumberData,
          total_amount: data.total_amount,
          tax_amount: data.tax_amount,
          discount_amount: data.discount_amount,
          payment_method: data.payment_method,
          payment_status: 'completed',
          notes: data.notes,
          customer_id: data.customer_id || null,
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(
          data.items.map(item => ({
            sale_id: saleData.id,
            ...item,
          }))
        );

      if (itemsError) throw itemsError;

      // Update customer loyalty points if customer exists
      if (data.customer_id) {
        const loyaltyPoints = Math.floor(data.total_amount / 10); // 1 point per ₹10
        if (loyaltyPoints > 0) {
          // Add loyalty points to customer
          const { data: customer } = await supabase
            .from('customers')
            .select('loyalty_points')
            .eq('id', data.customer_id)
            .single();
          
          if (customer) {
            await supabase
              .from('customers')
              .update({ loyalty_points: customer.loyalty_points + loyaltyPoints })
              .eq('id', data.customer_id);
          }
        }
      }

      // Return complete sale with items
      return {
        ...saleData,
        items: data.items,
      };
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales')
        .select('*, sale_items(*), customer:customers(id, name, email)')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSale,
    fetchSales,
  };
}
