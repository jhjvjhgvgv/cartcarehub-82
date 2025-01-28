import { useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const EmergencyRepairDialog = () => {
  const [open, setOpen] = useState(false);
  const [cartId, setCartId] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically make an API call
    toast({
      title: "Emergency Request Sent",
      description: "Our team has been notified and will respond shortly.",
    });
    setOpen(false);
    setCartId("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full flex items-center gap-2">
          <AlertOctagon className="h-4 w-4" />
          Request Emergency Repair
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertOctagon className="h-5 w-5" />
            Emergency Repair Request
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
            <Label htmlFor="description">Description of Emergency</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the emergency situation..."
              className="min-h-[100px]"
              required
            />
          </div>
          <Button type="submit" variant="destructive" className="w-full">
            Submit Emergency Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};