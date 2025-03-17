
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LucideIcon } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  date: string;
  description: string;
  icon: LucideIcon;
  status: string;
}

interface RecentActivityProps {
  recentActivities: Activity[];
}

export function RecentActivity({ recentActivities }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-amber-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Button variant="outline" size="sm" className="text-xs">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length > 0 ? (
          <Table>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-muted/30">
                  <TableCell className="py-2">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-muted p-2 flex-shrink-0">
                        <activity.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                          <span className={`text-xs ${getStatusColor(activity.status)} ml-2 font-medium capitalize`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        )}
      </CardContent>
    </Card>
  );
}
