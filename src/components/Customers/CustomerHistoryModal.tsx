import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useCustomerHistory } from '@/hooks/useCustomers';
import type { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;

interface CustomerHistoryModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerHistoryModal = ({ customer, onClose }: CustomerHistoryModalProps) => {
  const { history, isLoading, totalSpent, totalOrders } = useCustomerHistory(customer?.id || null);

  if (!customer) return null;

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Purchase History - {customer.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{customer.loyalty_points}</div>
              <div className="text-sm text-muted-foreground">Loyalty Points</div>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No purchase history found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.sale_number}</TableCell>
                    <TableCell>
                      {format(new Date(sale.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sale.sale_items?.slice(0, 2).map((item: any) => (
                          <div key={item.id}>
                            {item.product_name} x{item.quantity}
                          </div>
                        ))}
                        {sale.sale_items?.length > 2 && (
                          <span className="text-muted-foreground">
                            +{sale.sale_items.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{Number(sale.total_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
