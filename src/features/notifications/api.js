import { supabase } from '../../core/lib/supabase'

export const notificationService = {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async sendNotification(payload) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([payload])
      .select()
    if (error) throw error
    return data
  },

  async sendReminder(userId, chitId, amount) {
    return this.sendNotification({
      title: 'Payment Reminder',
      body: `Gentle reminder: Your installment of ₹${amount.toLocaleString()} is overdue. Please clear it to avoid penalties.`,
      type: 'contribution_due',
      target_user_id: userId,
      chit_id: chitId
    })
  }
}
