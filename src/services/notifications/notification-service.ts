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
  data?: any;
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
    data?: any
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
   * Send maintenance reminder notification
   */
  async sendMaintenanceReminder(
    cartId: string,
    providerId: string,
    scheduledDate: string
  ): Promise<void> {
    const { data: provider } = await supabase
      .from('maintenance_providers')
      .select('user_id, company_name')
      .eq('id', providerId)
      .maybeSingle();

    if (!provider) return;

    await this.sendNotification(
      provider.user_id,
      'maintenance_due',
      'Maintenance Scheduled',
      `You have a maintenance appointment scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
      { cartId, scheduledDate }
    );
  }

  /**
   * Send critical alert notification
   */
  async sendCriticalAlert(
    cartId: string,
    issue: string,
    storeOrgId: string
  ): Promise<void> {
    // Get all users associated with the store
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'store');

    if (!profiles) return;

    for (const profile of profiles) {
      await this.sendNotification(
        profile.id,
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

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'store');

    if (!profiles) return;

    for (const profile of profiles) {
      await this.sendNotification(
        profile.id,
        'status_change',
        'Cart Status Updated',
        `Cart ${cartIdentifier} status changed from ${oldStatus} to ${newStatus}`,
        { cartId, oldStatus, newStatus, storeOrgId }
      );
    }
  }

  /**
   * Send completion notification
   */
  async sendCompletionNotification(
    requestId: string,
    cartId: string,
    providerId: string
  ): Promise<void> {
    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (!request) return;

    // Get cart identifier
    const { data: cart } = await supabase
      .from('carts')
      .select('qr_token, asset_tag')
      .eq('id', cartId)
      .maybeSingle();

    const cartIdentifier = cart?.asset_tag || cart?.qr_token?.slice(0, 8) || 'Unknown';

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'store');

    if (!profiles) return;

    for (const profile of profiles) {
      await this.sendNotification(
        profile.id,
        'completion',
        'Maintenance Completed',
        `Maintenance work on cart ${cartIdentifier} has been completed`,
        { requestId, cartId, cost: request.cost }
      );
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Default preferences if none exist
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
    // Store preferences in profile or separate table
    console.log('Updating notification preferences for user:', userId, preferences);
  }

  /**
   * Schedule automated notifications for upcoming maintenance
   */
  async scheduleMaintenanceReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: schedules } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .lte('next_due_date', tomorrow.toISOString())
      .eq('is_active', true);

    if (!schedules) return;

    for (const schedule of schedules) {
      await this.sendMaintenanceReminder(
        schedule.cart_id,
        schedule.provider_id,
        schedule.next_due_date
      );
    }
  }
}

export const notificationService = new NotificationService();
