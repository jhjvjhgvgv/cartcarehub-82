import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  ArrowLeft 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "wheels", label: "Wheels functioning properly", checked: true },
  { id: "handle", label: "Handle secure and stable", checked: true },
  { id: "basket", label: "Basket intact (no holes/damage)", checked: true },
  { id: "child_seat", label: "Child seat functional", checked: true },
  { id: "brakes", label: "Brakes working (if applicable)", checked: true },
  { id: "frame", label: "Frame not bent or damaged", checked: true },
];

export default function Inspection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const qrToken = searchParams.get("qr") || "";
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cartInfo, setCartInfo] = useState<{ id: string; asset_tag: string | null; store_name: string } | null>(null);
  
  const [healthScore, setHealthScore] = useState([85]);
  const [status, setStatus] = useState<"in_service" | "out_of_service">("in_service");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [notes, setNotes] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueSeverity, setIssueSeverity] = useState<"low" | "medium" | "high" | "critical">("low");
  const [issueCategory, setIssueCategory] = useState("");

  useEffect(() => {
    const fetchCartInfo = async () => {
      if (!qrToken) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("carts_with_store")
          .select("id, asset_tag, store_name")
          .eq("qr_token", qrToken)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setCartInfo({
            id: data.id,
            asset_tag: data.asset_tag,
            store_name: data.store_name || "Unknown Store"
          });
        } else {
          toast({
            title: "Cart not found",
            description: "No cart found with this QR code",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast({
          title: "Error",
          description: "Failed to load cart information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartInfo();
  }, [qrToken, toast]);

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, checked } : item)
    );
  };

  const handleSubmit = async () => {
    if (!qrToken) {
      toast({
        title: "Missing QR Token",
        description: "Please scan a cart QR code first",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const checklistData = checklist.reduce((acc, item) => {
        acc[item.id] = item.checked;
        return acc;
      }, {} as Record<string, boolean>);

      const { data, error } = await supabase.rpc("submit_inspection_by_qr", {
        p_qr_token: qrToken,
        p_reported_status: status,
        p_health_score: healthScore[0],
        p_checklist: checklistData,
        p_notes: notes || null,
        p_issue_category: issueDescription ? issueCategory || null : null,
        p_issue_severity: issueDescription ? issueSeverity : null,
        p_issue_description: issueDescription || null
      });

      if (error) throw error;

      toast({
        title: "Inspection Submitted",
        description: `Inspection recorded successfully${data?.[0]?.issue_id ? ' with issue' : ''}`,
      });

      navigate(-1);
    } catch (error: any) {
      console.error("Error submitting inspection:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit inspection",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Cart Inspection
            </CardTitle>
            <CardDescription>
              Complete the inspection checklist for this cart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cart Info */}
            {cartInfo ? (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{cartInfo.asset_tag || `Cart ${cartInfo.id.slice(0, 8)}`}</p>
                  <p className="text-sm text-muted-foreground">{cartInfo.store_name}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-destructive">No cart found. Please scan a valid QR code.</p>
              </div>
            )}

            {/* Health Score */}
            <div className="space-y-3">
              <Label>Health Score: {healthScore[0]}%</Label>
              <Slider
                value={healthScore}
                onValueChange={setHealthScore}
                max={100}
                min={0}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Cart Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="in_service">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      In Service
                    </span>
                  </SelectItem>
                  <SelectItem value="out_of_service">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Out of Service (Needs Repair)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <Label>Inspection Checklist</Label>
              <div className="space-y-2 border rounded-lg p-4">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) => 
                        handleChecklistChange(item.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {item.label}
                    </label>
                    <Badge variant={item.checked ? "default" : "destructive"}>
                      {item.checked ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Inspection Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any observations or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Issue Reporting */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Report Issue (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Issue Description</Label>
                  <Textarea
                    id="issueDescription"
                    placeholder="Describe the issue found..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                </div>
                
                {issueDescription && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={issueCategory} onValueChange={setIssueCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="wheels">Wheels</SelectItem>
                            <SelectItem value="handle">Handle</SelectItem>
                            <SelectItem value="basket">Basket</SelectItem>
                            <SelectItem value="frame">Frame</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select value={issueSeverity} onValueChange={(v) => setIssueSeverity(v as typeof issueSeverity)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !cartInfo}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><ClipboardCheck className="h-4 w-4 mr-2" /> Submit Inspection</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
