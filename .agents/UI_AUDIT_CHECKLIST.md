# HMS UI/UX Audit Checklist

Use for every module and page audit.

## Page identity
- [ ] Correct route and page title
- [ ] Correct role layout/sidebar/topbar
- [ ] Breadcrumbs point to real routes
- [ ] Primary CTA has one clear purpose
- [ ] Back/cancel returns to a meaningful existing destination

## Design system
- [ ] Healthcare teal/slate palette matches master guide
- [ ] Inter typography scale
- [ ] 4px spacing scale
- [ ] Standard radius usage
- [ ] Existing shared components reused
- [ ] Status colors remain semantic

## Interaction
- [ ] Labels/terminology match master guide
- [ ] Buttons perform real actions, not placeholder toasts
- [ ] Required/format/range validation exists
- [ ] Destructive actions confirm
- [ ] Loading/empty/error/permission states exist
- [ ] Search debounce exists where specified
- [ ] Tables have suitable filters, sorting and pagination
- [ ] Overflow behavior is intentional

## Responsive/mobile
- [ ] Works at 320px width
- [ ] Interactive targets >= 44x44px
- [ ] No accidental page horizontal overflow
- [ ] Tables use suitable scroll/card treatment
- [ ] Drawers/modals fit narrow screens
- [ ] Header/toolbar actions wrap cleanly
- [ ] Keyboard and touch remain usable

## Routing and data
- [ ] Every internal link target exists
- [ ] Dynamic IDs are available and valid
- [ ] No stale/fabricated route
- [ ] Guard matches role
- [ ] State source is identified
- [ ] API/service chain is traced
- [ ] Mutations refresh relevant state
- [ ] No hard-coded identity/tenant/hospital values
- [ ] No false persistence claims

## Healthcare/compliance
- [ ] Aadhaar masked
- [ ] Consent handled where required
- [ ] Clinical sign-off explicit
- [ ] AI-generated clinical content marked for review
- [ ] Required audit events emitted
- [ ] Tenant/hospital scope server-verified

## Verification
- [ ] Imports/build valid
- [ ] Client/server boundaries valid
- [ ] No obvious undefined/null crashes
- [ ] Relevant runtime errors checked
- [ ] Relevant tests/checks run
- [ ] Findings include file and evidence

## Severity
BLOCKER = demo/security/compliance/core workflow failure
HIGH = broken journey or serious functional mismatch
MEDIUM = significant UX/data problem
LOW = polish/maintainability

Never mark fixed without verifying the changed behavior.