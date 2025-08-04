import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clearAllAppData, refreshAppState } from "@/utils/app-refresh";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Trash2, 
  AlertTriangle,
  CheckCircle 
} from "lucide-react";

export const AppDataManager = () => {
  const { toast } = useToast();

  const handleClearData = () => {
    try {
      clearAllAppData();
      toast({
        title: "Data Cleared",
        description: "All cached data has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear app data.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshApp = () => {
    try {
      refreshAppState();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh app state.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          App Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Use these tools if you've deleted accounts from Supabase or need to start fresh.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3">
          <Button 
            onClick={handleClearData}
            variant="outline"
            className="gap-2 justify-start"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cached Data
          </Button>
          
          <Button 
            onClick={handleRefreshApp}
            className="gap-2 justify-start"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh App State
          </Button>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            "Refresh App State" will clear all data and reload the page for a completely fresh start.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};