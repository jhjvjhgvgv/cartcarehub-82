
import React from "react"
import { Loader2 } from "lucide-react"

interface CartLoadingProps {
  message?: string
}

export function CartLoading({ message = "Loading cart details..." }: CartLoadingProps) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  )
}
