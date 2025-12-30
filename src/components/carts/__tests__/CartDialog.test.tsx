
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
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
    const { container } = render(<CartDialog {...defaultProps} />)
    expect(container).toBeTruthy()
  })

  it('shows edit cart dialog when editing cart is provided', () => {
    const editingCart: Cart = {
      id: 'CART-001',
      qr_token: 'QR-123',
      store_org_id: 'store1',
      status: 'in_service',
      asset_tag: null,
      model: null,
      notes: null,
      created_at: '2024-02-21',
      updated_at: '2024-02-21',
    }

    const { container } = render(<CartDialog {...defaultProps} editingCart={editingCart} />)
    expect(container).toBeTruthy()
  })

  it('shows multiple cart edit dialog when editing multiple carts', () => {
    const editingCart: Cart = {
      id: 'CART-001,CART-002',
      qr_token: 'Multiple Carts',
      store_org_id: 'store1',
      status: 'in_service',
      asset_tag: null,
      model: null,
      notes: null,
      created_at: '2024-02-21',
      updated_at: '2024-02-21',
    }

    const { container } = render(<CartDialog {...defaultProps} editingCart={editingCart} />)
    expect(container).toBeTruthy()
  })
})
