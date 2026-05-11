import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Plus, Trash2, Building2, Users } from "lucide-react";
import {
  useAdminUsersWithMemberships, useAssignMembership, useBootstrapCorpAdmin,
  useCorpAdminCheck, useCorpAdminCount, useCreateOrganization,
  useOrganizations, useRemoveMembership,
  MEMBERSHIP_ROLES, ORG_TYPES,
  type AdminUserRow, type MembershipRole, type OrgType,
} from "@/hooks/use-org-admin";

export function OrgMembershipManager() {
  const { data: isCorpAdmin, isLoading: loadingCheck } = useCorpAdminCheck();
  const { data: corpAdminCount = 0 } = useCorpAdminCount();
  const enabled = !!isCorpAdmin;

  const { data: users = [], isLoading: loadingUsers } = useAdminUsersWithMemberships(enabled);
  const { data: orgs = [], isLoading: loadingOrgs } = useOrganizations(enabled);

  const [search, setSearch] = useState("");
  const [assignFor, setAssignFor] = useState<AdminUserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(s) ||
        u.full_name?.toLowerCase().includes(s) ||
        u.memberships?.some((m) => m.org_name.toLowerCase().includes(s))
    );
  }, [users, search]);

  if (loadingCheck) {
    return <div className="h-32 animate-pulse rounded bg-muted" />;
  }

  if (!isCorpAdmin) {
    return <BootstrapPanel hasAnyAdmin={corpAdminCount > 0} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Organizations ({orgs.length})
            </CardTitle>
            <CardDescription>Stores, providers, and corporate parents</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> New organization
          </Button>
        </CardHeader>
        <CardContent>
          {loadingOrgs ? (
            <div className="h-24 animate-pulse rounded bg-muted" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {orgs.map((o) => (
                <div key={o.id} className="rounded border p-3">
                  <div className="font-medium">{o.name}</div>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                    <Badge variant="outline">{o.type}</Badge>
                    {o.region && <span>{o.region}</span>}
                  </div>
                </div>
              ))}
              {orgs.length === 0 && (
                <div className="text-sm text-muted-foreground">No organizations yet.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Users & Memberships
          </CardTitle>
          <CardDescription>
            Assign users to organizations and roles. Without a membership, RLS hides everything from them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by email, name, or org…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 max-w-md"
          />

          {loadingUsers ? (
            <div className="h-32 animate-pulse rounded bg-muted" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Memberships</TableHead>
                  <TableHead className="w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <UserRow key={u.user_id} user={u} onAssign={() => setAssignFor(u)} />
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
                      No users match.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AssignMembershipDialog
        user={assignFor}
        orgs={orgs.map((o) => ({ id: o.id, name: o.name, type: o.type }))}
        onClose={() => setAssignFor(null)}
      />
    </div>
  );
}

function UserRow({ user, onAssign }: { user: AdminUserRow; onAssign: () => void }) {
  const remove = useRemoveMembership();
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{user.full_name || user.email}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </TableCell>
      <TableCell>
        {user.memberships?.length ? (
          <div className="flex flex-wrap gap-1">
            {user.memberships.map((m) => (
              <Badge key={m.membership_id} variant="secondary" className="gap-1">
                {m.org_name} · {m.role}
                <button
                  className="ml-1 opacity-60 hover:opacity-100"
                  onClick={() => remove.mutate(m.membership_id)}
                  title="Remove membership"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No memberships — locked out by RLS</span>
        )}
      </TableCell>
      <TableCell>
        <Button size="sm" variant="outline" onClick={onAssign}>
          <Plus className="h-3 w-3 mr-1" /> Assign
        </Button>
      </TableCell>
    </TableRow>
  );
}

function BootstrapPanel({ hasAnyAdmin }: { hasAnyAdmin: boolean }) {
  const [orgName, setOrgName] = useState("Master Corporation");
  const bootstrap = useBootstrapCorpAdmin();

  if (hasAnyAdmin) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Corp admin access required</AlertTitle>
        <AlertDescription>
          You are not a corp_admin. Ask an existing corp_admin to grant you the role.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> First-run bootstrap
        </CardTitle>
        <CardDescription>
          No corp_admin exists yet. Claim ownership by creating the first corporation org and your corp_admin membership.
          This works only once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-w-md">
        <div className="space-y-1">
          <Label>Corporation name</Label>
          <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
        <Button
          onClick={() => bootstrap.mutate(orgName)}
          disabled={bootstrap.isPending || !orgName.trim()}
        >
          {bootstrap.isPending ? "Granting…" : "Grant me corp_admin"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CreateOrgDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>("store");
  const [region, setRegion] = useState("");
  const create = useCreateOrganization();

  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), type, region: region || null });
    setName(""); setRegion(""); setType("store");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>Create a store, provider, or corporation.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as OrgType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORG_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Region (optional)</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending || !name.trim()}>
            {create.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignMembershipDialog({
  user, orgs, onClose,
}: {
  user: AdminUserRow | null;
  orgs: { id: string; name: string; type: OrgType }[];
  onClose: () => void;
}) {
  const [orgId, setOrgId] = useState<string>("");
  const [role, setRole] = useState<MembershipRole>("store_admin");
  const assign = useAssignMembership();

  const submit = async () => {
    if (!user || !orgId) return;
    await assign.mutateAsync({ user_id: user.user_id, org_id: orgId, role });
    setOrgId(""); setRole("store_admin");
    onClose();
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign membership</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Organization</Label>
            <Select value={orgId} onValueChange={setOrgId}>
              <SelectTrigger><SelectValue placeholder="Select organization" /></SelectTrigger>
              <SelectContent>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name} ({o.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MembershipRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEMBERSHIP_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!orgId || assign.isPending}>
            {assign.isPending ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
