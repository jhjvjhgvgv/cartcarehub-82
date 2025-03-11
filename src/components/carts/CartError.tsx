
import React from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface CartErrorProps {
  message?: string
  onBackClick?: () => void
}

export function CartError({ message = "Error loading cart details", onBackClick }: CartErrorProps) {
  const navigate = useNavigate()
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      navigate('/carts')
    }
  }

  return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-4">{message}</p>
      <Button onClick={handleBackClick} variant="outline">
        Back to Carts
      </Button>
    </div>
  )
}
