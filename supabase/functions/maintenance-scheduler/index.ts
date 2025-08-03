import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceRequest {
  cart_id: string;
  provider_id: string;
  store_id: string;
  request_type: 'routine' | 'emergency' | 'inspection' | 'repair';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  scheduled_date?: string;
  estimated_duration?: number;
}

interface MaintenanceSchedule {
  cart_id: string;
  provider_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequency: number;
  maintenance_type: string;
  estimated_duration: number;
  notes?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log('Maintenance scheduler action:', action);

    switch (action) {
      case 'create_request':
        return await createMaintenanceRequest(data as MaintenanceRequest);
      
      case 'update_request':
        return await updateMaintenanceRequest(data);
      
      case 'create_schedule':
        return await createMaintenanceSchedule(data as MaintenanceSchedule);
      
      case 'get_overdue_maintenance':
        return await getOverdueMaintenance();
      
      case 'get_upcoming_maintenance':
        return await getUpcomingMaintenance(data.days || 7);
      
      case 'complete_maintenance':
        return await completeMaintenance(data.request_id, data.notes, data.actual_duration, data.cost);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in maintenance scheduler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createMaintenanceRequest(request: MaintenanceRequest) {
  console.log('Creating maintenance request:', request);
  
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert([{
      ...request,
      scheduled_date: request.scheduled_date ? new Date(request.scheduled_date).toISOString() : null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating maintenance request:', error);
    throw error;
  }

  // Update cart analytics
  await updateCartAnalytics(request.cart_id, {
    issues_reported: 1
  });

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateMaintenanceRequest(updates: any) {
  const { id, ...updateData } = updates;
  
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({
      ...updateData,
      scheduled_date: updateData.scheduled_date ? new Date(updateData.scheduled_date).toISOString() : undefined,
      completed_date: updateData.status === 'completed' ? new Date().toISOString() : undefined
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating maintenance request:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createMaintenanceSchedule(schedule: MaintenanceSchedule) {
  console.log('Creating maintenance schedule:', schedule);
  
  // Calculate next due date based on schedule type
  const now = new Date();
  let nextDueDate = new Date(now);
  
  switch (schedule.schedule_type) {
    case 'daily':
      nextDueDate.setDate(nextDueDate.getDate() + schedule.frequency);
      break;
    case 'weekly':
      nextDueDate.setDate(nextDueDate.getDate() + (schedule.frequency * 7));
      break;
    case 'monthly':
      nextDueDate.setMonth(nextDueDate.getMonth() + schedule.frequency);
      break;
    case 'quarterly':
      nextDueDate.setMonth(nextDueDate.getMonth() + (schedule.frequency * 3));
      break;
    case 'yearly':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + schedule.frequency);
      break;
  }

  const { data, error } = await supabase
    .from('maintenance_schedules')
    .insert([{
      ...schedule,
      next_due_date: nextDueDate.toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating maintenance schedule:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getOverdueMaintenance() {
  const { data, error } = await supabase
    .from('maintenance_schedules')
    .select(`
      *,
      carts(qr_code, store, status),
      maintenance_providers(company_name, contact_email)
    `)
    .eq('is_active', true)
    .lt('next_due_date', new Date().toISOString());

  if (error) {
    console.error('Error fetching overdue maintenance:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUpcomingMaintenance(days: number) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from('maintenance_schedules')
    .select(`
      *,
      carts(qr_code, store, status),
      maintenance_providers(company_name, contact_email)
    `)
    .eq('is_active', true)
    .gte('next_due_date', new Date().toISOString())
    .lte('next_due_date', futureDate.toISOString())
    .order('next_due_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming maintenance:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function completeMaintenance(requestId: string, notes?: string, actualDuration?: number, cost?: number) {
  // Update the maintenance request
  const { data: request, error: updateError } = await supabase
    .from('maintenance_requests')
    .update({
      status: 'completed',
      completed_date: new Date().toISOString(),
      actual_duration: actualDuration,
      cost: cost,
      notes: notes ? JSON.stringify([...JSON.parse('[]'), { text: notes, timestamp: new Date().toISOString() }]) : undefined
    })
    .eq('id', requestId)
    .select()
    .single();

  if (updateError) {
    console.error('Error completing maintenance request:', updateError);
    throw updateError;
  }

  // Update cart analytics
  await updateCartAnalytics(request.cart_id, {
    maintenance_cost: cost || 0,
    downtime_minutes: actualDuration || 0
  });

  return new Response(
    JSON.stringify({ success: true, data: request }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateCartAnalytics(cartId: string, metrics: any) {
  const today = new Date().toISOString().split('T')[0];
  
  // Try to update existing record, or insert new one
  const { error } = await supabase
    .from('cart_analytics')
    .upsert({
      cart_id: cartId,
      metric_date: today,
      ...metrics
    }, {
      onConflict: 'cart_id,metric_date'
    });

  if (error) {
    console.error('Error updating cart analytics:', error);
  }
}