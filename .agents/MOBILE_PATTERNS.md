# Mobile-First Responsive Design Patterns Guide

**For**: HMS Healthcare Frontend Development Team  
**Last Updated**: September 11, 2026  
**Scope**: Next.js React Components with Tailwind CSS

---

## Quick Reference: Copy-Paste Patterns

### Pattern 1: Responsive Page Layout

```tsx
// ✅ CORRECT - Mobile-first page container
export default function YourPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white safe-area-padding">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 py-4 px-4 sm:px-6">
        <div className="container mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Your Title</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-5 sm:py-6 px-4 sm:px-6">
        {/* Content goes here */}
      </main>

      {/* Mobile-Only Footer Actions */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom shadow-lg">
        <button className="w-full h-12 bg-primary-teal text-white rounded-lg font-semibold">
          Action Button
        </button>
      </div>

      {/* Safe area spacer for mobile */}
      <div className="h-20 sm:h-0" /> {/* Account for fixed footer on mobile */}
    </div>
  );
}
```

**Key Points**:
- ✅ `safe-area-padding` handles iPhone notches
- ✅ Sticky header stays at top while scrolling
- ✅ Main content has responsive padding
- ✅ Mobile footer positioned with `safe-area-bottom`
- ✅ `sm:hidden` hides mobile-only elements on desktop

---

### Pattern 2: Responsive Form Layout

```tsx
// ✅ CORRECT - Mobile-first form
<Form layout="vertical" onFinish={handleSubmit}>
  {/* Single column on mobile, two columns on larger screens */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
    <Form.Item label="First Name" name="firstName">
      <Input placeholder="First name" size="large" />
    </Form.Item>
    
    <Form.Item label="Last Name" name="lastName">
      <Input placeholder="Last name" size="large" />
    </Form.Item>
  </div>

  {/* Full width on all screens */}
  <Form.Item label="Notes" name="notes">
    <Input.TextArea rows={4} placeholder="Additional notes" />
  </Form.Item>

  {/* Responsive button */}
  <Form.Item>
    <HmsButton
      variant="primary"
      htmlType="submit"
      size="lg"
      fullWidth
      className="h-12 sm:h-14"
    >
      Submit Form
    </HmsButton>
  </Form.Item>
</Form>
```

**Key Points**:
- ✅ `grid grid-cols-1 sm:grid-cols-2` for 1-column on mobile
- ✅ `size="large"` on inputs ensures touch-friendly 48px height
- ✅ `fullWidth` makes buttons responsive
- ✅ `rows={4}` on textarea shows multiple lines without horizontal scroll

---

### Pattern 3: Responsive Grid Cards

```tsx
// ✅ CORRECT - Mobile-first card grid
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map((item) => (
    <HmsPremiumCard
      key={item.id}
      title={item.title}
      compact // Mobile-friendly version
      variant="elevated"
    >
      <p className="text-sm text-slate-600">{item.description}</p>
    </HmsPremiumCard>
  ))}
</div>
```

**Breakpoint Breakdown**:
- **Mobile (320-639px)**: 1 column
- **Tablet (640-767px)**: 2 columns
- **Tablet (768-1023px)**: 3 columns
- **Desktop (1024px+)**: 4 columns

---

### Pattern 4: Responsive Header with Actions

```tsx
// ✅ CORRECT - Header with mobile icon buttons, desktop text buttons
<header className="bg-white border-b border-slate-200">
  <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="flex items-center gap-3">
      <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Page Title</h1>
    </div>

    {/* Mobile: Icon buttons only */}
    <div className="flex items-center gap-2 sm:hidden">
      <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
        <Settings className="w-5 h-5" />
      </button>
      <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
        <Download className="w-5 h-5" />
      </button>
    </div>

    {/* Desktop: Text buttons */}
    <div className="hidden sm:flex items-center gap-2">
      <HmsButton variant="secondary">Settings</HmsButton>
      <HmsButton variant="primary">Download</HmsButton>
    </div>
  </div>
</header>
```

**Key Points**:
- ✅ `flex flex-col sm:flex-row` stacks on mobile
- ✅ `sm:hidden` shows icon-only on mobile
- ✅ `hidden sm:flex` shows text buttons on desktop
- ✅ Actions always accessible, optimized per device

---

### Pattern 5: Responsive Table with Mobile Scroll

```tsx
// ✅ CORRECT - Table that scrolls horizontally on mobile
<div className="overflow-x-auto -mx-4 sm:-mx-6">
  <div className="px-4 sm:px-6">
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      size="small"
      responsive
    />
  </div>
</div>
```

**Alternative**: Use custom mobile view for tables on small screens

```tsx
// Show custom mobile card view on mobile, table on desktop
<>
  {/* Mobile view - hidden on sm: and up */}
  <div className="sm:hidden space-y-3">
    {items.map((item) => (
      <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">{item.name}</span>
          <span className="text-sm text-slate-600">{item.status}</span>
        </div>
        <p className="text-sm text-slate-500">{item.description}</p>
      </div>
    ))}
  </div>

  {/* Desktop table view - hidden on mobile */}
  <div className="hidden sm:block overflow-x-auto">
    <Table columns={columns} dataSource={items} />
  </div>
</>
```

