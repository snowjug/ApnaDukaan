import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;
type CustomerInsert = TablesInsert<'customers'>;
type CustomerUpdate = TablesUpdate<'customers'>;
type CustomerPricing = Tables<'customer_pricing'>;

export const useCustomers = () => {
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Customer[];
    },
  });

  const createCustomer = useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer: ' + error.message);
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: CustomerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update customer: ' + error.message);
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete customer: ' + error.message);
    },
  });

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};

export const useCustomerPricing = (customerId: string | null) => {
  const queryClient = useQueryClient();

  const { data: pricing = [], isLoading } = useQuery({
    queryKey: ['customer-pricing', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('customer_pricing')
        .select(`
          *,
          products (id, name, sku, price)
        `)
        .eq('customer_id', customerId);
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  const upsertPricing = useMutation({
    mutationFn: async (data: { customer_id: string; product_id: string; custom_price?: number; discount_percentage: number }) => {
      const { error } = await supabase
        .from('customer_pricing')
        .upsert(data, { onConflict: 'customer_id,product_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-pricing', customerId] });
      toast.success('Pricing updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update pricing: ' + error.message);
    },
  });

  const deletePricing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customer_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-pricing', customerId] });
      toast.success('Custom pricing removed');
    },
    onError: (error) => {
      toast.error('Failed to remove pricing: ' + error.message);
    },
  });

  return {
    pricing,
    isLoading,
    upsertPricing,
    deletePricing,
  };
};

export const useCustomerHistory = (customerId: string | null) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  const totalSpent = history.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalOrders = history.length;

  return {
    history,
    isLoading,
    totalSpent,
    totalOrders,
  };
};
