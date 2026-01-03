import { supabase } from "@/integrations/supabase/client";

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  maintenanceReminders: boolean;
  statusUpdates: boolean;
  criticalAlerts: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'maintenance_due' | 'status_change' | 'critical_alert' | 'completion' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  /**
   * Send a notification via edge function
   */
  async sendNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('maintenance-notifications', {
        body: {
          userId,
          type,
          title,
          message,
          data
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send maintenance reminder notification to provider org members
   */
  async sendMaintenanceReminder(
    workOrderId: string,
    providerOrgId: string,
    scheduledDate: string
  ): Promise<void> {
    // Get members of the provider org
    const { data: members } = await supabase
      .from('org_memberships')
      .select('user_id')
      .eq('org_id', providerOrgId);

    if (!members?.length) return;

    for (const member of members) {
      await this.sendNotification(
        member.user_id,
        'maintenance_due',
        'Maintenance Scheduled',
        `You have a maintenance appointment scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
        { workOrderId, scheduledDate }
      );
    }
  }

  /**
   * Send critical alert notification to store members
   */
  async sendCriticalAlert(
    cartId: string,
    issue: string,
    storeOrgId: string
  ): Promise<void> {
    // Get all members of the store org
    const { data: members } = await supabase
      .from('org_memberships')
      .select('user_id')
      .eq('org_id', storeOrgId);

    if (!members?.length) return;

    for (const member of members) {
      await this.sendNotification(
        member.user_id,
        'critical_alert',
        'Critical Cart Issue',
        `Cart requires immediate attention: ${issue}`,
        { cartId, storeOrgId, issue }
      );
    }
  }

  /**
   * Send status update notification
   */
  async sendStatusUpdate(
    cartId: string,
    oldStatus: string,
    newStatus: string,
    storeOrgId: string
  ): Promise<void> {
    const { data: cart } = await supabase
      .from('carts')
      .select('qr_token, asset_tag')
      .eq('id', cartId)
      .maybeSingle();

    if (!cart) return;

    const cartIdentifier = cart.asset_tag || cart.qr_token.slice(0, 8);

    // Get all members of the store org
    const { data: members } = await supabase
      .from('org_memberships')
      .select('user_id')
      .eq('org_id', storeOrgId);

    if (!members?.length) return;

    for (const member of members) {
      await this.sendNotification(
        member.user_id,
        'status_change',
        'Cart Status Updated',
        `Cart ${cartIdentifier} status changed from ${oldStatus} to ${newStatus}`,
        { cartId, oldStatus, newStatus, storeOrgId }
      );
    }
  }

  /**
   * Send completion notification for work order
   */
  async sendCompletionNotification(
    workOrderId: string,
    storeOrgId: string
  ): Promise<void> {
    const { data: workOrder } = await supabase
      .from('work_orders')
      .select('summary')
      .eq('id', workOrderId)
      .maybeSingle();

    if (!workOrder) return;

    // Get all members of the store org
    const { data: members } = await supabase
      .from('org_memberships')
      .select('user_id')
      .eq('org_id', storeOrgId);

    if (!members?.length) return;

    for (const member of members) {
      await this.sendNotification(
        member.user_id,
        'completion',
        'Work Order Completed',
        `Work order has been completed: ${workOrder.summary || 'Maintenance task'}`,
        { workOrderId, storeOrgId }
      );
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(_userId: string): Promise<NotificationPreferences> {
    // Default preferences - in production this would be stored per-user
    return {
      email: true,
      sms: false,
      push: true,
      maintenanceReminders: true,
      statusUpdates: true,
      criticalAlerts: true
    };
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    // Store preferences - would need a notification_preferences table
    console.log('Updating notification preferences for user:', userId, preferences);
  }

  /**
   * Schedule automated notifications for upcoming work orders
   */
  async scheduleMaintenanceReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get scheduled work orders for tomorrow
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('id, provider_org_id, scheduled_at')
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', tomorrow.toISOString());

    if (!workOrders?.length) return;

    for (const wo of workOrders) {
      if (wo.provider_org_id && wo.scheduled_at) {
        await this.sendMaintenanceReminder(
          wo.id,
          wo.provider_org_id,
          wo.scheduled_at
        );
      }
    }
  }
}

export const notificationService = new NotificationService();
