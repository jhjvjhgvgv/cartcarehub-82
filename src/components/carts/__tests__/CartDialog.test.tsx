
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CartDialog } from '../CartDialog'
import { Cart } from '@/types/cart'

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('CartDialog', () => {
  const mockOnSubmit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnOpenChange = vi.fn()
  
  const managedStores = [
    { id: "store1", name: "SuperMart Downtown" },
    { id: "store2", name: "FreshMart Heights" },
    { id: "store3", name: "Value Grocery West" },
  ]

  const defaultProps = {
    isOpen: true,
    onOpenChange: mockOnOpenChange,
    onSubmit: mockOnSubmit,
    onDelete: mockOnDelete,
    editingCart: null,
    managedStores,
  }

  it('renders add new cart dialog when no editing cart is provided', () => {
    render(<CartDialog {...defaultProps} />)
    
    expect(screen.getByText('Add New Cart')).toBeInTheDocument()
    expect(screen.getByText('Fill in the cart details below')).toBeInTheDocument()
  })

  it('shows edit cart dialog when editing cart is provided', () => {
    const editingCart: Cart = {
      id: 'CART-001',
      qr_code: 'QR-123',
      store: 'SuperMart Downtown',
      storeId: 'store1',
      status: 'active',
      lastMaintenance: '2024-02-21',
      issues: [],
    }

    render(<CartDialog {...defaultProps} editingCart={editingCart} />)
    
    expect(screen.getByText('Edit Cart')).toBeInTheDocument()
    expect(screen.getByText('Update the cart details below.')).toBeInTheDocument()
  })

  it('shows multiple cart edit dialog when editing multiple carts', () => {
    const editingCart: Cart = {
      id: 'CART-001,CART-002',
      qr_code: 'Multiple Carts',
      store: 'SuperMart Downtown',
      storeId: 'store1',
      status: 'active',
      lastMaintenance: '2024-02-21',
      issues: [],
    }

    render(<CartDialog {...defaultProps} editingCart={editingCart} />)
    
    expect(screen.getByText(/Edit Multiple Carts/)).toBeInTheDocument()
    expect(screen.getByText(/Edit multiple carts individually or apply changes to all selected carts./)).toBeInTheDocument()
  })

  it('closes dialog when cancel button is clicked', () => {
    render(<CartDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
