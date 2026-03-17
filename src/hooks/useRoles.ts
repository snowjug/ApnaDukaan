import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export type AppRole = 'admin' | 'manager' | 'cashier';

interface UseRolesReturn {
  roles: AppRole[];
  isAdmin: boolean;
  isManager: boolean;
  isCashier: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useAppSelector((state) => state.auth.session);
  const userId = session?.user?.id;

  const fetchRoles = useCallback(async () => {
    if (!userId) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_roles', {
        _user_id: userId,
      });

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } else {
        setRoles((data as AppRole[]) || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback(
    (role: AppRole) => roles.includes(role),
    [roles]
  );

  const hasAnyRole = useCallback(
    (checkRoles: AppRole[]) => checkRoles.some((role) => roles.includes(role)),
    [roles]
  );

  return {
    roles,
    isAdmin: roles.includes('admin'),
    isManager: roles.includes('manager'),
    isCashier: roles.includes('cashier'),
    hasRole,
    hasAnyRole,
    isLoading,
    refetch: fetchRoles,
  };
};

// Hook for managing users and their roles (admin only)
export const useUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        roles: userRoles
          ?.filter((ur) => ur.user_id === profile.id)
          .map((ur) => ur.role) || [],
      })) || [];

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignRole = useCallback(async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });

    if (error) {
      if (error.code === '23505') {
        // Unique violation - role already exists
        return { success: false, error: 'User already has this role' };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  const removeRole = useCallback(async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    assignRole,
    removeRole,
  };
};
