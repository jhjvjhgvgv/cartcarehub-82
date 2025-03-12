
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StoreMaintenanceManager } from "@/components/settings/StoreMaintenanceManager"
import CustomerSettings from "./customer/Settings"
import MaintenanceSettings from "@/components/settings/MaintenanceSettings"

// For demo purposes - in real app this would come from auth state
const isMaintenance = true // Set to true to test maintenance view

export default function Settings() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <DashboardHeader
        heading="Settings"
        text={isMaintenance 
          ? "Manage your maintenance relationships and settings."
          : "Manage your store settings and maintenance providers."}
      />
      <div className="grid gap-8">
        {/* Primary Settings Card */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Account Settings</h3>
          {isMaintenance 
            ? <MaintenanceSettings />
            : <CustomerSettings />
          }
        </div>
        
        {/* Store/Maintenance Management */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">
            {isMaintenance ? "Store Management" : "Maintenance Management"}
          </h3>
          <StoreMaintenanceManager isMaintenance={isMaintenance} />
        </div>
      </div>
    </div>
  )
}
