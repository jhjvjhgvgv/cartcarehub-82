import React, { useEffect, useState } from 'react';
import { useOrg } from '@/contexts/OrgContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, QrCode, Printer, Pencil, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

interface Cart {
  id: string;
  asset_tag: string | null;
  qr_token: string;
  status: 'in_service' | 'out_of_service' | 'retired';
  model: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const StoreCarts: React.FC = () => {
  const { activeOrgId, activeOrg } = useOrg();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingCart, setEditingCart] = useState<Cart | null>(null);
  
  // Form state
  const [assetTag, setAssetTag] = useState('');
  const [model, setModel] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Cart['status']>('in_service');
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPrefix, setBulkPrefix] = useState('CART-');

  useEffect(() => {
    if (activeOrgId) {
      fetchCarts();
    }
  }, [activeOrgId]);

  const fetchCarts = async () => {
    if (!activeOrgId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('store_org_id', activeOrgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCarts(data || []);
    } catch (error) {
      console.error('Error fetching carts:', error);
      toast.error('Failed to load carts');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAssetTag('');
    setModel('');
    setNotes('');
    setStatus('in_service');
  };

  const handleAddCart = async () => {
    if (!activeOrgId) return;

    try {
      const newCart = {
        store_org_id: activeOrgId,
        asset_tag: assetTag.trim() || null,
        qr_token: uuidv4(),
        model: model.trim() || null,
        notes: notes.trim() || null,
        status,
      };

      const { error } = await supabase.from('carts').insert(newCart);

      if (error) throw error;

      toast.success('Cart added successfully');
      setIsAddOpen(false);
      resetForm();
      fetchCarts();
    } catch (error) {
      console.error('Error adding cart:', error);
      toast.error('Failed to add cart');
    }
  };

  const handleBulkAdd = async () => {
    if (!activeOrgId || bulkCount < 1) return;

    try {
      const newCarts = Array.from({ length: bulkCount }, (_, i) => ({
        store_org_id: activeOrgId,
        asset_tag: `${bulkPrefix}${String(i + 1).padStart(4, '0')}`,
        qr_token: uuidv4(),
        status: 'in_service' as const,
      }));

      const { error } = await supabase.from('carts').insert(newCarts);

      if (error) throw error;

      toast.success(`${bulkCount} carts added successfully`);
      setIsBulkOpen(false);
      setBulkCount(10);
      setBulkPrefix('CART-');
      fetchCarts();
    } catch (error) {
      console.error('Error bulk adding carts:', error);
      toast.error('Failed to add carts');
    }
  };

  const handleEditCart = async () => {
    if (!editingCart) return;

    try {
      const { error } = await supabase
        .from('carts')
        .update({
          asset_tag: assetTag.trim() || null,
          model: model.trim() || null,
          notes: notes.trim() || null,
          status,
        })
        .eq('id', editingCart.id);

      if (error) throw error;

      toast.success('Cart updated successfully');
      setEditingCart(null);
      resetForm();
      fetchCarts();
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const openEditDialog = (cart: Cart) => {
    setEditingCart(cart);
    setAssetTag(cart.asset_tag || '');
    setModel(cart.model || '');
    setNotes(cart.notes || '');
    setStatus(cart.status);
  };

  const filteredCarts = carts.filter(cart =>
    cart.asset_tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cart.qr_token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cart.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Cart['status']) => {
    switch (status) {
      case 'in_service':
        return <Badge variant="default" className="bg-green-500">In Service</Badge>;
      case 'out_of_service':
        return <Badge variant="secondary" className="bg-amber-500 text-white">Out of Service</Badge>;
      case 'retired':
        return <Badge variant="outline">Retired</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Carts</h1>
          <p className="text-muted-foreground">{activeOrg?.name} - {carts.length} carts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" /> Add Cart
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Cart</DialogTitle>
                <DialogDescription>Add a new shopping cart to your fleet</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset Tag</Label>
                  <Input
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    placeholder="e.g., CART-0001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., Standard, Mini, Large"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Cart['status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_service">In Service</SelectItem>
                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCart}>Add Cart</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Bulk Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Add Carts</DialogTitle>
                <DialogDescription>Add multiple carts at once with auto-generated asset tags</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of Carts</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asset Tag Prefix</Label>
                  <Input
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value)}
                    placeholder="e.g., CART-"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tags will be: {bulkPrefix}0001, {bulkPrefix}0002, etc.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkAdd}>Add {bulkCount} Carts</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link to="/store/print-qr">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" /> Print QR Labels
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by asset tag, QR token, or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Carts Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredCarts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-2" />
              <p>{searchQuery ? 'No carts match your search' : 'No carts yet. Add your first cart!'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Model</TableHead>
                  <TableHead className="hidden md:table-cell">QR Token</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell className="font-medium">
                      {cart.asset_tag || <span className="text-muted-foreground">No tag</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(cart.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cart.model || '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs">
                      {cart.qr_token.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cart)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Link to={`/scan/${cart.qr_token}`}>
                          <Button variant="ghost" size="icon">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCart} onOpenChange={(open) => !open && setEditingCart(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cart</DialogTitle>
            <DialogDescription>Update cart details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Asset Tag</Label>
              <Input
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Cart['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_service">In Service</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCart(null)}>Cancel</Button>
            <Button onClick={handleEditCart}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Missing import for ShoppingCart icon
import { ShoppingCart } from 'lucide-react';

export default StoreCarts;
