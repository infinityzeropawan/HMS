# SKILL: Premium UI/UX Design System for Healthcare Applications

<!-- Source: HMS Premium UI/UX Redesign Guidelines -->

> **MANDATORY FOR ALL FRONTEND DEVELOPMENT**
> These guidelines establish premium, mobile-first design patterns for healthcare applications.

---

## 1. Design Philosophy

### 1.1 Healthcare-First Principles
- **Clarity over decoration**: Every design choice must enhance usability
- **Accessibility as priority**: WCAG 2.1 AA compliance is non-negotiable
- **Emergency readiness**: Critical functions must work flawlessly on smallest screens
- **Professional trust**: Design must inspire confidence in medical staff

### 1.2 Mobile-First Mindset
- **Primary device**: Smartphones (360px-430px width)
- **Touch-first**: Design for fingers, not mice
- **One-handed use**: Critical actions accessible with thumb
- **Offline consideration**: Assume intermittent connectivity

### 1.3 Premium Healthcare Aesthetic
- **Clean, professional**: No unnecessary decoration
- **Consistent spacing**: 4px baseline grid system
- **Subtle animations**: Smooth transitions (150ms-300ms)
- **High contrast**: Minimum 4.5:1 text contrast ratio

---

## 2. Premium Design System

### 2.1 Color System
```css
/* Primary Healthcare Colors */
--color-primary-teal: #0D9488;        /* Brand primary - WCAG AA */
--color-primary-dark-teal: #0C7C71;   /* 15% darker for hover */
--color-primary-light-teal: #E6F7F5;  /* Light backgrounds */

/* Role-based Colors */
--color-doctor: #0D9488;              /* Doctor interface accent */
--color-nurse: #7C3AED;               /* Nurse interface accent */
--color-reception: #2563EB;           /* Reception interface accent */
--color-billing: #059669;             /* Billing interface accent */
--color-pharmacy: #F59E0B;            /* Pharmacy interface accent */
--color-lab: #DC2626;                 /* Lab interface accent */

/* Semantic Colors (Improved Contrast) */
--color-success: #059669;             /* Was #10B981 */
--color-error: #DC2626;               /* Was #EF4444 */
--color-warning: #F59E0B;             /* Unchanged - good contrast */
--color-info: #2563EB;                /* Was #3B82F6 */
```

### 2.2 Typography System
```css
/* Font Families */
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;

/* Mobile-First Scale */
--text-xs: 0.75rem;      /* 12px - labels, captions */
--text-sm: 0.875rem;     /* 14px - body small */
--text-base: 1rem;       /* 16px - body (prevents iOS zoom) */
--text-lg: 1.125rem;     /* 18px - body large */
--text-xl: 1.25rem;      /* 20px - subheadings */
--text-2xl: 1.5rem;      /* 24px - headings */
--text-3xl: 1.875rem;    /* 30px - page titles */
```

### 2.3 Spacing System (4px Baseline)
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### 2.4 Border Radius System
```css
--radius-sm: 0.375rem;   /* 6px - inputs, badges */
--radius-md: 0.5rem;     /* 8px - buttons, cards */
--radius-lg: 0.75rem;    /* 12px - large cards */
--radius-xl: 1rem;       /* 16px - premium containers */
```

---

## 3. Mobile-First Component Patterns

### 3.1 Touch-Friendly Sizing (WCAG 2.1)
```tsx
// Minimum touch target: 44×44px
<button className="min-h-[44px] min-w-[44px] px-4">

// Ideal touch target: 48×48px  
<button className="h-12 px-5"> {/* 48px height */}

// Touch spacing: ≥8px between targets
<div className="space-y-2"> {/* 8px gap */}
```

### 3.2 Premium Card Component
```tsx
<HmsPremiumCard
  title="Patient Queue"
  subtitle="Current waiting list"
  icon={Users}
  variant="elevated"
  role="doctor"
  compact={isMobile}
>
  {/* Card content */}
</HmsPremiumCard>
```

### 3.3 Premium Button Component
```tsx
<HmsButton
  variant="primary"
  size="lg"                // xs|sm|md|lg|xl
  role="doctor"           // role-based styling
  fullWidth={isMobile}
  loading={isSubmitting}
  loadingText="Processing..."
  className="active:scale-98" // Press feedback
>
  Sign In
</HmsButton>
```

### 3.4 Mobile Navigation Pattern
```tsx
<HmsMobileNav
  userRole="DOCTOR"
  currentPath="/queue"
  onNavigate={handleNavigate}
  onLogout={handleLogout}
  notificationCount={3}
  userName="Dr. Rajesh Sharma"
/>
```

---

## 4. Role-Based Interface Guidelines

### 4.1 Doctor Interface
- **Priority**: Patient queue, quick access to EHR
- **Pattern**: Dashboard → Queue → Encounter workflow
- **Mobile optimization**: One-handed chart review, quick prescription
- **Color**: Primary teal with success green accents

### 4.2 Nurse Interface  
- **Priority**: Ward rounds, MAR administration
- **Pattern**: Ward view → Patient → Vitals/MAR
- **Mobile optimization**: Barcode scanning, quick data entry
- **Color**: Purple with attention amber accents

### 4.3 Reception Interface
- **Priority**: Patient registration, appointment scheduling
- **Pattern**: Search → Register → Appointment workflow
- **Mobile optimization**: Camera document capture, quick search
- **Color**: Blue with info blue accents

### 4.4 Billing Interface
- **Priority**: Invoice generation, payment processing
- **Pattern**: Invoice → Payment → Receipt workflow
- **Mobile optimization**: QR code scanning, receipt printing
- **Color**: Emerald green with financial teal accents

---

## 5. Healthcare-Specific UX Patterns

