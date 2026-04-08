# ShreemNidhi Admin Panel - Features CRUD Checklist

This checklist is organized one subsection per file in `src/features`. It is meant to drive implementation of write and update CRUD safely in a fintech admin panel.

Use this rule set everywhere:
- Put feature data access in the feature's `api.js`
- Keep UI state in the page, tab, or modal that owns it
- Use direct `insert` or `update` only for single-table, low-risk changes
- Use RPCs for any action that touches money, winners, loans, ledger, or multiple tables
- Add `.select()` after writes when the UI needs the updated row back
- Paginate any list that can grow over time
- Write audit logs for sensitive or destructive actions
- Never let the UI write directly to `ledger`

## `src/features/admin/AdminControls.jsx`

Checklist:
- [x] Keep this file as the admin shell only.
- [x] Remove shared tab data state from the shell.
- [x] Keep only `activeTab` and search UI state here.
- [x] Render each tab component and let that tab own its own fetch logic.
- [x] Do not fetch `profiles`, `audit_logs`, `ledger`, or `kyc_details` here.
- [x] Keep tab switching simple and stateless.

Write/update expectations:
- No direct writes in this file.
- All mutations must live in tab components and call `adminService` methods.

## `src/features/admin/api.js`

Checklist:
- [x] Keep all admin Supabase calls here.
- [x] Replace `getProfiles()` usage in member-only views with `getMembers()`.
- [x] Ensure `verifyKYC(kycId)` does not take an unused `userId` parameter.
- [x] Keep `getAuditLogs()` paginated.
- [x] Keep `getContributionLedger()` server-side filtered and limited.
- [x] Rename or keep `cancelAuctionRound()` aligned with the RPC it calls.
- [x] Use RPCs for freeze, reverse payment, auction cancel, and any multi-table action.
- [x] Return updated rows from update calls when the UI needs them.

Write/update expectations:
- Direct update is fine for `profiles.role_type` and `kyc_details` status changes.
- RPC is required for freeze/unfreeze, reverse payment, and auction cancellation.
- Never insert directly into `ledger` from this file unless the backend explicitly allows it.

## `src/features/admin/tabs/RolesTab.jsx`

Checklist:
- [x] Load roles and profiles inside this tab.
- [x] Add role update actions through `adminService.updateRole()`.
- [x] Add loading and saving states per row or action.
- [x] Refresh the tab after successful updates.

Write/update expectations:
- Direct update of `profiles.role_type` is allowed.
- Keep any admin-only changes audited if the action is security-sensitive.

## `src/features/admin/tabs/KYCTab.jsx`

Checklist:
- [x] Load pending KYC records here.
- [x] Verify and reject KYC from this tab only.
- [x] Use the cleaned-up `verifyKYC(kycId)` API.
- [x] Add refresh after each mutation.
- [x] Add audit logging for verify and reject actions.

Write/update expectations:
- Direct update of `kyc_details` status is allowed.
- No RPC is required for a simple verify or reject unless the backend adds side effects.

## `src/features/admin/tabs/AuditTab.jsx`

Checklist:
- [x] Keep this tab read-only.
- [x] Paginate audit logs.
- [x] Add filters if the table is large.
- [x] Do not add mutations here.

Write/update expectations:
- No writes.

## `src/features/admin/tabs/OverridesTab.jsx`

Checklist:
- [x] Load members with `getMembers()` instead of `getProfiles()`.
- [x] Load only the filtered ledger slice needed for override work.
- [x] Keep reversal, freeze, and cancellation actions behind confirmations.
- [x] Add typed confirmation for dangerous actions.
- [x] Write an audit entry after success.

Write/update expectations:
- Use RPC for reversal, freeze, and auction cancellation.
- Do not fetch the full ledger and filter client-side.

## `src/features/admin/tabs/SettingsTab.jsx`

Checklist:
- [x] Replace local-only settings state with persisted backend storage.
- [x] Use a real config table or an RPC-backed config service.
- [x] Load settings from the server on mount.
- [x] Save changes through a service method.
- [x] Add success and failure feedback.

Write/update expectations:
- Direct update is acceptable only if settings live in a single config table.
- If settings affect more than one subsystem, use RPC.

## `src/features/applications/Applications.jsx`

Checklist:
- [x] Keep list state, filters, and pagination here.
- [x] Wire create, review, approve, and reject actions to service methods.
- [x] Open the detail modal for review flows.
- [x] Refresh after successful mutations.
- [x] Add loading and error states for create and review actions.

Write/update expectations:
- Approve should use RPC if it also creates a `chit_members` row.
- Reject can be a direct update when it only changes application status.

