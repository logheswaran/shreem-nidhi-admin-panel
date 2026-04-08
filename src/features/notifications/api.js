import { supabase } from '../../core/lib/supabase'

export const notificationService = {
  /**
   * Fetch all notifications
   */
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  /**
   * Create a new notification (broadcast or targeted)
   */
  async createNotification(payload) {
    return this.sendNotification(payload)
  },

  async sendNotification(payload) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title: payload.title,
        body: payload.body,
        type: payload.type || 'broadcast',
        target_user_id: payload.target_user_id || null,
        chit_id: payload.chit_id || null,
        status: payload.status || 'delivered',
        delivered_count: payload.delivered_count || 0,
        failed_count: payload.failed_count || 0,
        pending_count: payload.pending_count || 0,
        metadata: payload.metadata || {}
      }])
      .select('*, profiles(full_name)')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update notification status or content
   */
  async updateNotification(id, updates) {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(full_name)')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete notification
   */
  async deleteNotification(id) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Resend a failed notification
   */
  async resendFailed(notification) {
    return this.sendNotification({
      title: notification.title,
      body: notification.body,
      type: notification.type,
      target_user_id: notification.target_user_id,
      chit_id: notification.chit_id,
      status: 'delivered',
      delivered_count: notification.delivered_count || 0,
      failed_count: 0,
      pending_count: 0,
      metadata: notification.metadata || {}
    })
  },

  /**
   * Specialized reminder helper
   */
  async sendReminder(userId, chitId, amount) {
    return this.sendNotification({
      title: 'Institutional Payment Reminder',
      body: `Gentle reminder: Your installment of ₹${Number(amount).toLocaleString()} for your scheme is overdue. Please clear it to avoid penalties and maintain trust compliance.`,
      type: 'contribution_due',
      target_user_id: userId,
      chit_id: chitId,
      status: 'delivered'
    })
  }
}
