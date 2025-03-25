
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "./ui/card"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CartFiltersProps {
  onFilterChange: (filters: CartFilters) => void
  managedStores: { id: string; name: string }[]
}

export interface CartFilters {
  rfidTag: string
  status: string
  store: string
  dateRange?: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function CartFilters({ onFilterChange, managedStores }: CartFiltersProps) {
  const [filters, setFilters] = React.useState<CartFilters>({
    rfidTag: "",
    status: "",
    store: "",
    dateRange: undefined
  })

  const handleFilterChange = (key: keyof CartFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    if ((key === "status" || key === "store") && value === "all") {
      onFilterChange({ ...newFilters, [key]: "" })
    } else {
      onFilterChange(newFilters)
    }
  }

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="rfidTag" className="text-sm font-medium">QR Code</Label>
          <Input
            id="rfidTag"
            placeholder="Search by QR code..."
            value={filters.rfidTag}
            onChange={(e) => handleFilterChange("rfidTag", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store" className="text-sm font-medium">Store</Label>
          <Select
            value={filters.store === "" ? "all" : filters.store}
            onValueChange={(value) => handleFilterChange("store", value)}
          >
            <SelectTrigger id="store" className="w-full">
              <SelectValue placeholder="Filter by store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {managedStores.map((store) => (
                <SelectItem key={store.id} value={store.name}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">Status</Label>
          <Select
            value={filters.status === "" ? "all" : filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Last Maintenance Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => handleFilterChange("dateRange", range)}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
              {filters.dateRange && (
                <div className="p-3 border-t border-border flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFilterChange("dateRange", undefined)}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  )
}
