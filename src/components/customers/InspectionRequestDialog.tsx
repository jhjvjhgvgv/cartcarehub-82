
import { useState } from "react";
import { Clipboard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ConnectionService } from "@/services/ConnectionService";

export const InspectionRequestDialog = () => {
  const [open, setOpen] = useState(false);
  const [cartId, setCartId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user (store) - using simplified approach for demo
      const currentUser = { id: 'demo-store-user', name: 'Demo Store', type: 'store' as const };
      
      // This would typically make an API call to send the request to connected maintenance providers
      // For this demo, we'll simulate saving the request
      const request = {
        cartId,
        preferredDate,
        notes,
        storeId: currentUser.id,
        // Fix: Use name instead of displayName which doesn't exist on UserAccount
        storeName: currentUser.name || "Store",
        requestDate: new Date().toISOString(),
        status: "pending",
      };
      
      // In a real app, we would save this request to a database table
      // and notify the maintenance provider
      
      // Get connected maintenance providers
      const connections = await ConnectionService.getStoreConnections(currentUser.id);
      const activeConnections = connections.filter(conn => conn.status === "active");
      
      if (activeConnections.length === 0) {
        toast({
          title: "No Connected Maintenance Providers",
          description: "You don't have any active maintenance connections. Please connect to a maintenance provider first.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Simulate sending notifications to all connected maintenance providers
      for (const connection of activeConnections) {
        console.log(`Sending inspection request notification to maintenance provider ${connection.maintenanceId}`);
        // In a real app, this would update the database and trigger a notification
      }
      
      // Add to recent activity (this would be stored in a database in a real app)
      const activity = {
        id: Math.random().toString(36).substring(7),
        type: "inspection_request",
        date: new Date().toISOString(),
        description: `Requested inspection for cart ${cartId}`,
        status: "pending",
      };
      
      console.log("New activity added:", activity);
      
      toast({
        title: "Inspection Request Submitted",
        description: "We'll review your request and confirm the inspection date.",
      });
      
      setOpen(false);
      setCartId("");
      setPreferredDate("");
      setNotes("");
    } catch (error) {
      console.error("Error submitting inspection request:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Clipboard className="h-4 w-4" />
          Request Cart Inspection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5" />
            Request Cart Inspection
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cartId">Cart ID</Label>
            <Input
              id="cartId"
              value={cartId}
              onChange={(e) => setCartId(e.target.value)}
              placeholder="Enter cart ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredDate">Preferred Inspection Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific concerns or observations..."
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Inspection Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
