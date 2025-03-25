
import React from "react"
import { Button } from "@/components/ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"

interface CartActionButtonProps {
  icon: React.ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  tooltip?: string
}

export function CartActionButton({
  icon,
  onClick,
  className = "",
  disabled = false,
  tooltip
}: CartActionButtonProps) {
  const button = (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`rounded-full h-8 w-8 p-0 ${className}`}
      disabled={disabled}
    >
      {icon}
      <span className="sr-only">Cart action</span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
