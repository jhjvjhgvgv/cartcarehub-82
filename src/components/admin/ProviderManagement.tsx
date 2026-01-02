import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle,
  XCircle,
  Clock,
  Star
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface ProviderOrg {
  id: string;
  name: string;
  created_at: string;
  settings: any;
}

export function ProviderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<ProviderOrg | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch provider organizations
  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-provider-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', 'provider')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProviderOrg[];
    }
  });

  // Fetch work order stats per provider
  const { data: providerStats } = useQuery({
    queryKey: ['admin-provider-work-stats'],
    queryFn: async () => {
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select('provider_org_id, status');
      
      if (error) throw error;

      const stats = (workOrders || []).reduce((acc, order) => {
        const providerId = order.provider_org_id;
        if (!providerId) return acc;
        
        if (!acc[providerId]) {
          acc[providerId] = { total: 0, completed: 0 };
        }
        
        acc[providerId].total++;
        if (order.status === 'completed') {
          acc[providerId].completed++;
        }
        
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      return stats;
    }
  });

  // Update provider verification (stored in settings JSON)
  const verifyProviderMutation = useMutation({
    mutationFn: async ({ providerId, isVerified }: { providerId: string; isVerified: boolean }) => {
      const provider = providers?.find(p => p.id === providerId);
      const currentSettings = provider?.settings || {};
      
      const { data, error } = await supabase
        .from('organizations')
        .update({
          settings: {
            ...currentSettings,
            is_verified: isVerified,
            verification_date: isVerified ? new Date().toISOString() : null,
            verification_notes: verificationNotes
          }
        })
        .eq('id', providerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-provider-orgs'] });
      toast({
        title: "Success",
        description: `Provider ${variables.isVerified ? 'verified' : 'unverified'} successfully.`,
      });
      setIsVerificationDialogOpen(false);
      setVerificationNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update provider verification.",
        variant: "destructive",
      });
    }
  });

  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = provider.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const isVerified = (provider.settings as any)?.is_verified === true;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "verified" && isVerified) ||
                         (filterStatus === "unverified" && !isVerified);
    return matchesSearch && matchesStatus;
  }) || [];

  const getProviderRating = (providerId: string) => {
    const stats = providerStats?.[providerId];
    if (!stats || stats.total === 0) return 0;
    
    const completionRate = (stats.completed / stats.total) * 100;
    if (completionRate >= 95) return 5;
    if (completionRate >= 85) return 4;
    if (completionRate >= 75) return 3;
    if (completionRate >= 60) return 2;
    return 1;
  };

  const handleVerifyProvider = (provider: ProviderOrg) => {
    setSelectedProvider(provider);
    setIsVerificationDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provider Management</h2>
          <p className="text-muted-foreground">Manage and verify maintenance providers</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by provider name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Verification Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Providers ({filteredProviders.length})</CardTitle>
          <CardDescription>
            All registered maintenance provider organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">Loading providers...</div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No providers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider) => {
                    const stats = providerStats?.[provider.id];
                    const rating = getProviderRating(provider.id);
                    const isVerified = (provider.settings as any)?.is_verified === true;
                    const verificationDate = (provider.settings as any)?.verification_date;
                    
                    return (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {provider.name}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({stats?.total || 0} jobs)
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {stats && stats.total > 0 ? (
                              <>
                                <div className="text-sm">
                                  {stats.completed}/{stats.total} completed
                                </div>
                                <Badge variant={
                                  stats.completed / stats.total >= 0.9 ? "default" : 
                                  stats.completed / stats.total >= 0.7 ? "secondary" : "destructive"
                                }>
                                  {Math.round((stats.completed / stats.total) * 100)}% rate
                                </Badge>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">No data</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {isVerified ? (
                              <>
                                <Badge variant="default" className="flex items-center gap-1 w-fit">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                                {verificationDate && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatDistance(new Date(verificationDate), new Date(), { addSuffix: true })}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistance(new Date(provider.created_at), new Date(), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={isVerified ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleVerifyProvider(provider)}
                          >
                            {isVerified ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Revoke
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {(selectedProvider?.settings as any)?.is_verified ? 'Revoke Verification' : 'Verify Provider'}
            </DialogTitle>
            <DialogDescription>
              {(selectedProvider?.settings as any)?.is_verified 
                ? 'Are you sure you want to revoke verification for this provider?'
                : 'Verify this maintenance provider to allow them to accept requests.'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium">{selectedProvider.name}</h4>
                <p className="text-sm text-muted-foreground">Provider Organization</p>
              </div>
              
              <div>
                <Label htmlFor="verification_notes">Notes (Optional)</Label>
                <Textarea
                  id="verification_notes"
                  placeholder="Add any verification notes..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => verifyProviderMutation.mutate({
                    providerId: selectedProvider.id,
                    isVerified: !(selectedProvider.settings as any)?.is_verified
                  })}
                  disabled={verifyProviderMutation.isPending}
                  variant={(selectedProvider.settings as any)?.is_verified ? "destructive" : "default"}
                >
                  {(selectedProvider.settings as any)?.is_verified ? 'Revoke Verification' : 'Verify Provider'}
                </Button>
                <Button variant="outline" onClick={() => setIsVerificationDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
