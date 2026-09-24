# HMS Project Context

## Source of Truth
frontend_ui_ux_implementation_plan.md is the master frontend architecture and UI/UX specification.

## Product
Multi-tenant Hospital Management System (HMS)

## Hierarchy
Super Admin -> Hospital -> Department -> Staff -> Patient

## Technology
Web: Next.js + React + Ant Design
Mobile: Flutter

## Non-Negotiable Rules
- Mobile-first UI
- Route integrity
- No architecture-breaking changes
- Reuse shared components
- No hardcoded production data
- Maintain tenant isolation

## Current Focus
Frontend audit, UI consistency, route validation, responsive compliance.
