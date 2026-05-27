# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-27

### Added
- Added global premium sticky `Header` navigation bar with links to Accueil, Services, Coupes, Boutique, À propos, and Contact.
- Integrated `CartDrawer` overlay into the root layout so that clicking the shopping cart button in the header opens the cart dynamically.
- Added `formatPrice` utility in `utils/format.ts` to ensure consistent formatting of FCFA prices on both client and server, preventing hydration mismatches.

### Fixed
- Renamed `app/coupes/[id]/pages.tsx` to `page.tsx` so that Next.js dynamic routing resolves `/coupes/[id]` details pages correctly instead of returning 404.
- Resolved client-side React hydration mismatches caused by locale variations of `.toLocaleString()`.
- Cleared stale compilation caches inside `.next/` directory to resolve TypeScript type-validator build errors.

### Removed
- Removed PlayStation 5 session reservation features across the whole application (landing page, services page, booking selection page, testimonials, and about sections).
- Deleted the obsolete `app/api/ps5` mock availability API endpoint.

## [1.0.0] - 2026-05-15

### Added
- Initial layout, pages, and components for the premium barbershop web application.