## `src/features/applications/hooks.js`

Checklist:
- [x] Own the fetch logic for applications.
- [x] Add pagination and filters.
- [x] Expose mutation helpers for review actions if needed.
- [x] Keep state isolated to the applications feature.

Write/update expectations:
- Use direct update for status-only changes.
- Use RPC for approval if it has downstream side effects.

## `src/features/applications/components/ApplicationDetailModal.jsx`

Checklist:
- [x] Show application details and status history.
- [x] Provide approve and reject actions if the workflow belongs here.
- [x] Confirm destructive review actions.
- [x] Refresh the parent list after mutation.

Write/update expectations:
- Delegate all writes to the applications service or hook.

## `src/features/applications/components/ApplicationFormModal.jsx`

Checklist:
- [x] Validate form input before submit.
- [x] Support create and edit flows if the admin can initiate them.
- [x] Use a single submit handler that calls the service layer.
- [x] Return updated data to the parent after success.

Write/update expectations:
- Create is allowed only if the admin workflow requires it.
- Any create that also creates a membership row must use RPC.

## `src/features/auctions/Auctions.jsx`

Checklist:
- [x] Keep auction list state and filters here.
- [x] Add pagination for historical rounds.
- [x] Route action buttons through service methods.
- [x] Use confirmations for cancel and override flows.

Write/update expectations:
- Cancel and close must stay RPC-backed.
- Do not update winners directly from this page.

## `src/features/auctions/api.js`

Checklist:
- [x] Keep all auction-round and bid queries here.
- [x] Filter and paginate historical data.
- [x] Use RPC for close, cancel, and other multi-table auction actions.
- [x] Do not expose direct winner updates from the UI.

Write/update expectations:
- RPC required for any action that affects bids, winners, or ledger.

## `src/features/auctions/hooks.js`

Checklist:
- [x] Own fetch logic and live refresh behavior.
- [x] Use realtime only for active bid streams or live rounds.
- [x] Refetch after mutation instead of optimistic updates for financial state.

Write/update expectations:
- No direct writes unless the hook is only forwarding to a service method.

## `src/features/auctions/components/LiveAuctionPanel.jsx`

Checklist:
- [x] Render live bid state.
- [x] Use realtime subscriptions only for active auction activity.
- [x] Keep close or cancel actions in the parent page or service layer.

Write/update expectations:
- No direct writes in the live panel.

## `src/features/chits/Chits.jsx`

Checklist:
- [x] Keep list, filters, and pagination here.
- [x] Add create, edit, cancel, and detail entry points.
- [x] Only allow edits in valid chit states.
- [x] Refresh after successful write operations.

Write/update expectations:
- Use direct update for chit metadata when the chit is still forming.
- Use soft delete or cancellation status instead of hard delete.

## `src/features/chits/ChitDetails.jsx`

Checklist:
- [x] Show chit detail, member summary, and status history.
- [x] Expose edit and close actions only when valid.
- [x] Keep data loading isolated to the detail view.

Write/update expectations:
- Close or complete must use RPC if it triggers downstream payout work.

## `src/features/chits/api.js`

Checklist:
- [x] Keep chit reads, create, update, and lifecycle actions here.
- [x] Validate create payloads before insert.
- [x] Restrict updates to allowed states such as `forming`.
- [x] Use RPC for complete or close flows that trigger payouts.

Write/update expectations:
- Direct insert and update are acceptable for chit metadata.
- Never hard delete a live chit.

## `src/features/chits/hooks.js`

Checklist:
- [x] Own the read and mutation state for chits.
- [x] Support pagination and search.
- [x] Refetch after create, update, cancel, or complete.

Write/update expectations:
- Keep all writes delegated to `chits/api.js`.

## `src/features/chits/components/ActionButtons.jsx`

Checklist:
- [x] Keep action buttons thin and declarative.
- [x] Disable buttons while a mutation is in flight.
- [x] Route all actions to the parent or service layer.

Write/update expectations:
- No direct writes in the button component.

## `src/features/chits/components/ChitCard.jsx`

Checklist:
- [x] Render chit summary and status.
- [x] Provide entry points to edit or view details.
- [x] Keep the card read-only.

Write/update expectations:
- No writes.

## `src/features/chits/components/ChitQuickView.jsx`

Checklist:
- [x] Show a concise chit summary.
- [x] Keep this component read-only.
- [x] Delegate all actions upward.

Write/update expectations:
- No writes.

## `src/features/chits/components/CreateChitModal.jsx`

