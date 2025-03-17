
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { EmergencyRepairDialog } from "@/components/customers/EmergencyRepairDialog";
import { InspectionRequestDialog } from "@/components/customers/InspectionRequestDialog";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <EmergencyRepairDialog />
        <InspectionRequestDialog />
        <Button asChild className="w-full">
          <Link to="/customer/cart-status">Check Cart Status</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link to="/customer/report-issue">Report an Issue</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
