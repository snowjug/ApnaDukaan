import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchInventory {
  id: string;
  branch_id: string;
  product_id: string;
  stock: number;
  reorder_level: number;
  branch?: Branch;
  product?: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

export interface StockTransfer {
  id: string;
  transfer_number: string;
  from_branch_id: string;
  to_branch_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  from_branch?: Branch;
  to_branch?: Branch;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchInventory, setBranchInventory] = useState<BranchInventory[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('is_main', { ascending: false })
      .order('name');

    if (error) {
      toast({ title: 'Error fetching branches', description: error.message, variant: 'destructive' });
    } else {
      setBranches(data || []);
    }
    setLoading(false);
    return data || [];
  }, [toast]);

  const createBranch = useCallback(async (branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('branches')
      .insert(branch)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating branch', description: error.message, variant: 'destructive' });
      return null;
    }
    toast({ title: 'Branch created successfully' });
    return data;
  }, [toast]);

  const updateBranch = useCallback(async (id: string, updates: Partial<Branch>) => {
    const { error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating branch', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Branch updated successfully' });
    return true;
  }, [toast]);

  const deleteBranch = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting branch', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Branch deleted successfully' });
    return true;
  }, [toast]);

  const fetchBranchInventory = useCallback(async (branchId?: string) => {
    setLoading(true);
    let query = supabase
      .from('branch_inventory')
      .select(`
        *,
        branch:branches(*),
        product:products(id, name, sku, price)
      `);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error fetching inventory', description: error.message, variant: 'destructive' });
    } else {
      setBranchInventory(data || []);
    }
    setLoading(false);
    return data || [];
  }, [toast]);

  const updateBranchInventory = useCallback(async (branchId: string, productId: string, stock: number) => {
    const { error } = await supabase
      .from('branch_inventory')
      .upsert({
        branch_id: branchId,
        product_id: productId,
        stock
      }, { onConflict: 'branch_id,product_id' });

    if (error) {
      toast({ title: 'Error updating inventory', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  }, [toast]);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_transfers')
      .select(`
        *,
        from_branch:branches!stock_transfers_from_branch_id_fkey(*),
        to_branch:branches!stock_transfers_to_branch_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching transfers', description: error.message, variant: 'destructive' });
    } else {
      setTransfers(data || []);
    }
    setLoading(false);
    return data || [];
  }, [toast]);

  const fetchTransferItems = useCallback(async (transferId: string) => {
    const { data, error } = await supabase
      .from('stock_transfer_items')
      .select(`
        *,
        product:products(id, name, sku)
      `)
      .eq('transfer_id', transferId);

    if (error) {
      toast({ title: 'Error fetching transfer items', description: error.message, variant: 'destructive' });
      return [];
    }
    return data || [];
  }, [toast]);

  const createTransfer = useCallback(async (
    fromBranchId: string,
    toBranchId: string,
    items: { productId: string; quantity: number }[],
    notes?: string
  ) => {
    // Generate transfer number
    const { data: transferNumber } = await supabase.rpc('generate_transfer_number');

    const { data: transfer, error: transferError } = await supabase
      .from('stock_transfers')
      .insert({
        transfer_number: transferNumber,
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (transferError) {
      toast({ title: 'Error creating transfer', description: transferError.message, variant: 'destructive' });
      return null;
    }

    // Insert transfer items
    const transferItems = items.map(item => ({
      transfer_id: transfer.id,
      product_id: item.productId,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('stock_transfer_items')
      .insert(transferItems);

    if (itemsError) {
      toast({ title: 'Error adding transfer items', description: itemsError.message, variant: 'destructive' });
      return null;
    }

    toast({ title: 'Stock transfer created successfully' });
    return transfer;
  }, [toast]);

  const completeTransfer = useCallback(async (transferId: string) => {
    const { error } = await supabase
      .from('stock_transfers')
      .update({
        status: 'completed',
        approved_at: new Date().toISOString()
      })
      .eq('id', transferId);

    if (error) {
      toast({ title: 'Error completing transfer', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Transfer completed successfully' });
    return true;
  }, [toast]);

  const cancelTransfer = useCallback(async (transferId: string) => {
    const { error } = await supabase
      .from('stock_transfers')
      .update({ status: 'cancelled' })
      .eq('id', transferId);

    if (error) {
      toast({ title: 'Error cancelling transfer', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Transfer cancelled' });
    return true;
  }, [toast]);

  return {
    branches,
    branchInventory,
    transfers,
    loading,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    fetchBranchInventory,
    updateBranchInventory,
    fetchTransfers,
    fetchTransferItems,
    createTransfer,
    completeTransfer,
    cancelTransfer
  };
}