Checklist:
- [x] Validate all chit create fields.
- [x] Submit through the chit service.
- [x] Close the modal only after success.
- [x] Return the created row to the parent if needed.

Write/update expectations:
- Direct insert is allowed for creating a chit if it is a single-table action.

## `src/features/dashboard/Dashboard.jsx`

Checklist:
- [x] Keep dashboard read-only.
- [x] Use it for summaries, charts, and KPIs only.
- [x] Do not place business mutations here.

Write/update expectations:
- No writes.

## `src/features/dashboard/api.js`

Checklist:
- [x] Keep summary queries here.
- [x] Avoid mutation methods.
- [x] Add pagination or aggregation limits where needed.

Write/update expectations:
- Read only.

## `src/features/dashboard/hooks.js`

Checklist:
- [x] Own dashboard fetch state.
- [x] Keep loading and error handling isolated.

Write/update expectations:
- No writes.

## `src/features/dashboard/components/ActionModal.jsx`

Checklist:
- [x] Keep action UI generic.
- [x] Delegate real work to feature services.

Write/update expectations:
- No direct writes.

## `src/features/dashboard/components/AlertsPanel.jsx`

Checklist:
- [x] Render alerts only.
- [x] Keep it read-only unless it is explicitly a dismissal UI.

Write/update expectations:
- No transactional writes.

## `src/features/dashboard/components/ActivityFeed.jsx`

Checklist:
- [x] Render recent activity only.
- [x] Paginate or cap the feed if needed.

Write/update expectations:
- No writes.

## `src/features/dashboard/components/Charts.jsx`

Checklist:
- [x] Render data visualizations only.
- [x] Keep aggregation in the service layer.

Write/update expectations:
- No writes.

## `src/features/dashboard/components/CollectionHealth.jsx`

Checklist:
- [x] Keep this component read-only.
- [x] Use it to show collection metrics, not to edit them.

Write/update expectations:
- No writes.

## `src/features/dashboard/components/DashboardSkeleton.jsx`

Checklist:
- [x] Keep as loading UI only.

Write/update expectations:
- No writes.

## `src/features/dashboard/components/LedgerTable.jsx`

Checklist:
- [x] Treat ledger rows as read-only.
- [x] Paginate the table.
- [x] Add filters for user, chit, and reference type.

Write/update expectations:
- No direct ledger writes.

## `src/features/dashboard/components/NewDashboardSections.jsx`

Checklist:
- [x] Keep this as presentation-only UI.
- [x] Delegate all data fetching to hooks or services.

Write/update expectations:
- No writes.

## `src/features/dashboard/components/QuickActions.jsx`

Checklist:
- [x] Make every button route to a real feature module.
- [x] Do not embed business logic in this component.

Write/update expectations:
- No direct writes.

## `src/features/dashboard/components/StatsGrid.jsx`

Checklist:
- [x] Render numeric summaries only.
- [x] Keep it fully read-only.

Write/update expectations:
- No writes.

## `src/features/finance/Contributions.jsx`

Checklist:
- [x] Keep contribution list state and filters here.
- [x] Add pagination for large datasets.
- [x] Use service methods for paid, failed, or waived actions.
- [x] Confirm any action that changes money state.

Write/update expectations:
- Mark paid must use RPC because it also writes ledger.
- Mark failed can be a direct update if it has no side effects.

## `src/features/finance/Ledger.jsx`

Checklist:
- [x] Treat the ledger as read-only.
- [x] Add filters and pagination.
- [x] Use detail modals for inspection, not editing.

Write/update expectations:
- No direct inserts or updates.

## `src/features/finance/Loans.jsx`

Checklist:
- [x] Keep loan list and filters here.
- [x] Wire issue, payment, and close actions to the service layer.
- [x] Confirm financial mutations.

Write/update expectations:
- Issue loan and record payment must use RPC.
- Close can be a direct update only if it does not touch other tables.

## `src/features/finance/MonthlyOperations.jsx`

Checklist:
- [x] Keep month-based workflows here.
- [x] Make every money-related operation explicit and confirmed.
- [x] Use service methods for all operations.

Write/update expectations:
- RPC required for anything that creates ledger entries or payment side effects.

## `src/features/finance/PaymentDashboard.jsx`

Checklist:
- [x] Keep this view read-heavy and action-light.
- [x] Delegate mutations to proper service methods.

Write/update expectations:
- Avoid direct writes.

## `src/features/finance/PaymentGrid.jsx`

Checklist:
- [x] Render payment rows only.
- [x] Keep inline actions minimal.
- [x] Use pagination and filters.

Write/update expectations:
- No direct money writes.

## `src/features/finance/useLedger.js`

