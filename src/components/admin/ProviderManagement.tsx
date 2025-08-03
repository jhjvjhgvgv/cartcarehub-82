import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  UserCheck, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface Provider {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export function ProviderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select(`
          *,
          profiles!maintenance_providers_user_id_fkey(email, display_name, last_sign_in)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: providerStats } = useQuery({
    queryKey: ['admin-provider-stats'],
    queryFn: async () => {
      // Get provider performance statistics
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select('provider_id, status, completed_date, created_at, cost');
      
      if (error) throw error;

      const stats = requests?.reduce((acc, request) => {
        if (!acc[request.provider_id]) {
          acc[request.provider_id] = {
            total: 0,
            completed: 0,
            totalCost: 0,
            avgCompletionTime: 0
          };
        }
        
        acc[request.provider_id].total++;
        
        if (request.status === 'completed') {
          acc[request.provider_id].completed++;
          if (request.cost) {
            acc[request.provider_id].totalCost += Number(request.cost);
          }
        }
        
        return acc;
      }, {} as Record<string, any>);

      return stats || {};
    }
  });

  const verifyProviderMutation = useMutation({
    mutationFn: async ({ providerId, isVerified }: { providerId: string; isVerified: boolean }) => {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .update({
          is_verified: isVerified,
          verification_date: isVerified ? new Date().toISOString() : null
        })
        .eq('id', providerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      toast({
        title: "Success",
        description: `Provider ${variables.isVerified ? 'verified' : 'unverified'} successfully.`,
      });
      setIsVerificationDialogOpen(false);
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
    const matchesSearch = provider.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "verified" && provider.is_verified) ||
                         (filterStatus === "unverified" && !provider.is_verified);
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

  const handleVerifyProvider = (provider: Provider) => {
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
                  placeholder="Search by company name or email..."
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
            All registered maintenance providers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading providers...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
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
                    
                    return (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {provider.company_name}
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
                            <div className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {provider.contact_email}
                            </div>
                            {provider.contact_phone && (
                              <div className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {provider.contact_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {stats ? (
                              <>
                                <div className="text-sm">
                                  {stats.completed}/{stats.total} completed
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${stats.totalCost?.toLocaleString() || 0} total
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
                            {provider.is_verified ? (
                              <>
                                <Badge variant="default" className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                                {provider.verification_date && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatDistance(new Date(provider.verification_date), new Date(), { addSuffix: true })}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1">
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
                          <div className="flex gap-2">
                            <Button
                              variant={provider.is_verified ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleVerifyProvider(provider)}
                            >
                              {provider.is_verified ? (
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
                          </div>
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
              {selectedProvider?.is_verified ? 'Revoke Verification' : 'Verify Provider'}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider?.is_verified 
                ? 'Are you sure you want to revoke verification for this provider?'
                : 'Verify this maintenance provider to allow them to accept requests.'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">{selectedProvider.company_name}</h4>
                <p className="text-sm text-muted-foreground">{selectedProvider.contact_email}</p>
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
                    isVerified: !selectedProvider.is_verified
                  })}
                  disabled={verifyProviderMutation.isPending}
                  variant={selectedProvider.is_verified ? "destructive" : "default"}
                >
                  {selectedProvider.is_verified ? 'Revoke Verification' : 'Verify Provider'}
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