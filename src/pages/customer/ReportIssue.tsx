import { useState } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const ReportIssue = () => {
  const { toast } = useToast();
  const [cartId, setCartId] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Issue Reported",
      description: "Your issue has been successfully reported. We'll look into it.",
    });
    setCartId("");
    setDescription("");
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
          <p className="text-muted-foreground">
            Let us know if you encounter any problems with your shopping cart.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cartId">Cart ID</Label>
                <Input
                  id="cartId"
                  placeholder="Enter cart ID (e.g., A12345)"
                  value={cartId}
                  onChange={(e) => setCartId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe the issue you're experiencing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="min-h-[150px]"
                />
              </div>
              <Button type="submit">Submit Report</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default ReportIssue;