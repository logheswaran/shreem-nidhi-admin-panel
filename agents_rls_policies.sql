-- ============================================================
-- AGENTS MODULE: RLS POLICIES
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. AGENTS TABLE
-- Allow authenticated users (admins) to SELECT all agents
CREATE POLICY "Admins can read agents"
  ON agents FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT new agents
CREATE POLICY "Admins can insert agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to UPDATE agent status
CREATE POLICY "Admins can update agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to DELETE agents (no-referral guard is on frontend)
CREATE POLICY "Admins can delete agents"
  ON agents FOR DELETE
  TO authenticated
  USING (true);


-- 2. AGENT_REFERRALS TABLE
-- Allow authenticated users to read all referrals
CREATE POLICY "Admins can read agent_referrals"
  ON agent_referrals FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert referrals
CREATE POLICY "Admins can insert agent_referrals"
  ON agent_referrals FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- 3. AGENT_COMMISSIONS TABLE
-- Allow authenticated users to read all commissions
CREATE POLICY "Admins can read agent_commissions"
  ON agent_commissions FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert commissions
CREATE POLICY "Admins can insert agent_commissions"
  ON agent_commissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- VERIFY: After running, test with:
--   SELECT * FROM agents;               -- should return your row
--   SELECT * FROM agent_referrals;      -- should return 0 rows (empty)
--   SELECT * FROM agent_commissions;    -- should return 0 rows (empty)
-- ============================================================
