
import React from "react"
import { Loader2 } from "lucide-react"

interface CartLoadingProps {
  message?: string
}

export function CartLoading({ message = "Loading cart details..." }: CartLoadingProps) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
