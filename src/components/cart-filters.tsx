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

interface CartFiltersProps {
  onFilterChange: (filters: CartFilters) => void
}

export interface CartFilters {
  rfidTag: string
  store: string
  status: string
}

export function CartFilters({ onFilterChange }: CartFiltersProps) {
  const [filters, setFilters] = React.useState<CartFilters>({
    rfidTag: "",
    store: "",
    status: "",
  })

  const handleFilterChange = (key: keyof CartFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="rfidTag">RFID Tag</Label>
        <Input
          id="rfidTag"
          placeholder="Search by RFID tag..."
          value={filters.rfidTag}
          onChange={(e) => handleFilterChange("rfidTag", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="store">Store</Label>
        <Input
          id="store"
          placeholder="Search by store..."
          value={filters.store}
          onChange={(e) => handleFilterChange("store", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}