import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string | null;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  reorder_level: number;
  barcode: string | null;
  image_url: string | null;
  is_active: boolean;
  expiry_date?: string;
  batch_number?: string;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([product]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
