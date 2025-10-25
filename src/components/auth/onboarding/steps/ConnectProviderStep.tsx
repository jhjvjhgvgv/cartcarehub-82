import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowRight } from 'lucide-react';

interface ConnectProviderStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ConnectProviderStep = ({ onComplete, onSkip }: ConnectProviderStepProps) => {
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
        <div className="space-y-4 text-center">
          <div className="p-6 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Benefits of Connecting</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Schedule regular maintenance automatically</li>
              <li>• Track repair history and costs</li>
              <li>• Get notified when carts need attention</li>
              <li>• Extend the life of your cart fleet</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            You can connect with maintenance providers later from your settings page
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
          <Button onClick={onComplete} className="flex-1">
            Go to Settings
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
