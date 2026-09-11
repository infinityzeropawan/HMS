# SKILL: Mobile-First Responsive Design & Smartphone Compatibility

<!-- Source: HMS Frontend Mobile Responsiveness Guidelines -->

> **MANDATORY FOR ALL FRONTEND DEVELOPMENT**
> These rules ensure HMS works flawlessly on smartphones, tablets, and desktop devices.

---

## 1. Core Principles

### 1.1 Mobile-First Approach
- **Start with mobile**: Design and code for mobile devices first, then enhance for larger screens
- **Progressive enhancement**: Add complexity and features as screen size increases
- **Content first**: Mobile layout should prioritize essential content and actions

### 1.2 Touch-First Design
- **Touch targets**: Minimum 44×44px for all interactive elements
- **Spacing**: Minimum 8px between touch targets
- **Gestures**: Support common mobile gestures (tap, swipe, pinch)

### 1.3 Performance & Accessibility
- **Fast loading**: Critical content visible within 2 seconds on 3G
- **No horizontal scrolling**: Content should fit within viewport width
- **Font size**: Minimum 16px for body text on mobile
- **Color contrast**: AA compliance (4.5:1) for all text

---

## 2. Responsive Breakpoints & Grid System

### 2.1 Standard Breakpoints
Use these Tailwind breakpoints consistently:

```css
/* Mobile-first breakpoints */
xs: 320px    /* Extra small devices (portrait phones) */
sm: 640px    /* Small devices (landscape phones) */
md: 768px    /* Medium devices (tablets) */
lg: 1024px   /* Large devices (laptops) */
xl: 1280px   /* Extra large devices (desktops) */
2xl: 1440px  /* Large desktops */
```

### 2.2 Responsive Grid Patterns

```tsx
// Basic responsive grid - mobile: 1 col, tablet: 2 cols, desktop: 3 cols
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flexible responsive container
<div className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">

// Responsive spacing
<div className="p-4 sm:p-6 md:p-8">

// Responsive typography
<h1 className="text-2xl sm:text-3xl md:text-4xl">
```

### 2.3 Layout Patterns by Device

| Device | Layout Pattern | Column Count | Font Size |
|--------|----------------|--------------|-----------|
| Mobile (320-639px) | Single column, vertical flow | 1 | Base: 16px |
| Tablet (640-767px) | Two-column, simple grids | 1-2 | Base: 16px |
| Laptop (768-1023px) | Multi-column, sidebar layout | 2-3 | Base: 16px |
| Desktop (1024px+) | Complex multi-pane layouts | 3-4 | Base: 16px |

---

## 3. Component-Specific Responsive Rules

### 3.1 Navigation & Menus
```tsx
// Mobile: Hamburger menu
// Tablet: Collapsible sidebar
// Desktop: Full sidebar + top navigation

// Example responsive navigation
<nav className="flex flex-col md:flex-row items-start md:items-center">
  <button className="md:hidden">☰</button> {/* Mobile hamburger */}
  <div className="hidden md:flex"> {/* Desktop nav items */}</div>
</nav>
```

### 3.2 Forms & Inputs
```tsx
// Mobile: Full-width inputs, vertical layout
// Desktop: Inline labels, horizontal layout

<Form layout="vertical" className="md:grid md:grid-cols-2 md:gap-4">
  {/* Mobile: vertical, Desktop: 2-column grid */}
</Form>
```

### 3.3 Data Tables
```tsx
// Mobile: Cards/list view
// Tablet: Simple table with key columns
// Desktop: Full table with all columns

<div className="overflow-x-auto"> {/* Horizontal scroll on mobile */}
  <table className="min-w-full"> {/* Minimum width for mobile */}
</div>
```

### 3.4 Cards & Dashboards
```tsx
// Mobile: Single column cards
// Desktop: Multi-column grid

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Responsive card grid */}
</div>
```

---

## 4. Mobile-Specific Considerations

### 4.1 Viewport & Meta Tags (MANDATORY)
Every layout must include:
```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0D9488",
};
```

### 4.2 Prevent Zoom on Input Focus
```css
input[type="text"],
input[type="password"],
input[type="email"],
textarea {
  font-size: 16px; /* Prevents iOS zoom */
}
```

