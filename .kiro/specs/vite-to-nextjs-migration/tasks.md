# Implementation Plan: Vite to Next.js Migration

## Overview

This plan converts the existing Vite + React application to Next.js 14+ with App Router architecture. The migration is performed in-place within the same repository, converting all TypeScript files to JavaScript, transforming React Router routes to file-based routing, and preserving all existing functionality including Supabase integration, Tailwind CSS styling, and shadcn/ui components.

## Tasks

- [x] 1. Remove Vite configuration and dependencies
  - Delete vite.config.ts, index.html, src/main.tsx, and src/vite-env.d.ts
  - Remove Vite-related dependencies from package.json (vite, @vitejs/plugin-react-swc, vite-plugin-pwa)
  - Remove Vite-related scripts from package.json
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [-] 2. Convert TypeScript files to JavaScript
  - [x] 2.1 Convert all .ts files to .js and .tsx files to .jsx
    - Convert src/App.tsx and all files in src/components/, src/hooks/, src/integrations/, src/lib/, and src/pages/
    - Remove type annotations, interfaces, and type imports
    - Remove generic type parameters from hooks and functions
    - _Requirements: 12.7_
  
  - [x] 2.2 Convert configuration files to JavaScript
    - Convert tailwind.config.ts to tailwind.config.js
    - Remove tsconfig.json, tsconfig.app.json, and tsconfig.node.json
    - _Requirements: 12.7_

- [x] 3. Install Next.js dependencies and create configuration
  - [x] 3.1 Update package.json dependencies
    - Add next as production dependency
    - Add @types/node as development dependency
    - Add sharp as optional dependency for image optimization
    - Preserve all existing React, Supabase, and UI library dependencies
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 3.2 Create Next.js configuration files
    - Create next.config.mjs with path alias (@), React strict mode, and Supabase image domains
    - Create jsconfig.json with @ path alias pointing to ./src
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [x] 3.3 Update package.json scripts
    - Replace "dev" script with "next dev"
    - Replace "build" script with "next build"
    - Replace "preview" script with "next start"
    - Add "lint" script as "next lint"
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 4. Update environment variables
  - Replace VITE_SUPABASE_URL with NEXT_PUBLIC_SUPABASE_URL in .env file
  - Replace VITE_SUPABASE_PUBLISHABLE_KEY with NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file
  - Replace VITE_SUPABASE_PROJECT_ID with NEXT_PUBLIC_SUPABASE_PROJECT_ID in .env file
  - Update src/integrations/supabase/client.js to use process.env.NEXT_PUBLIC_* variables
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 5. Create Next.js App Router structure
  - [x] 5.1 Create root layout with providers
    - Create app/layout.js with html and body tags
    - Move QueryClientProvider, AuthProvider, TooltipProvider, and Toaster components to root layout
    - Import global styles (src/index.css)
    - Add "use client" directive
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 8.4_
  
  - [x] 5.2 Create home page with redirect
    - Create app/page.js that redirects to /dashboard
    - _Requirements: 4.3, 5.14_
  
  - [x] 5.3 Create authentication middleware
    - Create middleware.js in root directory
    - Implement authentication check using Supabase session
    - Redirect unauthenticated users to /auth for protected routes
    - Redirect authenticated users from /auth to /dashboard
    - Implement role-based access control for admin and manager routes
    - Configure matcher to run on all routes except /auth, /_next, /api, and static files
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 6. Convert React Router routes to Next.js pages
  - [x] 6.1 Create authentication and dashboard pages
    - Create app/auth/page.js importing Auth component from src/pages/Auth.jsx
    - Create app/dashboard/page.js importing Dashboard component from src/pages/Dashboard.jsx
    - Add "use client" directive to both pages
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.2 Create employee management pages
    - Create app/employees/page.js importing Employees component
    - Create app/employee/[id]/page.js for dynamic employee profile routes
    - Pass params.id to EmployeeProfile component
    - Add "use client" directive to both pages
    - _Requirements: 5.3, 5.4_
  
  - [x] 6.3 Create HR module pages
    - Create app/attendance/page.js importing Attendance component
    - Create app/leaves/page.js importing Leaves component
    - Create app/salaries/page.js importing Salaries component
    - Create app/documents/page.js importing Documents component
    - Create app/performance/page.js importing Performance component
    - Add "use client" directive to all pages
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.9_
  
  - [x] 6.4 Create admin and settings pages
    - Create app/announcements/page.js importing Announcements component
    - Create app/institutions/page.js importing Institutions component
    - Create app/settings/page.js importing Settings component
    - Add "use client" directive to all pages
    - _Requirements: 5.10, 5.11, 5.12_
  
  - [x] 6.5 Create 404 page
    - Create app/not-found.js for 404 handling
    - _Requirements: 5.13_

