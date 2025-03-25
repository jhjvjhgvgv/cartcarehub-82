
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { EmergencyRepairDialog } from "@/components/customers/EmergencyRepairDialog";
import { InspectionRequestDialog } from "@/components/customers/InspectionRequestDialog";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the available quick actions
export const availableActions = [
  { id: "emergencyRepair", name: "Emergency Repair", component: EmergencyRepairDialog },
  { id: "inspectionRequest", name: "Inspection Request", component: InspectionRequestDialog },
  { id: "cartStatus", name: "Check Cart Status", path: "/customer/cart-status" },
  { id: "reportIssue", name: "Report an Issue", path: "/customer/report-issue" }
];

export function QuickActions() {
  // State to track which actions are enabled
  const [enabledActions, setEnabledActions] = useState<string[]>([]);
  
  // Load saved preferences on component mount
  useEffect(() => {
    const savedActions = localStorage.getItem("quickActions");
    if (savedActions) {
      setEnabledActions(JSON.parse(savedActions));
    } else {
      // Default: all actions enabled
      setEnabledActions(availableActions.map(action => action.id));
      localStorage.setItem("quickActions", JSON.stringify(availableActions.map(action => action.id)));
    }
  }, []);

  // Toggle an action on/off
  const toggleAction = (actionId: string) => {
    setEnabledActions(prev => {
      const newActions = prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId];
      
      // Save to localStorage
      localStorage.setItem("quickActions", JSON.stringify(newActions));
      return newActions;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Quick Actions</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Customize quick actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleAction(action.id)}
              >
                <input
                  type="checkbox"
                  checked={enabledActions.includes(action.id)}
                  onChange={() => {}} // Handled by onClick on the DropdownMenuItem
                  className="mr-1"
                />
                {action.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabledActions.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No quick actions enabled. Click the settings icon to customize.
          </div>
        ) : (
          availableActions
            .filter(action => enabledActions.includes(action.id))
            .map(action => {
              if (action.component) {
                const ActionComponent = action.component;
                return <ActionComponent key={action.id} />;
              } else if (action.path) {
                return (
                  <Button key={action.id} asChild className="w-full">
                    <Link to={action.path}>{action.name}</Link>
                  </Button>
                );
              }
              return null;
            })
        )}
      </CardContent>
    </Card>
  );
}
