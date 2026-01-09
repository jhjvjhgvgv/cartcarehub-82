import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Clock, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface ProviderVerification {
  id: string;
  org_id: string;
  user_id: string;
  license_number: string | null;
  insurance_provider: string | null;
  service_description: string | null;
  service_areas: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  organization?: {
    name: string;
  };
  user_profile?: {
    full_name: string | null;
  };
}

export const ProviderVerificationPanel = () => {
  const [verifications, setVerifications] = useState<ProviderVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<ProviderVerification | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('provider_verifications')
        .select(`
          *,
          organization:organizations(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformed = (data || []).map(v => ({
        ...v,
        status: v.status as 'pending' | 'approved' | 'rejected',
        organization: v.organization as unknown as { name: string } | undefined,
      }));
      
      setVerifications(transformed);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedVerification) return;
    
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates: Record<string, unknown> = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      if (action === 'reject' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('provider_verifications')
        .update(updates)
        .eq('id', selectedVerification.id);

      if (error) throw error;

      // Update organization verification status
      await supabase
        .from('organizations')
        .update({
          settings: {
            verification_status: action === 'approve' ? 'verified' : 'rejected',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedVerification.org_id);

      toast.success(`Provider ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      
      setSelectedVerification(null);
      setActionType(null);
      setRejectionReason('');
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <CardTitle>Provider Verification</CardTitle>
            <CardDescription>
              Review and approve maintenance provider applications
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingCount} pending</Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No verification requests yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service Areas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell className="font-medium">
                    {verification.organization?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {verification.user_profile?.full_name || 'No name'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {verification.service_areas?.slice(0, 3).map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                      {verification.service_areas?.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{verification.service_areas.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(verification.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(verification.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVerification(verification);
                          setActionType('view');
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {verification.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              setSelectedVerification(verification);
                              setActionType('approve');
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedVerification(verification);
                              setActionType('reject');
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* View Details Dialog */}
        <Dialog open={actionType === 'view'} onOpenChange={() => { setActionType(null); setSelectedVerification(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Verification Details</DialogTitle>
              <DialogDescription>
                {selectedVerification?.organization?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedVerification && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact</label>
                    <p>{selectedVerification.user_profile?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedVerification.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Number</label>
                    <p>{selectedVerification.license_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Insurance Provider</label>
                    <p>{selectedVerification.insurance_provider || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Areas</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVerification.service_areas?.map((area, i) => (
                      <Badge key={i} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Description</label>
                  <p className="mt-1 text-sm">{selectedVerification.service_description || 'Not provided'}</p>
                </div>
                {selectedVerification.rejection_reason && (
                  <div>
                    <label className="text-sm font-medium text-destructive">Rejection Reason</label>
                    <p className="mt-1 text-sm text-destructive">{selectedVerification.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedVerification?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setActionType('reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => setActionType('approve')}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation */}
        <Dialog open={actionType === 'approve'} onOpenChange={() => { setActionType(null); setSelectedVerification(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Provider</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve {selectedVerification?.organization?.name}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
              <Button onClick={() => handleAction('approve')} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={actionType === 'reject'} onOpenChange={() => { setActionType(null); setSelectedVerification(null); setRejectionReason(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Provider</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting {selectedVerification?.organization?.name}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionType(null); setRejectionReason(''); }}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => handleAction('reject')} 
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
