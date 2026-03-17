import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: 'admin' | 'manager' | 'cashier';
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      setProfile(profileData);
      setRoles(rolesData?.map((r: UserRole) => r.role) || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { full_name?: string; email?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // If email is being updated, also update auth email
      if (updates.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email,
        });
        if (authError) throw authError;
      }

      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user email found');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw new Error('Current password is incorrect');

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  return {
    profile,
    roles,
    loading,
    fetchProfile,
    updateProfile,
    changePassword,
  };
}
