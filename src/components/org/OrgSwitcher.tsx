import React from 'react';
import { useOrg, isStoreRole, isCorpRole, isProviderRole } from '@/contexts/OrgContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Store, Wrench } from 'lucide-react';

export const OrgSwitcher: React.FC = () => {
  const { memberships, activeOrgId, setActiveOrgId, activeOrg } = useOrg();

  if (memberships.length <= 1) {
    // Don't show switcher if only one org
    return activeOrg ? (
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-md">
        <OrgIcon type={activeOrg.type} />
        <span className="font-medium text-sm">{activeOrg.name}</span>
      </div>
    ) : null;
  }

  return (
    <Select value={activeOrgId || undefined} onValueChange={setActiveOrgId}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {memberships.map((membership) => (
          <SelectItem key={membership.id} value={membership.org_id}>
            <div className="flex items-center gap-2">
              <OrgIcon type={membership.organization.type} />
              <div className="flex flex-col">
                <span className="font-medium">{membership.organization.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRole(membership.role)}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const OrgIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'corporation':
      return <Building2 className="h-4 w-4 text-primary" />;
    case 'provider':
      return <Wrench className="h-4 w-4 text-orange-500" />;
    default:
      return <Store className="h-4 w-4 text-green-500" />;
  }
};

const formatRole = (role: string): string => {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