---

### Pattern 6: Responsive Typography

```tsx
// ✅ CORRECT - Responsive text sizes
<div>
  {/* Page title - scales with screen size */}
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
    Responsive Heading
  </h1>

  {/* Section title */}
  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mt-6">
    Section Title
  </h2>

  {/* Body text - minimum 16px on inputs to prevent iOS zoom */}
  <p className="text-base sm:text-lg md:text-lg text-slate-600 leading-relaxed">
    This is body text that scales responsively.
  </p>

  {/* Small text - only use for hints, captions */}
  <p className="text-xs sm:text-sm text-slate-500">
    Small supporting text
  </p>
</div>
```

**Typography Scale Reference**:
- `text-xs` = 12px (captions, badges)
- `text-sm` = 14px (small body)
- `text-base` = 16px (body - minimum for inputs!)
- `text-lg` = 18px (large body)
- `text-xl` = 20px (subheading)
- `text-2xl` = 24px (section title)
- `text-3xl` = 30px (page title)

---

### Pattern 7: Responsive Spacing

```tsx
// ✅ CORRECT - Progressive spacing that increases with screen size
<div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
  <div>Content 1</div>
  <div>Content 2</div>
  <div>Content 3</div>
</div>
```

**Common Spacing Patterns**:
```tsx
// Padding progression
className="p-4 sm:p-6 md:p-8" // 16px → 24px → 32px

// Margin progression  
className="my-4 sm:my-6 md:my-8" // 16px → 24px → 32px

// Gap between items
className="gap-3 sm:gap-4 md:gap-6" // 12px → 16px → 24px

// Button sizing
className="h-10 sm:h-12 md:h-14" // 40px → 48px → 56px
```

---

### Pattern 8: Mobile Bottom Action Bar

```tsx
// ✅ CORRECT - Fixed bottom bar for mobile, normal placement on desktop
<>
  {/* Main content with padding for bottom bar */}
  <main className="pb-20 sm:pb-0">
    {/* Page content */}
  </main>

  {/* Mobile action bar - fixed on mobile, hidden on desktop */}
  <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom">
    <div className="flex gap-3">
      <HmsButton variant="secondary" fullWidth size="lg">Cancel</HmsButton>
      <HmsButton variant="primary" fullWidth size="lg">Confirm</HmsButton>
    </div>
  </div>

  {/* Desktop action bar - hidden on mobile */}
  <div className="hidden sm:flex justify-end gap-3 mt-8">
    <HmsButton variant="secondary">Cancel</HmsButton>
    <HmsButton variant="primary">Confirm</HmsButton>
  </div>
</>
```

**Key Points**:
- ✅ `pb-20` on main content prevents bottom bar from covering content
- ✅ `sm:hidden` on mobile bar means it appears only on mobile
- ✅ `hidden sm:flex` on desktop bar means it appears only on desktop
- ✅ `safe-area-bottom` handles iPhone home indicator

---

### Pattern 9: Conditional Rendering by Screen Size

```tsx
// ✅ CORRECT - Hide/show elements based on screen size
<div>
  {/* Mobile optimized content */}
  <div className="sm:hidden">
    <h2 className="text-lg font-bold">Mobile Headline</h2>
    <p className="text-sm">Mobile content</p>
  </div>

  {/* Desktop optimized content */}
  <div className="hidden sm:block">
    <h2 className="text-2xl font-bold">Desktop Headline</h2>
    <p>Desktop content with more details</p>
  </div>

  {/* Tablet-only content */}
  <div className="hidden sm:block md:hidden">
    <p>Only visible on tablets (640px - 767px)</p>
  </div>

  {/* Content visible everywhere except mobile */}
  <div className="sm:block hidden">
    <p>Hidden on mobile, visible sm: and up</p>
  </div>
</div>
```

---

### Pattern 10: Safe Area Support for iPhone Notches

```tsx
// ✅ CORRECT - Support for iPhone notches and home indicators
<div className="safe-area-padding safe-area-bottom">
  {/* Content automatically gets safe area padding */}
</div>

// Or manually:
<div className="p-4 sm:p-6 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]">
  {/* Content respects safe areas */}
</div>

// For bottom positioning:
<div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]">
  {/* Bottom bar respects home indicator */}
</div>
```

---

## Anti-Patterns: What NOT to Do

### ❌ Anti-Pattern 1: Fixed Pixel Widths

```tsx
// ❌ BAD - Fixed width breaks on mobile
<div className="w-96"> {/* 384px - too wide for 360px phone */}

// ✅ GOOD - Responsive width
<div className="w-full max-w-md px-4">
```

### ❌ Anti-Pattern 2: Hardcoded Small Font Sizes

