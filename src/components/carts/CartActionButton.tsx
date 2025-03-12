
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface CartActionButtonProps {
  icon: ReactNode
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  className?: string
}

export function CartActionButton({ 
  icon, 
  onClick, 
  disabled = false, 
  className = "" 
}: CartActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {icon}
    </Button>
  )
}