### 5.1 Emergency Access Pattern
```tsx
// Critical actions must be immediately accessible
<EmergencyActionButton
  label="STAT Alert"
  icon={AlertTriangle}
  color="crimson"
  size="xl"
  accessibleWithOneHand
/>
```

### 5.2 Clinical Data Entry
```tsx
// Mobile-optimized form for clinical data
<ClinicalForm
  fields={[
    { label: "Blood Pressure", type: "bp", required: true },
    { label: "Heart Rate", type: "number", unit: "bpm" },
  ]}
  layout="vertical"      // Mobile: vertical
  showNormalRanges      // Always show reference values
  autoSave={true}       // Save progress automatically
/>
```

### 5.3 Medication Administration
```tsx
// MAR (Medication Administration Record) pattern
<MarEntry
  medication={medication}
  scheduledTime="14:00"
  status="due"
  onAdminister={handleAdminister}
  onMiss={handleMiss}
  requireWitness={isControlledDrug}
/>
```

### 5.4 Patient Search & Deduplication
```tsx
<PatientSearch
  placeholder="Search by name, UHID, or mobile"
  searchTypes={["name", "uhid", "mobile", "aadhaar"]}
  showDeduplicationWarning
  onSelect={handleSelect}
  mobileOptimized={true}
/>
```

---

## 6. Accessibility Requirements

### 6.1 WCAG 2.1 AA Compliance
- **Text contrast**: ≥4.5:1 for normal text, ≥3:1 for large text
- **Touch targets**: ≥44×44px with ≥8px spacing
- **Focus indication**: Visible focus ring (3px, colorPrimary)
- **Text resizing**: Support 200% zoom without loss of functionality
- **Screen reader**: Full ARIA label support

### 6.2 Healthcare-Specific Accessibility
- **Color blind safe**: Don't rely solely on color (e.g., use icons + color)
- **Low vision**: Support system font size increases
- **Motor impairments**: Support switch access, voice control
- **Cognitive**: Clear labels, consistent patterns, no time limits

### 6.3 Mobile-Specific Accessibility
```css
/* Prevent iOS zoom on inputs */
input, textarea, select {
  font-size: 16px !important;
}

/* Support safe areas */
@supports (padding: max(0px)) {
  .safe-area {
    padding: max(1rem, env(safe-area-inset));
  }
}

/* Touch feedback */
button:active {
  transform: scale(0.98);
}
```

---

## 7. Performance & Optimization

### 7.1 Mobile Performance Targets
- **First Contentful Paint**: <2s on 3G
- **Time to Interactive**: <3s on 3G  
- **Core Web Vitals**: All "Good" scores
- **Bundle size**: <200KB critical path

### 7.2 Optimization Strategies
```tsx
// Lazy load non-critical components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Optimize images for mobile
<img
  src="/image.jpg"
  srcSet="/image-400.jpg 400w, /image-800.jpg 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
/>

// Critical CSS inlined, rest async
```

### 7.3 Offline Capability
- **Cache critical assets**: App shell, core components
- **Background sync**: Queue actions when offline
- **Progressive enhancement**: Basic functionality without JS
- **Storage optimization**: IndexedDB for clinical data

---

## 8. Testing & Quality Assurance

### 8.1 Device Testing Matrix
```yaml
Smartphones:
  - iPhone SE: 320×568 (small)
  - iPhone 12/13/14: 390×844 (standard)
  - Samsung Galaxy: 360×740 (Android)
  - iPhone Plus: 428×926 (large)

Tablets:
  - iPad Mini: 768×1024 (portrait)
  - iPad Air: 820×1180 (landscape)

Breakpoints:
  - xs: 360px (mobile small)
  - sm: 480px (mobile standard)
  - md: 768px (tablet)
  - lg: 1024px (desktop)
```

### 8.2 Healthcare-Specific Testing
- **Emergency workflow**: Test under poor connectivity
- **Data accuracy**: Verify calculations (GST, dosages)
- **Security**: Test session timeout, data encryption
- **Compliance**: Verify audit logs, consent tracking

### 8.3 User Testing Checklist
- [ ] Doctor can complete encounter in <5 minutes on mobile
- [ ] Nurse can record vitals with one hand
- [ ] Reception can register patient in <3 minutes
- [ ] Billing can generate invoice in <2 minutes
- [ ] All critical functions work offline
- [ ] No horizontal scrolling on mobile
- [ ] All touch targets ≥44×44px

---

## 9. Implementation Examples

### 9.1 Premium Login Screen
```tsx
// See: web/src/app/(auth)/login/page.tsx
// Features: Mobile-first, touch-friendly, role-based demo, security cues
```

### 9.2 Doctor Dashboard
```tsx
// See: web/src/app/(doctor)/queue/page.tsx  
// Features: Stats cards, patient queue, mobile actions, role-based colors
```

### 9.3 Premium Components
```tsx
// HmsPremiumCard: web/src/common_components/HmsPremiumCard/
// HmsMobileNav: web/src/common_components/HmsMobileNav/
// HmsButton: web/src/common_components/HmsButton/
```

---

## 10. Compliance & Documentation

### 10.1 Required Documentation
- **Design decisions**: Record in architecture/decisions.md
- **Accessibility audit**: WCAG 2.1 compliance report
- **Performance metrics**: Core Web Vitals scores
- **User testing**: Healthcare staff feedback

### 10.2 Change Management
- **Backward compatibility**: Don't break existing workflows
- **Gradual rollout**: A/B test with pilot users
- **Training materials**: Update for healthcare staff
- **Support documentation**: Update help guides

> **Remember**: In healthcare, good design isn't just nice—it's critical. Every pixel must serve a purpose in improving patient care and staff efficiency.