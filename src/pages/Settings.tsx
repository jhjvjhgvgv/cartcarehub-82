
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StoreMaintenanceManager } from "@/components/settings/StoreMaintenanceManager"
import CustomerSettings from "./customer/Settings"
import MaintenanceSettings from "@/components/settings/MaintenanceSettings"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { ConnectionService } from "@/services/ConnectionService"

export default function Settings() {
  const navigate = useNavigate()
  const isMaintenance = ConnectionService.isMaintenanceUser()
  
  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack} 
          className="w-fit flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
        <DashboardHeader
          heading="Settings"
          text={isMaintenance 
            ? "Manage your maintenance relationships and settings."
            : "Manage your store settings and maintenance providers."}
        />
      </div>
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
