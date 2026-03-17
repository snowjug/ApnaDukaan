import { ReactNode } from 'react';
import { useRoles, AppRole } from '@/hooks/useRoles';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallback?: ReactNode;
}

export const RoleGuard = ({ children, allowedRoles, fallback = null }: RoleGuardProps) => {
  const { hasAnyRole, isLoading } = useRoles();

  if (isLoading) {
    return null;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Permission constants for different features
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: ['admin', 'manager', 'cashier'] as AppRole[],
  
  // POS
  USE_POS: ['admin', 'manager', 'cashier'] as AppRole[],
  APPLY_DISCOUNTS: ['admin', 'manager'] as AppRole[],
  
  // Products
  VIEW_PRODUCTS: ['admin', 'manager', 'cashier'] as AppRole[],
  MANAGE_PRODUCTS: ['admin', 'manager'] as AppRole[],
  
  // Inventory
  VIEW_INVENTORY: ['admin', 'manager', 'cashier'] as AppRole[],
  MANAGE_INVENTORY: ['admin', 'manager'] as AppRole[],
  
  // Sales
  VIEW_SALES: ['admin', 'manager'] as AppRole[],
  VIEW_OWN_SALES: ['admin', 'manager', 'cashier'] as AppRole[],
  
  // Reports
  VIEW_REPORTS: ['admin', 'manager'] as AppRole[],
  VIEW_FINANCIAL_REPORTS: ['admin'] as AppRole[],
  
  // Suppliers
  VIEW_SUPPLIERS: ['admin', 'manager'] as AppRole[],
  MANAGE_SUPPLIERS: ['admin', 'manager'] as AppRole[],
  
  // Customers
  VIEW_CUSTOMERS: ['admin', 'manager', 'cashier'] as AppRole[],
  MANAGE_CUSTOMERS: ['admin', 'manager'] as AppRole[],
  
  // Users
  MANAGE_USERS: ['admin'] as AppRole[],
  
  // Settings
  MANAGE_SETTINGS: ['admin'] as AppRole[],
};
