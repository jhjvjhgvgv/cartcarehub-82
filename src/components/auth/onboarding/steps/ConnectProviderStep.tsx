import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, ArrowRight, Search, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  name: string;
  market: string | null;
  region: string | null;
}

interface ConnectProviderStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ConnectProviderStep = ({ onComplete, onSkip }: ConnectProviderStepProps) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, market, region')
        .eq('type', 'provider')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedProvider) return;

    setConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's store org
      const { data: membership, error: membershipError } = await supabase
        .from('org_memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) throw membershipError;

      // Create connection request
      const { error: linkError } = await supabase
        .from('provider_store_links')
        .insert({
          provider_org_id: selectedProvider,
          store_org_id: membership.org_id,
          status: 'pending'
        });

      if (linkError) {
        if (linkError.code === '23505') {
          toast({
            title: "Already Connected",
            description: "You already have a connection with this provider.",
          });
        } else {
          throw linkError;
        }
      } else {
        toast({
          title: "Connection Request Sent",
          description: "The provider will be notified of your request.",
        });
      }

      // Update onboarding status
      await supabase
        .from('user_onboarding')
        .update({ provider_connected: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      onComplete();
    } catch (err: any) {
      console.error('Error connecting to provider:', err);
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to send connection request.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.market?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="mx-auto mb-4">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Connect with a Maintenance Provider</CardTitle>
        <CardDescription className="text-center">
          Partner with a maintenance provider to keep your carts in top condition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProvider === provider.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{provider.name}</p>
                        {(provider.market || provider.region) && (
                          <p className="text-sm text-muted-foreground">
                            {[provider.market, provider.region].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      {selectedProvider === provider.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No providers found matching "{searchQuery}"
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 border rounded-lg bg-muted/50 text-center">
            <h3 className="font-semibold mb-2">No Providers Available Yet</h3>
            <p className="text-sm text-muted-foreground">
              No maintenance providers have registered in our system yet.
              You can skip this step and connect with a provider later from your settings.
            </p>
          </div>
        )}

        <div className="p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2 text-center">Benefits of Connecting</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Schedule regular maintenance automatically</li>
            <li>• Track repair history and costs</li>
            <li>• Get notified when carts need attention</li>
            <li>• Extend the life of your cart fleet</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
          {providers.length > 0 ? (
            <Button 
              onClick={handleConnect} 
              className="flex-1"
              disabled={!selectedProvider || connecting}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Connect
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={onComplete} className="flex-1">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
