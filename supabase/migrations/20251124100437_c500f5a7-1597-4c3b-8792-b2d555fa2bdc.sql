-- Multi-tenant Repair Shop Management System
-- Add tenant isolation and comprehensive business features

-- ============================================================================
-- CUSTOMERS TABLE - Customer management for each maintenance provider
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  company_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_provider ON public.customers(provider_id);
CREATE INDEX idx_customers_email ON public.customers(customer_email);

-- ============================================================================
-- INVENTORY ITEMS - Parts and supplies tracking per provider
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_code TEXT,
  description TEXT,
  category TEXT,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  supplier_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_provider ON public.inventory_items(provider_id);
CREATE INDEX idx_inventory_code ON public.inventory_items(item_code);

-- ============================================================================
-- INVENTORY TRANSACTIONS - Track inventory usage and purchases
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment')),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2),
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_inv_trans_provider ON public.inventory_transactions(provider_id);
CREATE INDEX idx_inv_trans_item ON public.inventory_transactions(item_id);
CREATE INDEX idx_inv_trans_reference ON public.inventory_transactions(reference_type, reference_id);

-- ============================================================================
-- WORK ORDER LINE ITEMS - Parts and labor details for maintenance requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.work_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_request_id UUID NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL CHECK (line_type IN ('labor', 'part', 'other')),
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_order_lines_request ON public.work_order_line_items(maintenance_request_id);
CREATE INDEX idx_work_order_lines_inventory ON public.work_order_line_items(inventory_item_id);

-- ============================================================================
-- INVOICES - Billing for completed work
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_provider ON public.invoices(provider_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- ============================================================================
-- INVOICE LINE ITEMS - Detailed breakdown of invoice charges
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_lines_invoice ON public.invoice_line_items(invoice_id);

-- ============================================================================
-- SCHEDULED NOTIFICATIONS - Appointment reminders and follow-ups
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'follow_up', 'invoice_due', 'appointment')),
  reference_type TEXT,
  reference_id UUID,
  recipient_email TEXT,
  recipient_phone TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  subject TEXT,
  message TEXT,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_notif_provider ON public.scheduled_notifications(provider_id);
CREATE INDEX idx_scheduled_notif_status ON public.scheduled_notifications(status, scheduled_for);

-- ============================================================================
-- PROVIDER ANALYTICS - Cached analytics for performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.provider_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.maintenance_providers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_work_orders INTEGER DEFAULT 0,
  completed_work_orders INTEGER DEFAULT 0,
  parts_used_count INTEGER DEFAULT 0,
  parts_used_value NUMERIC(10,2) DEFAULT 0,
  labor_hours NUMERIC(10,2) DEFAULT 0,
  outstanding_invoices NUMERIC(10,2) DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, period_start, period_end)
);

CREATE INDEX idx_provider_analytics_provider ON public.provider_analytics(provider_id);
CREATE INDEX idx_provider_analytics_period ON public.provider_analytics(period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Customers RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own customers"
ON public.customers FOR ALL
USING (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

-- Inventory Items RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own inventory"
ON public.inventory_items FOR ALL
USING (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

-- Inventory Transactions RLS
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their inventory transactions"
ON public.inventory_transactions FOR SELECT
USING (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers can create inventory transactions"
ON public.inventory_transactions FOR INSERT
WITH CHECK (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

-- Work Order Line Items RLS
ALTER TABLE public.work_order_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their work order line items"
ON public.work_order_line_items FOR ALL
USING (
  maintenance_request_id IN (
    SELECT id FROM public.maintenance_requests WHERE provider_id IN (
      SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
    )
  )
);

-- Invoices RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own invoices"
ON public.invoices FOR ALL
USING (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Customers can view their invoices"
ON public.invoices FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM public.customers WHERE customer_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Invoice Line Items RLS
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoice lines if they can view the invoice"
ON public.invoice_line_items FOR SELECT
USING (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE 
      provider_id IN (
        SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
      )
      OR customer_id IN (
        SELECT id FROM public.customers WHERE customer_email = (
          SELECT email FROM public.profiles WHERE id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Providers can manage their invoice lines"
ON public.invoice_line_items FOR ALL
USING (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE provider_id IN (
      SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
    )
  )
);

-- Scheduled Notifications RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their notifications"
ON public.scheduled_notifications FOR ALL
USING (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

-- Provider Analytics RLS
ALTER TABLE public.provider_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own analytics"
ON public.provider_analytics FOR SELECT
USING (
  provider_id IN (
    SELECT id FROM public.maintenance_providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage analytics"
ON public.provider_analytics FOR ALL
USING (true);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update inventory quantities after transactions
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'purchase' THEN
    UPDATE public.inventory_items 
    SET quantity_on_hand = quantity_on_hand + NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'usage' THEN
    UPDATE public.inventory_items 
    SET quantity_on_hand = quantity_on_hand - NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE public.inventory_items 
    SET quantity_on_hand = NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_inventory_quantity
AFTER INSERT ON public.inventory_transactions
FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();

-- Trigger to calculate work order line totals
CREATE OR REPLACE FUNCTION calculate_line_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_work_order_line_total
BEFORE INSERT OR UPDATE ON public.work_order_line_items
FOR EACH ROW EXECUTE FUNCTION calculate_line_item_total();

CREATE TRIGGER trigger_calculate_invoice_line_total
BEFORE INSERT OR UPDATE ON public.invoice_line_items
FOR EACH ROW EXECUTE FUNCTION calculate_line_item_total();

-- Trigger to update invoice totals when line items change
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.invoices
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM public.invoice_line_items
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Recalculate total with tax
  UPDATE public.invoices
  SET total_amount = subtotal + tax_amount
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_invoice_totals
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- ============================================================================
-- HELPER FUNCTIONS FOR ANALYTICS
-- ============================================================================

-- Function to calculate provider revenue for a period
CREATE OR REPLACE FUNCTION calculate_provider_revenue(
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM public.invoices
    WHERE provider_id = p_provider_id
      AND status = 'paid'
      AND invoice_date BETWEEN p_start_date AND p_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get low inventory items
CREATE OR REPLACE FUNCTION get_low_inventory_items(p_provider_id UUID)
RETURNS TABLE(
  id UUID,
  item_name TEXT,
  quantity_on_hand INTEGER,
  reorder_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.item_name,
    i.quantity_on_hand,
    i.reorder_level
  FROM public.inventory_items i
  WHERE i.provider_id = p_provider_id
    AND i.quantity_on_hand <= i.reorder_level
  ORDER BY i.quantity_on_hand ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;