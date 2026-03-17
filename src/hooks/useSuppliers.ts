import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  payment_terms: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  supplier_sku: string | null;
  cost_price: number;
  lead_time_days: number | null;
  minimum_order_quantity: number | null;
  is_preferred: boolean;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  supplier?: Supplier;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  expected_delivery_date: string | null;
  received_date: string | null;
  notes: string | null;
  created_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  received_quantity: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error fetching suppliers', description: error.message, variant: 'destructive' });
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
    return data || [];
  }, [toast]);

  const createSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating supplier', description: error.message, variant: 'destructive' });
      return null;
    }
    toast({ title: 'Supplier created successfully' });
    return data;
  }, [toast]);

  const updateSupplier = useCallback(async (id: string, updates: Partial<Supplier>) => {
    const { error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating supplier', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Supplier updated successfully' });
    return true;
  }, [toast]);

  const deleteSupplier = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting supplier', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Supplier deleted successfully' });
    return true;
  }, [toast]);

  const fetchSupplierProducts = useCallback(async (supplierId?: string) => {
    let query = supabase
      .from('supplier_products')
      .select(`*, product:products(id, name, sku), supplier:suppliers(*)`);

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error fetching supplier products', description: error.message, variant: 'destructive' });
    } else {
      setSupplierProducts(data || []);
    }
    return data || [];
  }, [toast]);

  const linkProductToSupplier = useCallback(async (
    supplierId: string,
    productId: string,
    costPrice: number,
    supplierSku?: string,
    leadTimeDays?: number,
    minOrderQty?: number,
    isPreferred?: boolean
  ) => {
    const { error } = await supabase
      .from('supplier_products')
      .upsert({
        supplier_id: supplierId,
        product_id: productId,
        cost_price: costPrice,
        supplier_sku: supplierSku || null,
        lead_time_days: leadTimeDays || 7,
        minimum_order_quantity: minOrderQty || 1,
        is_preferred: isPreferred || false
      }, { onConflict: 'supplier_id,product_id' });

    if (error) {
      toast({ title: 'Error linking product', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Product linked to supplier' });
    return true;
  }, [toast]);

  const unlinkProduct = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('supplier_products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error unlinking product', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  }, [toast]);

  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`*, supplier:suppliers(*)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching purchase orders', description: error.message, variant: 'destructive' });
    } else {
      setPurchaseOrders(data || []);
    }
    setLoading(false);
    return data || [];
  }, [toast]);

  const fetchPurchaseOrderItems = useCallback(async (poId: string) => {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select(`*, product:products(id, name, sku)`)
      .eq('purchase_order_id', poId);

    if (error) {
      toast({ title: 'Error fetching PO items', description: error.message, variant: 'destructive' });
      return [];
    }
    return data || [];
  }, [toast]);

  const createPurchaseOrder = useCallback(async (
    supplierId: string,
    items: { productId: string; quantity: number; unitCost: number }[],
    expectedDelivery?: string,
    notes?: string
  ) => {
    const { data: poNumber } = await supabase.rpc('generate_po_number');
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const taxAmount = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + taxAmount;

    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: poNumber,
        supplier_id: supplierId,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        expected_delivery_date: expectedDelivery || null,
        notes: notes || null
      })
      .select()
      .single();

    if (poError) {
      toast({ title: 'Error creating purchase order', description: poError.message, variant: 'destructive' });
      return null;
    }

    const poItems = items.map(item => ({
      purchase_order_id: po.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      subtotal: item.quantity * item.unitCost
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(poItems);

    if (itemsError) {
      toast({ title: 'Error adding PO items', description: itemsError.message, variant: 'destructive' });
      return null;
    }

    toast({ title: 'Purchase order created successfully' });
    return po;
  }, [toast]);

  const updatePurchaseOrderStatus = useCallback(async (id: string, status: string) => {
    const { error } = await supabase
      .from('purchase_orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: `Purchase order ${status}` });
    return true;
  }, [toast]);

  return {
    suppliers,
    supplierProducts,
    purchaseOrders,
    loading,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSupplierProducts,
    linkProductToSupplier,
    unlinkProduct,
    fetchPurchaseOrders,
    fetchPurchaseOrderItems,
    createPurchaseOrder,
    updatePurchaseOrderStatus
  };
}