Checklist:
- [x] Keep ledger fetch and filters here.
- [x] Add pagination support.
- [x] Expose read helpers, not write logic.

Write/update expectations:
- Read only.

## `src/features/finance/api.js`

Checklist:
- [x] Keep contribution, loan, ledger, maturity, and reversal service methods here.
- [x] Use RPC for any money-changing action.
- [x] Keep list queries paginated and filtered.
- [x] Never allow direct ledger inserts from the UI path.

## `src/features/finance/Ledger.jsx`

Checklist:
- [x] Treat the ledger as read-only.
- [x] Add filters and pagination.
- [x] Use detail modals for inspection, not editing.

Write/update expectations:
- No direct inserts or updates.

## `src/features/finance/components/LedgerFormModal.jsx`

Checklist:
- [x] Keep this modal read-only unless there is a very specific approved admin action.
- [x] Do not expose ledger insertion controls.

Write/update expectations:
- No direct ledger writes.

## `src/features/finance/components/LedgerDetailModal.jsx`

Checklist:
- [x] Show ledger entry details and related metadata.
- [x] Keep the modal read-only.

Write/update expectations:
- No writes.

Write/update expectations:
- Mark paid, issue loan, record loan payment, and reverse payment must be RPC-backed.

## `src/features/finance/hooks.js`

Checklist:
- [x] Own the feature loading and mutation state.
- [x] Add refetch helpers for post-mutation refresh.

Write/update expectations:
- No direct writes unless the hook only forwards to the service layer.

## `src/features/finance/components/LedgerFormModal.jsx`

Checklist:
- [x] Keep this modal read-only unless there is a very specific approved admin action.
- [x] Do not expose ledger insertion controls.

Write/update expectations:
- No direct ledger writes.

## `src/features/finance/components/LedgerDetailModal.jsx`

Checklist:
- [x] Show ledger entry details and related metadata.
- [x] Keep the modal read-only.

Write/update expectations:
- No writes.

## `src/features/finance/components/payments/PaymentFilters.jsx`

Checklist:
- [x] Add filter controls for payment list narrowing.
- [x] Keep the component stateless if possible.
- [x] Use filters to reduce query size before fetch.

Write/update expectations:
- No writes.

## `src/features/members/Members.jsx`

Checklist:
- [x] Keep member list state, filters, and pagination here.
- [x] Add create and edit entry points.
- [x] Refresh after profile or role updates.

Write/update expectations:
- Direct update is fine for profile fields and role changes if no side effects exist.
- Freeze or unfreeze should use RPC if it affects other tables.

## `src/features/members/MemberProfile.jsx`

Checklist:
- [x] Show detailed profile and related member state.
- [x] Keep editing flows isolated.
- [x] Use `getById` for loading a single member.

Write/update expectations:
- Delegate writes to the member service.

## `src/features/members/api.js`

Checklist:
- [x] Keep member reads and updates here.
- [x] Support detail reads and filtered list reads.
- [x] Add write helpers for create and update.

Write/update expectations:
- Use direct update for profile fields.
- Use RPC for freeze or any multi-table member action.

## `src/features/members/useMembers.js`

Checklist:
- [x] Own the list and mutation state for members.
- [x] Support pagination and search.
- [x] Refetch after writes.

Write/update expectations:
- No direct writes unless the hook is a thin service wrapper.

## `src/features/members/components/MemberFormModal.jsx`

Checklist:
- [x] Validate member form fields.
- [x] Support create and update flows.
- [x] Close only after a successful save.

Write/update expectations:
- Direct insert or update is fine for member profile data.

## `src/features/members/components/MemberQuickViewModal.jsx`

Checklist:
- [x] Keep this modal read-only.
- [x] Use it for fast inspection only.

Write/update expectations:
- No writes.

## `src/features/notifications/Notifications.jsx`

Checklist:
- [x] Keep notification list, filters, and pagination here.
- [x] Add create and bulk-send entry points if supported.
- [x] Refresh after send actions.

Write/update expectations:
- Direct insert is allowed for notification creation when there are no side effects.

## `src/features/notifications/api.js`

Checklist:
- [x] Keep notification queries and insert helpers here.
- [x] Add bulk insert support if broadcasts are needed.
- [x] Add pagination for long histories.

Write/update expectations:
- Direct insert is usually acceptable.
- Avoid unnecessary updates unless a real admin workflow needs them.

## `src/features/notifications/hooks.js`

Checklist:
- [x] Own the fetch and mutation state.
- [x] Add filters for notification type or target.

Write/update expectations:
- No direct writes unless forwarding to the service layer.

