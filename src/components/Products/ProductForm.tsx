import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/Barcode/BarcodeScanner';
import { Camera } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(), // Auto-generated, so optional
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Selling price is required').refine(
    (val) => parseFloat(val) > 0,
    { message: 'Selling price must be greater than 0' }
  ),
  cost: z.string().min(1, 'Cost price is required').refine(
    (val) => parseFloat(val) > 0,
    { message: 'Cost price must be greater than 0' }
  ),
  stock: z.string().min(1, 'Stock quantity is required').refine(
    (val) => parseInt(val) >= 0,
    { message: 'Stock must be 0 or greater' }
  ),
  reorder_level: z.string().min(1, 'Reorder level is required').refine(
    (val) => parseInt(val) >= 0,
    { message: 'Reorder level must be 0 or greater' }
  ),
  barcode: z.string().optional(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  onSuccess: () => void;
}

export function ProductForm({ open, onClose, productId, onSuccess }: ProductFormProps) {
  const { categories } = useCategories();
  const { getProduct, createProduct, updateProduct } = useProducts();
  const { toast } = useToast();
  const [scannerOpen, setScannerOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category_id: '',
      description: '',
      price: '0',
      cost: '0',
      stock: '0',
      reorder_level: '10',
      barcode: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (productId && open) {
      loadProduct();
    } else if (!open) {
      form.reset();
    }
  }, [productId, open]);

  // Auto-generate SKU when name or category changes (only for new products)
  useEffect(() => {
    if (!productId) {
      const name = form.watch('name');
      const categoryId = form.watch('category_id');

      if (name) {
        const category = categories.find(c => c.id === categoryId);
        const generatedSku = generateSKU(name, category?.name);
        form.setValue('sku', generatedSku);
      }
    }
  }, [form.watch('name'), form.watch('category_id'), productId, categories]);

  // Function to generate SKU from product name and category
  const generateSKU = (productName: string, categoryName?: string) => {
    // Get category prefix (first 3 letters, uppercase)
    const categoryPrefix = categoryName
      ? categoryName.substring(0, 3).toUpperCase()
      : 'GEN'; // Default to 'GEN' for General if no category

    // Get product name prefix (first 3 letters of each word, uppercase)
    const nameWords = productName.trim().split(/\s+/);
    const namePrefix = nameWords
      .slice(0, 2) // Take first 2 words
      .map(word => word.substring(0, 3).toUpperCase())
      .join('');

    // Generate random number (4 digits)
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // Format: CATEGORY-NAME-####
    return `${categoryPrefix}-${namePrefix}-${randomNum}`;
  };

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    form.setValue('barcode', barcode);
    sonnerToast.success(`Barcode scanned: ${barcode}`);
    setScannerOpen(false);
  };

  const loadProduct = async () => {
    const product = await getProduct(productId!);
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id || '',
        description: product.description || '',
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        reorder_level: product.reorder_level.toString(),
        barcode: product.barcode || '',
        is_active: product.is_active,
      });
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Ensure SKU is generated for new products
      let finalSku = data.sku;
      if (!productId && !finalSku) {
        const category = categories.find(c => c.id === data.category_id);
        finalSku = generateSKU(data.name, category?.name);
      }

      const productData = {
        name: data.name,
        sku: finalSku || generateSKU(data.name), // Fallback generation
        category_id: data.category_id || null,
        description: data.description || null,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock),
        reorder_level: parseInt(data.reorder_level),
        barcode: data.barcode || null,
        image_url: null,
        is_active: data.is_active,
      };

      if (productId) {
        await updateProduct(productId, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${productId ? 'update' : 'create'} product`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {productId ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {productId
              ? 'Update the product details below'
              : 'Fill in the details to add a new product to your inventory'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" className="h-10 border-2 focus:border-primary/50 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">SKU (Auto-generated)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Auto-generated"
                        readOnly
                        disabled={!productId}
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter product description" className="border-2 focus:border-primary/50 transition-all resize-none" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Selling Price *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" className="h-10 border-2 focus:border-primary/50 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Cost Price *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" className="h-10 border-2 focus:border-primary/50 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Stock Quantity *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" className="h-10 border-2 focus:border-primary/50 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Reorder Level *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="10" className="h-10 border-2 focus:border-primary/50 transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                    Barcode
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setScannerOpen(true)}
                      className="h-6 px-2 text-xs"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1" />
                      Scan
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter barcode or scan" className="h-10 border-2 focus:border-primary/50 transition-all" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <BarcodeScanner
              open={scannerOpen}
              onClose={() => setScannerOpen(false)}
              onScan={handleBarcodeScan}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border-2 p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this product
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} size="lg">
                Cancel
              </Button>
              <Button type="submit" size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                {productId ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
