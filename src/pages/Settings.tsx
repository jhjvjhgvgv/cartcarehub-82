
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StoreMaintenanceManager } from "@/components/settings/StoreMaintenanceManager"

export default function Settings() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        heading="Settings"
        text="Manage your store maintenance and other settings."
      />
      <div className="grid gap-4">
        <StoreMaintenanceManager />
      </div>
    </div>
  )
}
