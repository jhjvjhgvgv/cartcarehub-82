import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  ShoppingCart, 
  ClipboardList, 
  Clock,
  CheckCircle,
  Plus,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Issue {
  id: string;
  created_at: string;
  store_org_id: string;
  cart_id: string;
  detected_by: string | null;
  inspection_id: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved_at: string | null;
  resolved_by: string | null;
  est_cost: number | null;
  actual_cost: number | null;
  category: string | null;
  description: string | null;
  status: string;
  asset_tag: string | null;
  qr_token: string | null;
  cart_model: string | null;
}

interface IssueListProps {
  storeOrgId?: string;
}

export function IssueList({ storeOrgId }: IssueListProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [workOrderNotes, setWorkOrderNotes] = useState('');
  const [workOrderSummary, setWorkOrderSummary] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch issues from issues_with_cart view
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', storeOrgId, severityFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('issues_with_cart')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (storeOrgId) {
        query = query.eq('store_org_id', storeOrgId);
      }
      
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter as 'low' | 'medium' | 'high' | 'critical');
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Issue[];
    }
  });

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (issue: Issue) => {
      // Create work order
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .insert({
          store_org_id: issue.store_org_id,
          summary: workOrderSummary || `Issue: ${issue.category || 'General'} - ${issue.description?.substring(0, 100) || 'No description'}`,
          notes: workOrderNotes || `Created from issue ${issue.id}\n\nCart: ${issue.asset_tag || issue.qr_token}\nSeverity: ${issue.severity}\nDescription: ${issue.description}`,
          status: 'new'
        })
        .select()
        .single();
      
      if (workOrderError) throw workOrderError;
      
      // Update issue status to in_progress
      const { error: issueError } = await supabase
        .from('issues')
        .update({ status: 'in_progress' })
        .eq('id', issue.id);
      
      if (issueError) throw issueError;
      
      return workOrder;
    },
    onSuccess: () => {
      toast({
        title: "Work Order Created",
        description: "The issue has been assigned to a new work order.",
      });
      setIsCreateDialogOpen(false);
      setSelectedIssue(null);
      setWorkOrderNotes('');
      setWorkOrderSummary('');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create work order: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Resolve issue mutation
  const resolveIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { error } = await supabase
        .from('issues')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', issueId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Issue Resolved",
        description: "The issue has been marked as resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to resolve issue: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[severity] || variants.low}>
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'open': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={variants[status] || variants.open}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleCreateWorkOrder = (issue: Issue) => {
    setSelectedIssue(issue);
    setWorkOrderSummary(`Issue: ${issue.category || 'General'} - ${issue.description?.substring(0, 50) || 'No description'}`);
    setWorkOrderNotes(`Cart: ${issue.asset_tag || issue.qr_token}\nSeverity: ${issue.severity}\n\n${issue.description || ''}`);
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Issues
        </CardTitle>
        <CardDescription>
          View and manage cart issues. Create work orders to assign repairs.
        </CardDescription>
        
        {/* Filters */}
        <div className="flex gap-4 pt-4">
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Open" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>No issues found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {issue.asset_tag || issue.qr_token || 'Unknown Cart'}
                      </span>
                      {getSeverityBadge(issue.severity)}
                      {getStatusBadge(issue.status)}
                    </div>
                    
                    {issue.category && (
                      <p className="text-sm font-medium text-muted-foreground">
                        Category: {issue.category}
                      </p>
                    )}
                    
                    {issue.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(issue.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {issue.est_cost && (
                        <span>Est. Cost: ${issue.est_cost}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {issue.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => handleCreateWorkOrder(issue)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Work Order
                      </Button>
                    )}
                    {issue.status !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveIssueMutation.mutate(issue.id)}
                        disabled={resolveIssueMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Work Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Create Work Order
            </DialogTitle>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Issue Details</p>
                <p className="text-sm text-muted-foreground">
                  Cart: {selectedIssue.asset_tag || selectedIssue.qr_token}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getSeverityBadge(selectedIssue.severity)}
                  {getStatusBadge(selectedIssue.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Input
                  id="summary"
                  value={workOrderSummary}
                  onChange={(e) => setWorkOrderSummary(e.target.value)}
                  placeholder="Brief summary of the work order"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={workOrderNotes}
                  onChange={(e) => setWorkOrderNotes(e.target.value)}
                  placeholder="Additional notes for the technician..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedIssue && createWorkOrderMutation.mutate(selectedIssue)}
              disabled={createWorkOrderMutation.isPending}
            >
              {createWorkOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Work Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
