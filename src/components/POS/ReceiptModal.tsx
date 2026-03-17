import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: any;
}

export function ReceiptModal({ open, onClose, sale }: ReceiptModalProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content')?.innerHTML;
    const blob = new Blob([`
      <html>
        <head>
          <title>Receipt - ${sale.sale_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${receiptContent}
          </div>
        </body>
      </html>
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${sale.sale_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sale Receipt</DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">ApnaDukaan</h2>
            <p className="text-sm text-muted-foreground">Inventory Management System</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(sale.created_at), 'PPpp')}
            </p>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Receipt #:</span>
              <span>{sale.sale_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payment Method:</span>
              <span className="capitalize">{sale.payment_method}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Items:</h3>
            {sale.items?.map((item: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">{item.product_name}</span>
                  <span>₹{item.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground pl-2">
                  <span>{item.quantity} x ₹{item.unit_price.toFixed(2)}</span>
                  <span className="text-xs">{item.product_sku}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{(sale.total_amount - sale.tax_amount + sale.discount_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>₹{sale.tax_amount.toFixed(2)}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-₹{sale.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{sale.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {sale.notes && (
            <>
              <Separator />
              <div className="text-sm">
                <span className="font-semibold">Notes: </span>
                <span className="text-muted-foreground">{sale.notes}</span>
              </div>
            </>
          )}

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Thank you for your business!</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
