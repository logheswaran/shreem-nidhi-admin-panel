import { supabase } from '../../core/lib/supabase'

/**
 * Client-side audit log writer for UI-initiated admin mutations.
 * Non-blocking — failures are logged to console but never throw.
 * 
 * Usage:
 *   await writeAuditLog({ action: 'FREEZE', tableName: 'profiles', recordId: userId })
 * 
 * @param {Object} params
 * @param {string} params.action - Action label (e.g. 'FREEZE', 'KYC_VERIFY', 'ROLE_CHANGE', 'REVERSE_PAYMENT')
 * @param {string} params.tableName - Target table name
 * @param {string} params.recordId - UUID of the affected record
 */
export async function writeAuditLog({ action, tableName, recordId }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action,
      table_name: tableName,
      record_id: recordId
    })
  } catch (e) {
    // Audit log failure must NEVER block the primary action
    console.error('[AuditLog] Write failed (non-blocking):', e)
  }
}
