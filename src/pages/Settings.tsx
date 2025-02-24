
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StoreMaintenanceManager } from "@/components/settings/StoreMaintenanceManager"
import CustomerSettings from "./customer/Settings"

// For demo purposes - in real app this would come from auth state
const isMaintenance = false // Toggle this to test different views

export default function Settings() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        heading="Settings"
        text={isMaintenance 
          ? "Manage your maintenance relationships and settings."
          : "Manage your store settings and maintenance providers."}
      />
      <div className="grid gap-4">
        <StoreMaintenanceManager isMaintenance={isMaintenance} />
        <CustomerSettings />
      </div>
    </div>
  )
}