## `src/features/notifications/components/BroadcastDetailModal.jsx`

Checklist:
- [x] Show broadcast details and delivery state.
- [x] Keep any send action behind a confirmation.

Write/update expectations:
- Delegate writes to the notification service.

## `src/features/payouts/Payouts.jsx`

Checklist:
- [x] Keep payout queue state and actions here.
- [x] Add confirmation for paid or failed mutations.
- [x] Refresh after each payout action.

Write/update expectations:
- [x] Use RPC if marking paid also writes ledger or audit rows.

## `src/features/payouts/components/`

Checklist:
- [x] Keep payout components focused on display and action wiring.
- [x] Do not let child components write directly to the database.

Write/update expectations:
- No direct writes from presentational components.

## `src/features/reports/Reports.jsx`

Checklist:
- [x] Keep reports read-only.
- [x] Use server-side aggregation or filtered reads.
- [x] Add export and filter support if needed.

Write/update expectations:
- No writes.

## `src/features/risk/RiskPanel.jsx`

Checklist:
- [x] Keep risk analysis read-only.
- [x] Use it to present scores, flags, and review context only.

Write/update expectations:
- No writes unless an explicit admin override workflow is routed elsewhere.

## `src/features/risk/hooks/useRiskAnalysis.js`

Checklist:
- [x] Keep analysis logic and fetch state here.
- [x] Avoid any mutation behavior.

Write/update expectations:
- Read only.

## `src/features/risk/utils/riskEngine.js`

Checklist:
- [x] Keep risk scoring logic pure.
- [x] Avoid side effects and database access.

Write/update expectations:
- No writes.

## `src/features/auth/Login.jsx`

Checklist:
- [x] Keep login flow isolated from admin CRUD.
- [x] Only handle authentication and session setup.

Write/update expectations:
- No business CRUD writes.

## `src/features/auth/Profile.jsx`

Checklist:
- [x] Allow updates only for the signed-in user's allowed profile fields.
- [x] Keep admin-only operations out of this file.

Write/update expectations:
- Direct update is acceptable only for user-owned profile fields.

## `src/features/auth/authService.js`

Checklist:
- [x] Keep auth and session helpers here.
- [x] Do not mix business CRUD into this service.

Write/update expectations:
- No admin mutations.

## `src/features/*/components/` files

Checklist:
- [x] Keep presentational components read-only where possible.
- [x] Route all mutations upward to the owning page or hook.
- [x] Disable buttons while a save is in progress.

Write/update expectations:
- Child components should not talk directly to Supabase.

## `src/features/*/hooks.js` and `src/features/*/use*.js`

Checklist:
- [x] Keep fetch logic and mutation orchestration close to the feature.
- [x] Add refetch helpers after successful writes.
- [x] Keep hook state local to the feature.

Write/update expectations:
- Hooks may call service methods, but they should not contain raw table logic unless that feature has no `api.js` yet.

## Shared CRUD Rules By Action Type

### Direct query is okay when
- [x] The action touches one table only
- [x] The action has no side effects
- [x] The action does not affect ledger, winners, loans, or payouts

Examples:
- update member role
- reject KYC
- create notification
- update chit metadata while forming

### RPC is required when
- [x] The action touches money
- [x] The action touches ledger
- [x] The action touches winners or auction closure
- [x] The action writes more than one table
- [x] The action must stay atomic

Examples:
- freeze or unfreeze member
- issue loan
- record loan payment
- mark contribution paid
- cancel or close auction round
- reverse payment
- approve application if it creates a membership row
- complete chit with payout work

### Always paginate
- [x] `audit_logs`
- [x] `ledger`
- [x] `bids`
- [x] `loans`
- [x] `contributions`
- [x] `notifications`
- [x] large member or application queues

### Always audit log
- [x] freeze and unfreeze
- [x] KYC verify and reject
- [x] auction cancellation and winner override
- [x] loan issue and repayment
- [x] contribution mark-paid
- [x] payout approval
- [x] application approval when it changes production state

## Priority Order For Implementation

1. Fix `src/features/admin/AdminControls.jsx` and `src/features/admin/api.js` first.
2. Wire RPC-backed writes in `finance`, `auctions`, `applications`, and `payouts`.
3. Add pagination to `ledger`, `audit_logs`, and other large list views.
4. Add audit logging after sensitive admin mutations.
5. Enforce route guards and Supabase RLS.
6. Keep read-only features read-only.

## Final Rule

If a feature can change financial state, member state, or auction state, do not implement the write in the UI alone. Use a service method, use RPC when the action is multi-table, and write an audit entry for the action.
