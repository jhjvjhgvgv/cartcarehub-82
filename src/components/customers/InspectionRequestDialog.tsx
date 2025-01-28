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

export const InspectionRequestDialog = () => {
  const [open, setOpen] = useState(false);
  const [cartId, setCartId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically make an API call
    toast({
      title: "Inspection Request Submitted",
      description: "We'll review your request and confirm the inspection date.",
    });
    setOpen(false);
    setCartId("");
    setPreferredDate("");
    setNotes("");
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
          <Button type="submit" className="w-full">
            Submit Inspection Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};