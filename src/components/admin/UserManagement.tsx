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
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface User {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  company_name?: string;
  contact_phone?: string;
  is_active: boolean;
  last_sign_in?: string;
  created_at: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleToggleUserStatus = (user: User) => {
    updateUserMutation.mutate({
      userId: user.id,
      updates: { is_active: !user.is_active }
    });
  };

  const getUserStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    
    if (user.last_sign_in) {
      const lastSignIn = new Date(user.last_sign_in);
      const daysSinceLastSignIn = (Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastSignIn > 30) {
        return <Badge variant="secondary">Inactive (30+ days)</Badge>;
      } else if (daysSinceLastSignIn > 7) {
        return <Badge variant="outline">Recently Active</Badge>;
      } else {
        return <Badge variant="default">Active</Badge>;
      }
    }
    
    return <Badge variant="secondary">Never Signed In</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
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
                  placeholder="Search by email, name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            All registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.display_name || user.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.contact_phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.contact_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'admin' ? 'destructive' : 
                          user.role === 'maintenance' ? 'default' : 'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.company_name && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {user.company_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getUserStatusBadge(user)}</TableCell>
                      <TableCell>
                        {user.last_sign_in ? (
                          <div className="text-sm">
                            {formatDistance(new Date(user.last_sign_in), new Date(), { addSuffix: true })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistance(new Date(user.created_at), new Date(), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={user.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.is_active ? <Ban className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  defaultValue={selectedUser.display_name || ""}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    display_name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  defaultValue={selectedUser.company_name || ""}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    company_name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  defaultValue={selectedUser.contact_phone || ""}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    contact_phone: e.target.value
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={selectedUser.is_active}
                  onCheckedChange={(checked) => setSelectedUser({
                    ...selectedUser,
                    is_active: checked
                  })}
                />
                <Label htmlFor="is_active">Active Account</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => updateUserMutation.mutate({
                    userId: selectedUser.id,
                    updates: {
                      display_name: selectedUser.display_name,
                      company_name: selectedUser.company_name,
                      contact_phone: selectedUser.contact_phone,
                      is_active: selectedUser.is_active
                    }
                  })}
                  disabled={updateUserMutation.isPending}
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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