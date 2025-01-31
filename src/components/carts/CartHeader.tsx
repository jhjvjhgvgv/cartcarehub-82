import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface CartHeaderProps {
  onAddClick: () => void
}

export function CartHeader({ onAddClick }: CartHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
      <Button className="flex items-center gap-2" onClick={onAddClick}>
        <PlusCircle className="h-4 w-4" />
        Add New Cart
      </Button>
    </div>
  )
}