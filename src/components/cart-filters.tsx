
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

interface CartFiltersProps {
  onFilterChange: (filters: CartFilters) => void
  managedStores: { id: string; name: string }[]
}

export interface CartFilters {
  rfidTag: string
  status: string
  store: string
}

export function CartFilters({ onFilterChange, managedStores }: CartFiltersProps) {
  const [filters, setFilters] = React.useState<CartFilters>({
    rfidTag: "",
    status: "",
    store: "",
  })

  const handleFilterChange = (key: keyof CartFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if ((key === "status" || key === "store") && value === "all") {
      onFilterChange({ ...newFilters, [key]: "" })
    } else {
      onFilterChange(newFilters)
    }
  }

  return (
    <Card className="p-4">
      <div className="grid gap-6 md:grid-cols-3">
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
      </div>
    </Card>
  )
}
