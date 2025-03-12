
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

const MaintenanceSettings = () => {
  const { toast } = useToast()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Settings Updated",
      description: "Your maintenance settings have been saved successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Your company name" defaultValue="Cart Repair Pros" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your email" defaultValue="maintenance@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number</Label>
              <Input id="phone" type="tel" placeholder="Your contact number" defaultValue="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Service Address</Label>
              <Input id="address" placeholder="Your service address" defaultValue="123 Repair Street, Fix City" />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Status Updates</Label>
              <p className="text-sm text-muted-foreground">
                Automatically notify stores when maintenance is complete
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emergency Service Availability</Label>
              <p className="text-sm text-muted-foreground">
                Allow stores to request emergency maintenance
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Service Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send reminder emails for scheduled maintenance
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MaintenanceSettings
