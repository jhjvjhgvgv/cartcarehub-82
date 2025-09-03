import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Edit3, 
  Search,
  MoreHorizontal,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAdminUsers, useAdminManageUser, User } from "@/hooks/use-admin";
import { format } from "date-fns";

export function AdminUserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | 'update_role'>('activate');
  const [newRole, setNewRole] = useState<string>('');
  const [reason, setReason] = useState('');

  const { data: usersData, isLoading, error } = useAdminUsers(currentPage, 20);
  const manageUserMutation = useAdminManageUser();

  const filteredUsers = usersData?.data.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUserAction = async () => {
    if (!selectedUser) return;

    try {
      await manageUserMutation.mutateAsync({
        user_id: selectedUser.id,
        user_action: actionType,
        new_role: actionType === 'update_role' ? newRole : undefined,
        reason
      });

      setActionDialogOpen(false);
      setSelectedUser(null);
      setReason('');
      setNewRole('');
    } catch (error) {
      console.error('Failed to manage user:', error);
    }
  };

  const openActionDialog = (user: User, action: 'activate' | 'deactivate' | 'update_role') => {
    setSelectedUser(user);
    setActionType(action);
    setNewRole(user.role);
    setActionDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'store': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load users</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email, name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.display_name || user.email}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.company_name && (
                        <div className="text-xs text-muted-foreground">{user.company_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in ? (
                      <span className="text-sm">
                        {format(new Date(user.last_sign_in), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(user, 'deactivate')}
                          className="h-8"
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(user, 'activate')}
                          className="h-8"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(user, 'update_role')}
                        className="h-8"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Role
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {usersData?.pagination && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {usersData.pagination.total} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {usersData.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(usersData.pagination.pages, p + 1))}
                  disabled={currentPage === usersData.pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'activate' && 'Activate User'}
              {actionType === 'deactivate' && 'Deactivate User'}
              {actionType === 'update_role' && 'Update User Role'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  You are about to {actionType === 'update_role' ? 'update the role of' : actionType} user: <strong>{selectedUser.email}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'update_role' && (
              <div className="space-y-2">
                <Label htmlFor="role">New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUserAction}
                disabled={manageUserMutation.isPending}
                variant={actionType === 'deactivate' ? 'destructive' : 'default'}
              >
                {manageUserMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}