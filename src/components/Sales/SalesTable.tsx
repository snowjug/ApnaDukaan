import { Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface Sale {
  id: string;
  sale_number: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  sale_items?: any[];
}

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  onViewReceipt: (sale: Sale) => void;
}

export function SalesTable({ sales, loading, onViewReceipt }: SalesTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No sales found</h3>
        <p className="text-muted-foreground">
          No transactions match your search criteria
        </p>
      </div>
    );
  }

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      cash: 'default',
      card: 'secondary',
      mobile: 'outline',
      other: 'outline',
    };
    return variants[method] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      pending: 'secondary',
      refunded: 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale #</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.sale_number}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {format(new Date(sale.created_at), 'PP')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(sale.created_at), 'p')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {sale.sale_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">
                      ₹{Number(sale.total_amount).toFixed(2)}
                    </div>
                    {sale.discount_amount > 0 && (
                      <div className="text-xs text-green-600">
                        -₹{Number(sale.discount_amount).toFixed(2)} discount
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentMethodBadge(sale.payment_method)}>
                    {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(sale.payment_status)}>
                    {sale.payment_status.charAt(0).toUpperCase() + sale.payment_status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReceipt(sale)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Receipt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sales.map((sale) => (
          <Card key={sale.id} className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm text-muted-foreground">Sale Number</div>
                  <div className="font-bold text-base">{sale.sale_number}</div>
                </div>
                <Badge variant={getStatusBadge(sale.payment_status)}>
                  {sale.payment_status.charAt(0).toUpperCase() + sale.payment_status.slice(1)}
                </Badge>
              </div>

              {/* Date & Time */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(new Date(sale.created_at), 'PP')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{format(new Date(sale.created_at), 'p')}</span>
              </div>

              {/* Items & Payment */}
              <div className="flex justify-between items-center">
                <Badge variant="secondary">
                  {sale.sale_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                </Badge>
                <Badge variant={getPaymentMethodBadge(sale.payment_method)}>
                  {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                </Badge>
              </div>

              {/* Amount */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">
                      ₹{Number(sale.total_amount).toFixed(2)}
                    </div>
                    {sale.discount_amount > 0 && (
                      <div className="text-xs text-green-600">
                        -₹{Number(sale.discount_amount).toFixed(2)} discount
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onViewReceipt(sale)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Receipt
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
