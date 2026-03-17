import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: { name: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([category]);

      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, category: { name?: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