- [ ] 7. Update navigation and routing in components
  - [ ] 7.1 Replace React Router imports with Next.js navigation
    - Update all files using useNavigate to use useRouter from next/navigation
    - Update all files using useLocation to use usePathname from next/navigation
    - Update all files using useParams to receive params as props (in page components)
    - Replace react-router-dom Link with next/link Link
    - Update Link components to use href instead of to prop
    - _Requirements: 5.15_
  
  - [ ] 7.2 Remove ProtectedRoute component usage
    - Remove ProtectedRoute wrapper from route definitions (now handled by middleware)
    - Delete src/components/ProtectedRoute.jsx if no longer needed
    - _Requirements: 6.7_

- [ ] 8. Add "use client" directives to interactive components
  - [ ] 8.1 Add "use client" to page components in src/pages/
    - Add directive to all 13 page components (Auth, Dashboard, Employees, EmployeeProfile, Attendance, Leaves, Salaries, Documents, Performance, Announcements, Institutions, Settings, NotFound)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 8.2 Add "use client" to layout and feature components
    - Add directive to src/components/layout/DashboardLayout.jsx
    - Add directive to all components in src/components/attendance/
    - Add directive to all components in src/components/dashboard/
    - Add directive to all components in src/components/leaves/
    - Add directive to all components in src/components/salary/
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ] 8.3 Add "use client" to shadcn/ui components
    - Add directive to interactive components in src/components/ui/ (components using hooks or event handlers)
    - _Requirements: 11.5, 11.6_
  
  - [ ] 8.4 Add "use client" to custom hooks
    - Add directive to src/hooks/useAuth.jsx
    - Add directive to src/hooks/use-mobile.jsx
    - Add directive to src/hooks/use-toast.js
    - _Requirements: 11.1_

- [ ] 9. Preserve styling and component configurations
  - Verify tailwind.config.js is correctly converted and preserved
  - Verify postcss.config.js is unchanged
  - Verify components.json for shadcn/ui is unchanged
  - Verify src/components/ directory structure is unchanged
  - Verify @ path alias works in imports
  - Verify next-themes integration for dark mode is preserved
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_

- [ ] 10. Verify Supabase integration
  - Verify src/integrations/supabase/ directory is unchanged except for environment variable updates
  - Verify Supabase client configuration uses NEXT_PUBLIC_ variables
  - Verify all existing queries and mutations are preserved
  - Verify AuthProvider and useAuth hook work without modification
  - Verify all type definitions are preserved (converted to JSDoc if needed)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 11. Verify static assets
  - Verify public directory remains in root with all assets (favicon.ico, favicon.jpg, robots.txt)
  - Verify asset references use correct paths (e.g., /filename for public assets)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 12. Final validation and testing
  - Run npm install to install all dependencies
  - Run npm run dev to start development server
  - Verify application starts without errors on localhost:3000
  - Test authentication flow (login, logout, session persistence)
  - Test navigation between all pages
  - Test role-based access control (admin, manager, employee routes)
  - Verify all components render correctly with preserved styling
  - Run npm run build to create production build
  - Verify build completes without errors
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

## Notes

- This migration converts all TypeScript files to JavaScript (.js/.jsx extensions)
- All existing functionality is preserved including Supabase authentication, Tailwind CSS styling, and shadcn/ui components
- React Router is completely replaced with Next.js file-based routing
- Authentication and authorization are handled by Next.js middleware
- The @ path alias is preserved for imports pointing to ./src
- All tasks build incrementally - each step can be validated before proceeding
- PWA features (vite-plugin-pwa) are removed; next-pwa can be added later if needed
