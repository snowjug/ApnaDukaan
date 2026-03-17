import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  batch_number: string | null;
  expiry_date: string | null;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMovements = async (productId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMovements((data as StockMovement[]) || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMovement = async (
    movement: Omit<StockMovement, 'id' | 'created_at'>
  ) => {
    try {
      // Insert the stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([movement]);

      if (movementError) throw movementError;

      // If this is a stock-in movement with batch/expiry info, update the product
      if (movement.movement_type === 'in' && (movement.batch_number || movement.expiry_date)) {
        const updateData: any = {};
        if (movement.batch_number) updateData.batch_number = movement.batch_number;
        if (movement.expiry_date) updateData.expiry_date = movement.expiry_date;

        const { error: productError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', movement.product_id);

        if (productError) console.error('Error updating product batch/expiry:', productError);
      }
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  };

  return {
    movements,
    loading,
    fetchMovements,
    createMovement,
  };
}
