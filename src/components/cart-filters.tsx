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
  status: string
}

export function CartFilters({ onFilterChange }: CartFiltersProps) {
  const [filters, setFilters] = React.useState<CartFilters>({
    rfidTag: "",
    status: "",
  })

  const handleFilterChange = (key: keyof CartFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // Convert "all" back to empty string for filtering logic
    if (key === "status" && value === "all") {
      onFilterChange({ ...newFilters, status: "" })
    } else {
      onFilterChange(newFilters)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status === "" ? "all" : filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger id="status">
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
  )
}