### 4.3 Safe Area Insets
```css
/* Support for iPhone X+ notches and home indicators */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### 4.4 Touch Feedback
- **Visual feedback**: Add `:active` or `:focus` states
- **Hover alternatives**: Mobile has no hover state
- **Loading states**: Show spinners for async operations

---

## 5. Testing Checklist

### 5.1 Device Testing Matrix
Test on these viewport sizes:
- ✅ **320px** (iPhone SE)
- ✅ **375px** (iPhone 12/13/14)
- ✅ **414px** (iPhone Plus models)
- ✅ **768px** (iPad portrait)
- ✅ **1024px** (iPad landscape)
- ✅ **1280px** (Desktop)
- ✅ **1440px** (Large desktop)

### 5.2 Functional Testing
- ✅ **Navigation**: Hamburger menu works on mobile
- ✅ **Forms**: Inputs are accessible and don't zoom
- ✅ **Tables**: Horizontal scrolling works
- ✅ **Buttons**: Touch targets ≥44px
- ✅ **Images**: Responsive and load quickly
- ✅ **Text**: Readable without zooming

### 5.3 Performance Testing
- ✅ **Load time**: <3s on 3G
- ✅ **Render**: No layout shifts (CLS)
- ✅ **Interactive**: <100ms response time
- ✅ **Memory**: No leaks on mobile browsers

---

## 6. Common Anti-Patterns to Avoid

### ❌ **Never do this:**
```tsx
// Fixed widths that break on mobile
<div className="w-96"> {/* ❌ Fixed width */}

// Non-responsive containers
<div className="container mx-auto px-0"> {/* ❌ No responsive padding */}

// Small touch targets
<button className="w-6 h-6"> {/* ❌ Too small for touch */}

// Desktop-only hover states
.button:hover { /* ❌ Mobile can't hover */ }

// Horizontal scrolling containers without indication
<div className="overflow-x-hidden"> {/* ❌ Hides overflow */}
```

### ✅ **Always do this:**
```tsx
// Responsive widths
<div className="w-full md:w-96"> {/* ✅ Responsive */}

// Responsive containers
<div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* ✅ Good */}

// Touch-friendly buttons
<button className="min-h-[44px] min-w-[44px]"> {/* ✅ Touch friendly */}

// Touch feedback
.button:active { /* ✅ Mobile feedback */ }

// Clear overflow indication
<div className="overflow-x-auto"> {/* ✅ Scrollable when needed */}
```

---

## 7. Quick Reference Examples

### 7.1 Responsive Card Component
```tsx
export const HmsResponsiveCard: React.FC<HmsCardProps> = ({ children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 
                  p-4 sm:p-6 md:p-8 
                  w-full max-w-full sm:max-w-md md:max-w-lg 
                  mx-auto">
    {children}
  </div>
);
```

### 7.2 Mobile-First Form Layout
```tsx
export const MobileFirstForm = () => (
  <form className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-2">Full Name</label>
      <input className="w-full p-3 border rounded-lg" />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Email</label>
      <input className="w-full p-3 border rounded-lg" />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Phone</label>
      <input className="w-full p-3 border rounded-lg" />
    </div>
  </form>
);
```

### 7.3 Responsive Navigation
```tsx
export const ResponsiveNav = () => (
  <nav className="bg-white border-b">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <div className="text-xl font-bold">HMS</div>
          <div className="hidden md:block ml-10"> {/* Desktop nav */}</div>
        </div>
        <button className="md:hidden"> {/* Mobile menu */}</button>
      </div>
    </div>
  </nav>
);
```

---

## 8. Compliance & Accessibility

### 8.1 WCAG 2.1 Mobile Requirements
- **1.4.4 Resize text**: Text can be resized up to 200% without loss of functionality
- **1.4.10 Reflow**: Content can be presented without horizontal scrolling
- **2.5.5 Target Size**: Touch targets ≥44×44px
- **2.5.6 Concurrent Input Mechanisms**: Support both touch and keyboard

### 8.2 Healthcare-Specific Considerations
- **Emergency access**: Critical functions must work on smallest screens
- **Low vision**: Support system font size settings
- **Color blind**: Don't rely solely on color for meaning
- **Motor impairments**: Support switch access and voice control

---

> **REMEMBER**: Every component must be tested on mobile, tablet, and desktop. Use Chrome DevTools Device Mode for rapid testing.