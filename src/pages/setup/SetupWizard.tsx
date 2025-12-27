import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrg, getDashboardPath, MembershipRole } from '@/contexts/OrgContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Store, Wrench, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type AccountType = 'store' | 'corporation' | 'provider';

interface StoreEntry {
  name: string;
  market: string;
  region: string;
}

export const SetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const { refreshMemberships, setActiveOrgId } = useOrg();
  
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [orgName, setOrgName] = useState('');
  const [market, setMarket] = useState('');
  const [region, setRegion] = useState('');
  const [stores, setStores] = useState<StoreEntry[]>([{ name: '', market: '', region: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setStep(2);
  };

  const addStore = () => {
    setStores([...stores, { name: '', market: '', region: '' }]);
  };

  const removeStore = (index: number) => {
    if (stores.length > 1) {
      setStores(stores.filter((_, i) => i !== index));
    }
  };

  const updateStore = (index: number, field: keyof StoreEntry, value: string) => {
    const updated = [...stores];
    updated[index][field] = value;
    setStores(updated);
  };

  const handleSubmit = async () => {
    if (!accountType || !orgName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine org type and role
      let orgType: string;
      let ownerRole: MembershipRole;

      switch (accountType) {
        case 'corporation':
          orgType = 'corporation';
          ownerRole = 'corp_admin';
          break;
        case 'provider':
          orgType = 'provider';
          ownerRole = 'provider_admin';
          break;
        default:
          orgType = 'store';
          ownerRole = 'store_admin';
      }

      // Create the main organization
      const { data: mainOrgId, error: mainError } = await supabase.rpc('create_org_with_owner', {
        p_name: orgName.trim(),
        p_type: orgType as 'corporation' | 'store' | 'provider',
        p_owner_role: ownerRole,
        p_market: market.trim() || null,
        p_region: region.trim() || null,
      });

      if (mainError) {
        console.error('Error creating organization:', mainError);
        toast.error('Failed to create organization: ' + mainError.message);
        return;
      }

      const createdOrgId = mainOrgId as string;

      // If corporation, create child stores
      if (accountType === 'corporation' && stores.length > 0) {
        for (const store of stores) {
          if (store.name.trim()) {
            const { error: storeError } = await supabase.rpc('create_org_with_owner', {
              p_name: store.name.trim(),
              p_type: 'store',
              p_owner_role: 'store_admin',
              p_parent_org_id: createdOrgId,
              p_market: store.market.trim() || null,
              p_region: store.region.trim() || null,
            });

            if (storeError) {
              console.error('Error creating store:', storeError);
              toast.error(`Failed to create store "${store.name}": ${storeError.message}`);
            }
          }
        }
      }

      // Refresh memberships and set active org
      await refreshMemberships();
      setActiveOrgId(createdOrgId);

      toast.success('Organization created successfully!');

      // Navigate to appropriate dashboard
      const dashboardPath = getDashboardPath(ownerRole);
      navigate(dashboardPath, { replace: true });

    } catch (error) {
      console.error('Setup error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CartCare</CardTitle>
          <CardDescription>
            {step === 1 ? 'Choose your account type to get started' : 'Set up your organization'}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-3">
              <AccountTypeCard
                icon={<Store className="h-8 w-8" />}
                title="Single Store"
                description="Manage shopping carts for a single retail location"
                selected={accountType === 'store'}
                onClick={() => handleAccountTypeSelect('store')}
              />
              <AccountTypeCard
                icon={<Building2 className="h-8 w-8" />}
                title="Corporation"
                description="Manage multiple stores across different locations"
                selected={accountType === 'corporation'}
                onClick={() => handleAccountTypeSelect('corporation')}
              />
              <AccountTypeCard
                icon={<Wrench className="h-8 w-8" />}
                title="Service Provider"
                description="Provide maintenance services to stores"
                selected={accountType === 'provider'}
                onClick={() => handleAccountTypeSelect('provider')}
              />
            </div>
          )}

          {step === 2 && accountType && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">
                    {accountType === 'corporation' ? 'Corporation Name' : 
                     accountType === 'provider' ? 'Company Name' : 'Store Name'} *
                  </Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={
                      accountType === 'corporation' ? 'Acme Retail Corp' :
                      accountType === 'provider' ? 'CartFix Services' : 'Main Street Store'
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="market">Market</Label>
                    <Input
                      id="market"
                      value={market}
                      onChange={(e) => setMarket(e.target.value)}
                      placeholder="e.g., Grocery, Retail"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., Northeast, West Coast"
                    />
                  </div>
                </div>
              </div>

              {accountType === 'corporation' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Stores</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addStore}>
                      <Plus className="h-4 w-4 mr-1" /> Add Store
                    </Button>
                  </div>
                  
                  {stores.map((store, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 grid gap-2 md:grid-cols-3">
                        <Input
                          placeholder="Store name"
                          value={store.name}
                          onChange={(e) => updateStore(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Market"
                          value={store.market}
                          onChange={(e) => updateStore(index, 'market', e.target.value)}
                        />
                        <Input
                          placeholder="Region"
                          value={store.region}
                          onChange={(e) => updateStore(index, 'region', e.target.value)}
                        />
                      </div>
                      {stores.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStore(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    You can add more stores later from the Corp Dashboard.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !orgName.trim()}>
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface AccountTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const AccountTypeCard: React.FC<AccountTypeCardProps> = ({
  icon,
  title,
  description,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-6 rounded-lg border-2 text-left transition-all hover:border-primary/50 hover:bg-accent/50 ${
      selected ? 'border-primary bg-primary/5' : 'border-border'
    }`}
  >
    <div className="text-primary mb-3">{icon}</div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </button>
);

export default SetupWizard;