```tsx
// ❌ BAD - Too small to read on mobile
<p className="text-xs">This text is unreadable on mobile</p>

// ✅ GOOD - Responsive text size
<p className="text-sm sm:text-base">This text is readable everywhere</p>
```

### ❌ Anti-Pattern 3: No Touch Target Consideration

```tsx
// ❌ BAD - 24px button, too small for fingers
<button className="h-6 px-2 text-xs">Tiny Button</button>

// ✅ GOOD - 48px minimum height
<button className="h-12 px-4 text-base">Touch-Friendly Button</button>
```

### ❌ Anti-Pattern 4: Desktop-First Classes

```tsx
// ❌ BAD - Starts with 4 columns, then narrows down
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1">

// ✅ GOOD - Starts with 1 column, expands up
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
```

### ❌ Anti-Pattern 5: Missing Safe Areas

```tsx
// ❌ BAD - Content hidden under iPhone notch
<div className="fixed top-0 left-0 right-0">

// ✅ GOOD - Safe area support
<div className="fixed top-0 left-0 right-0 pt-[env(safe-area-inset-top)]">
```

### ❌ Anti-Pattern 6: Hover-Only Interactions

```tsx
// ❌ BAD - Mobile has no hover state
<button className="hover:bg-blue-600">
  This button is unclickable on mobile!
</button>

// ✅ GOOD - Touch and click feedback
<button className="bg-blue-600 hover:bg-blue-700 active:scale-95">
  This works on all devices!
</button>
```

### ❌ Anti-Pattern 7: Horizontal Scrolling on Mobile

```tsx
// ❌ BAD - Content wider than viewport
<div className="w-96"> {/* Forces horizontal scroll */}
  <table> {/* Wide table causes scroll */}

// ✅ GOOD - Scrollable wrapper on mobile only
<div className="overflow-x-auto sm:overflow-visible">
  <table className="w-full min-w-full"> {/* Scrolls on mobile, normal on desktop */}
```

---

## HmsButton Size Guidelines

### When to Use Each Size

```tsx
// Use size="xs" (32px) ONLY for:
// - Icon-only buttons in compact spaces
// - Table action buttons (only when multiple per row)
<HmsButton size="xs" icon={<Edit />} />

// Use size="sm" (40px) for:
// - Secondary actions
// - Table row actions
// - Back buttons
// - Inline action buttons
<HmsButton size="sm" variant="secondary">Back</HmsButton>

// Use size="md" (48px) for:
// - Default form submissions
// - Dialog actions
// - Normal workflow buttons
<HmsButton size="md">Save</HmsButton>

// Use size="lg" (56px) for:
// - Primary page actions
// - Important CTAs
// - Mobile main buttons
<HmsButton size="lg" variant="primary" fullWidth>Sign In</HmsButton>

// Use size="xl" (64px) ONLY for:
// - Emergency actions
// - Critical decision buttons
// - Large kiosk touch interfaces
<HmsButton size="xl" variant="danger">EMERGENCY ALERT</HmsButton>
```

---

## Touch Target Checklist

Before shipping any mobile page:

- [ ] All buttons are ≥44×44px (minimum iOS/Android standard)
- [ ] Spacing between touch targets is ≥8px
- [ ] Form inputs are at least 48px tall
- [ ] No hover-only interactions (use `:active` instead)
- [ ] Font size on inputs is 16px minimum (prevents iOS zoom)
- [ ] All text has 4.5:1 color contrast
- [ ] Focus states are visible (3px outline)
- [ ] Safe areas are respected (no content under notches)

---

## Testing Checklist

For each page before marking "mobile-ready":

### Visual Testing
- [ ] Test on 320px viewport (iPhone SE)
- [ ] Test on 375px viewport (iPhone 12)
- [ ] Test on 430px viewport (iPhone Pro Max)
- [ ] Test on 768px viewport (iPad portrait)
- [ ] No horizontal scrolling on any mobile size
- [ ] Typography is readable (not too small)
- [ ] Images scale properly

### Interaction Testing
- [ ] All buttons are easily tappable
- [ ] Forms work without zooming
- [ ] Dropdowns open fully on mobile
- [ ] Modal/dialog doesn't exceed screen height
- [ ] Scrolling is smooth (no layout shift)
- [ ] Loading states are visible

### Accessibility Testing
- [ ] Tab through all interactive elements
- [ ] Use screen reader (VoiceOver/TalkBack)
- [ ] Test with zoom at 200%
- [ ] Verify color contrast with tool

### Performance Testing
- [ ] Page loads in <3 seconds on 3G
- [ ] Images are optimized for mobile
- [ ] No layout shift during load
- [ ] Animations are smooth (60fps)

---

## References

- [Premium UI/UX Skill](./premium-ui-ux.md)
- [Frontend Architecture Rules](./frontend.md)
- [HMS Design System](../CONTEXT.md)
- [WCAG 2.1 Mobile Guidelines](https://www.w3.org/TR/WCAG21/)
- [Apple Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Google Material Design - Responsive Design](https://material.io/design/layout/responsive-layout-grid.html)

