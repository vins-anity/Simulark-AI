**#** Simulark Complete Page Structure

**>****Purpose******: Comprehensive list of all pages and routes needed for Simulark
**>****Last Updated******: January 31, 2026

**---**

**##** 🎯 Public Pages (No Authentication Required)

**###** **1. Landing Page**
******Route******: **`/`**
******Purpose******: First impression, product explanation, conversion to signup

******Sections****** (in order):
**-** Hero Section
**-** Value proposition (one sentence)
**-** Interactive mini-demo OR video
**-** Primary CTA: "Start Free" button
**-** Trust indicator: "No credit card required"

**-** Social Proof Bar
**-** Number of diagrams generated
**-** User rating
**-** Featured companies (if any)

**-** Before/After Comparison
**-** "The Old Way" vs "The Simulark Way"
**-** Specific time savings highlighted
**-** Pain points clearly shown

**-** Feature Showcase (4-6 features)
**-** AI Generation (with video loop)
**-** Visual Simulation (animated demo)
**-** Context Bridge (side-by-side: diagram → IDE)
**-** Auto-Layout (before/after comparison)
**-** Multi-Provider Support (AWS/GCP/Azure switcher)
**-** Cost Estimation (if implemented)

**-** Trust Builders
**-** Open source badge (if applicable)
**-** Security certifications
**-** Video testimonials
**-** Media mentions

**-** Pricing Section
**-** Free tier (clearly listed limits)
**-** Pro tier ($19/mo)
**-** Enterprise tier (custom pricing)
**-** FAQ about pricing

**-** Final CTA
**-** "Start Building Free" button
**-** Link to documentation
**-** Link to GitHub (if open source)

******Components Needed******:
**-** Hero.tsx
**-** SocialProofBar.tsx
**-** BeforeAfterComparison.tsx
**-** FeatureCard.tsx (reusable)
**-** PricingCard.tsx (reusable)
**-** TestimonialCard.tsx
**-** Footer.tsx

**---**

**###** **2. Pricing Page**
******Route******: **`/pricing`**
******Purpose******: Detailed pricing information and plan comparison

******Sections******:
**-** Page Header
**-** Title: "Simple, Transparent Pricing"
**-** Subtitle: "Start free. Scale when ready."

**-** Billing Toggle
**-** Monthly / Annual switch
**-** Show annual savings (20% off)

**-** Pricing Cards (3 tiers)
**-** Free Plan
**-** $0/month
**-** 5 projects
**-** 20 AI generations/month
**-** Public exports only
**-** Community support
**-** CTA: "Start Free"

**-** Pro Plan (highlighted)
**-** $19/month ($15.20 annual)
**-** Unlimited projects
**-** 200 AI generations/month
**-** All export formats
**-** Private context URLs
**-** Cost estimation
**-** Priority support
**-** CTA: "Start 14-Day Trial"

**-** Enterprise Plan
**-** Custom pricing
**-** Everything in Pro
**-** Unlimited AI generations
**-** SSO (SAML)
**-** Audit logs
**-** On-premise option
**-** Dedicated support
**-** CTA: "Contact Sales"

**-** Feature Comparison Table
**-** Detailed feature breakdown
**-** Checkmarks for each tier
**-** Tooltips for complex features

**-** FAQ Section
**-** "Can I change plans later?"
**-** "What happens if I exceed limits?"
**-** "Do you offer refunds?"
**-** "Is there a student discount?"
**-** "Can I cancel anytime?"

**-** Trust Section
**-** "Used by X developers"
**-** Security badges
**-** Money-back guarantee (if offered)

******Components Needed******:
**-** PricingHero.tsx
**-** BillingToggle.tsx
**-** PricingCard.tsx
**-** FeatureComparisonTable.tsx
**-** PricingFAQ.tsx

**---**

**###** **3. Documentation Home**
******Route******: **`/docs`**
******Purpose******: Entry point to all documentation

******Sections******:
**-** Quick Start Guide (featured)
**-** Getting Started
**-** Core Concepts
**-** Features Reference
**-** API Documentation
**-** Integrations
**-** Troubleshooting
**-** Search bar (Algolia DocSearch)

******Components Needed******:
**-** DocsSidebar.tsx
**-** DocsSearch.tsx
**-** DocsBreadcrumb.tsx
**-** DocsTableOfContents.tsx

**---**

**###** **4. Documentation Sub-Pages**

******Route******: **`/docs/getting-started`**
******Content******: Step-by-step first project guide

******Route******: **`/docs/features/ai-generation`**
******Content******: How AI generation works, prompt tips

******Route******: **`/docs/features/visual-simulation`**
******Content******: Understanding data flow animations

******Route******: **`/docs/features/context-bridge`**
******Content******: Using Live Context URLs, IDE integration

******Route******: **`/docs/features/exports`**
******Content******: All export format documentation

******Route******: **`/docs/integrations/cursor`**
******Content******: Cursor IDE setup guide

******Route******: **`/docs/integrations/terraform`**
******Content******: Using Terraform exports

******Route******: **`/docs/api`**
******Content******: API reference (Scalar auto-generated)

******Route******: **`/docs/troubleshooting`**
******Content******: Common issues and solutions

**---**

**###** **5. About Page**
******Route******: **`/about`**
******Purpose******: Story, mission, team (optional for MVP)

******Sections******:
**-** Mission statement
**-** Problem we're solving
**-** Team (if relevant)
**-** Contact information

**---**

**###** **6. Blog (Optional for MVP)**
******Route******: **`/blog`**
******Purpose******: Content marketing, SEO

******Future content******:
**-** Launch announcement
**-** Feature releases
**-** Architecture tutorials
**-** Case studies

**---**

**##** 🔐 Authentication Pages

**###** **7. Sign In Page**
******Route******: **`/auth/signin`**
******Purpose******: User authentication

******Sections******:
**-** Logo and branding
**-** Sign in heading
**-** OAuth buttons
**-** "Continue with GitHub" (primary)
**-** "Continue with Google"
**-** Divider: "or"
**-** Email magic link form (optional for MVP)
**-** Footer links
**-** Privacy Policy
**-** Terms of Service

******Components Needed******:
**-** SignInForm.tsx
**-** OAuthButton.tsx
**-** AuthLayout.tsx

**---**

**###** **8. Authentication Callback**
******Route******: **`/auth/callback`**
******Purpose******: Handle OAuth redirects

******Behavior******:
**-** Process OAuth code exchange
**-** Create/update user session
**-** Redirect to dashboard or intended destination
**-** Show loading spinner during processing
**-** Handle errors gracefully

******Components Needed******:
**-** LoadingSpinner.tsx
**-** ErrorMessage.tsx

**---**

**###** **9. Sign Out Confirmation**
******Route******: **`/auth/signout`**
******Purpose******: Confirm sign out action

******Sections******:
**-** "Are you sure you want to sign out?"
**-** Cancel button (stays signed in)
**-** Confirm button (signs out → redirect to landing)

**---**

**##** 🏠 Authenticated Pages (Main Application)

**###** **10. Dashboard / Projects List**
******Route******: **`/dashboard`**
******Purpose******: User's project hub, first page after login

******Sections******:
**-** Page Header
**-** Title: "My Projects"
**-** Create New Project button (prominent)
**-** Search/filter input
**-** Sort dropdown (Recent, Name, Provider)

**-** Project Grid/List
**-** Empty state (if no projects)
**-** Illustration
**-** "Create your first architecture"
**-** Template suggestions
**-** Quick-start prompts

**-** Project cards (if projects exist)
**-** Project name
**-** Last updated timestamp
**-** Provider badge (AWS/GCP/Azure/Generic)
**-** Preview thumbnail (optional)
**-** Action menu (⋮)
**-** Open
**-** Duplicate
**-** Rename
**-** Delete

**-** Sidebar (optional)
**-** Recent projects
**-** Favorites
**-** Templates

******Components Needed******:
**-** DashboardHeader.tsx
**-** ProjectGrid.tsx
**-** ProjectCard.tsx
**-** CreateProjectButton.tsx
**-** EmptyState.tsx
**-** ProjectActionsMenu.tsx
**-** SearchBar.tsx
**-** SortDropdown.tsx

**---**

**###** **11. Canvas / Editor Page**
******Route******: **`/projects/[id]`**
******Purpose******: Main workspace for architecture design

******Layout******:
**``** **┌─────────────────────────────────────────────┐ **│ Top Bar (fixed)                             │ │ - Project name (editable)                   │ │ - Provider selector                         │ │ - Share button                              │ │ - Export menu                               │ │ - User menu                                 │ └─────────────────────────────────────────────┘ ┌────────┬──────────────────────┬──────────────┐ │        │                      │              │ │  Left  │   Canvas Area        │  Right Panel │ │  Panel │   (React Flow)       │  (Properties)│ │        │                      │              │ │  - AI  │   - Nodes            │  - Node info │ │  - Gen │   - Edges            │  - Edit      │ │  - Tmpl│   - Zoom controls    │  - Details   │ │        │   - Minimap          │              │ │        │   - Simulation       │              │ │        │                      │              │ └────────┴──────────────────────┴──────────────┘ ┌─────────────────────────────────────────────┐ │ Bottom Toolbar (optional)                   │ │ - Undo/Redo                                 │ │ - Simulation controls                       │ **└─────────────────────────────────────────────┘** **``**

******Left Panel - AI Assistant******:
**-** Prompt textarea
**-** Placeholder: "Describe your architecture..."
**-** Example prompts (clickable)
**-** Provider selector (AWS/GCP/Azure/Generic)
**-** Generate button
**-** Loading indicator
**-** Architecture breakdown (after generation)
**-** Suggested improvements

******Canvas Area******:
**-** React Flow canvas
**-** Custom nodes (Gateway, Compute, Database, Queue, Storage)
**-** Animated edges
**-** Zoom controls (+/- buttons, fit view)
**-** Minimap (bottom right)
**-** Simulation play/pause button
**-** Context menu (right-click on canvas)

******Right Panel - Properties******:
**-** Selected node properties
**-** Label (editable)
**-** Service type
**-** Icon selector
**-** Provider-specific settings
**-** Empty state (if nothing selected)
**-** "Select a node to view properties"
**-** Keyboard shortcuts hint

******Top Bar******:
**-** Project name (click to edit)
**-** Auto-save indicator
**-** Provider selector (global)
**-** Share button
**-** Export dropdown menu
**-** User avatar dropdown

******Components Needed******:
**-** CanvasPage.tsx (main page)
**-** TopBar.tsx
**-** AIAssistantPanel.tsx
**-** CanvasArea.tsx
**-** PropertiesPanel.tsx
**-** ZoomControls.tsx
**-** Minimap.tsx
**-** SimulationControls.tsx
**-** ExportMenu.tsx
**-** ShareButton.tsx
**-** NodePropertyEditor.tsx

**---**

**###** **12. Template Gallery** (Optional for MVP)
******Route******: **`/templates`**
******Purpose******: Browse and use pre-built architectures

******Sections******:
**-** Category filters (Microservices, Serverless, E-commerce, etc.)
**-** Search bar
**-** Template cards
**-** Template name
**-** Preview thumbnail
**-** Provider badge
**-** Use count
**-** "Use Template" button
**-** Empty state (if search returns nothing)

******Components Needed******:
**-** TemplateGallery.tsx
**-** TemplateCard.tsx
**-** TemplateFilters.tsx
**-** TemplatePreview.tsx

**---**

**###** **13. Settings Page**
******Route******: **`/settings`**
******Purpose******: User account and subscription management

******Tabs******:
**1.****Profile******
**-** Avatar upload
**-** Full name
**-** Email (read-only, from OAuth)
**-** Connected accounts (GitHub, Google)
**-** Timezone (optional)
**-** Language (optional)
**-** Delete account button (bottom)

**2.****Subscription******
**-** Current plan display
**-** Plan features
**-** Usage statistics
**-** Upgrade/Downgrade buttons
**-** Billing history
**-** Payment method
**-** Cancel subscription button

**3.****Usage******
**-** AI generations this month
**-** Projects count
**-** Exports count
**-** Usage charts
**-** Quota remaining
**-** Reset date

**4.****Preferences******
**-** Dark mode toggle
**-** Default provider
**-** Auto-layout preference
**-** Simulation defaults
**-** Notification settings

******Components Needed******:
**-** SettingsLayout.tsx
**-** TabNavigation.tsx
**-** ProfileSettings.tsx
**-** SubscriptionSettings.tsx
**-** UsageStatistics.tsx
**-** PreferencesSettings.tsx
**-** DangerZone.tsx (delete account)

**---**

**###** **14. Billing Page** (If separate from Settings)
******Route******: **`/billing`**
******Purpose******: Manage subscription and payment

******Sections******:
**-** Current plan summary
**-** Upgrade/downgrade options
**-** Payment method (Stripe integration)
**-** Billing history table
**-** Invoices (downloadable)
**-** Cancel subscription flow

******Components Needed******:
**-** BillingOverview.tsx
**-** PaymentMethodForm.tsx
**-** InvoiceList.tsx
**-** SubscriptionManager.tsx

**---**

**##** 🔗 Utility Pages

**###** **15. Shared Project View (Public)**
******Route******: **`/shared/[token]`**
******Purpose******: View-only access to shared diagrams

******Features******:
**-** Read-only canvas
**-** No editing allowed
**-** Zoom and pan enabled
**-** Simulation playback available
**-** Export options (download as PNG/PDF)
**-** "Create Your Own" CTA button
**-** Expiration notice (if close to expiring)

******Components Needed******:
**-** SharedProjectView.tsx
**-** ReadOnlyCanvas.tsx
**-** PublicExportMenu.tsx

**---**

**###** **16. 404 Not Found**
******Route******: **`/404`** (catch-all)
******Purpose******: Handle invalid routes

******Content******:
**-** Friendly error message
**-** "Page not found" heading
**-** Link back to dashboard (if logged in)
**-** Link to landing page (if not logged in)
**-** Search bar (optional)
**-** Illustration

******Components Needed******:
**-** NotFound.tsx
**-** ErrorLayout.tsx

**---**

**###** **17. 500 Server Error**
******Route******: **`/500`**
******Purpose******: Handle server errors

******Content******:
**-** Apology message
**-** "Something went wrong" heading
**-** What to do next
**-** Contact support link
**-** Try again button
**-** Illustration

**---**

**###** **18. Maintenance Mode**
******Route******: **`/maintenance`** (when needed)
******Purpose******: Display during scheduled downtime

******Content******:
**-** Scheduled maintenance notice
**-** Expected downtime
**-** Status page link
**-** Social media links for updates

**---**

**##** 📄 Legal Pages

**###** **19. Privacy Policy**
******Route******: **`/privacy`**
******Purpose******: Legal requirement, data handling transparency

******Sections******:
**-** What data we collect
**-** How we use data
**-** Third-party services (Supabase, OpenRouter, Vercel)
**-** Data retention
**-** User rights (GDPR)
**-** Contact information

**---**

**###** **20. Terms of Service**
******Route******: **`/terms`**
******Purpose******: Legal agreement with users

******Sections******:
**-** Acceptance of terms
**-** Account responsibilities
**-** Acceptable use policy
**-** AI generation usage limits
**-** Intellectual property
**-** Limitation of liability
**-** Termination
**-** Changes to terms

**---**

**###** **21. Cookie Policy**
******Route******: **`/cookies`**
******Purpose******: Cookie usage transparency

******Sections******:
**-** What cookies we use
**-** Why we use them
**-** How to manage cookies
**-** Third-party cookies

**---**

**##** 🚀 Onboarding Flow (Optional but Recommended)

**###** **22. Onboarding Wizard**
******Route******: **`/onboarding`** (redirect after first signup)
******Purpose******: Guide new users to first success

******Steps******:
**1.****Welcome Screen******
**-** "Welcome to Simulark!"
**-** Quick product overview (30 seconds)
**-** Skip button (always visible)

**2.****Role Selection****** (optional)
**-** "What describes you best?"
**-** Backend Engineer
**-** Full-stack Developer
**-** Solutions Architect
**-** Student/Learning
**-** (Customizes examples)

**3.****First Project Creation******
**-** "Let's create your first architecture"
**-** Pre-filled prompt example
**-** Provider selection
**-** Generate button

**4.****Tour of Canvas******
**-** Highlight key areas (tooltips)
**-** AI assistant panel
**-** Canvas controls
**-** Export menu
**-** Complete button

**5.****Success Screen******
**-** "You're all set!"
**-** Links to documentation
**-** Link to template gallery
**-** Go to Dashboard button

******Components Needed******:
**-** OnboardingWizard.tsx
**-** OnboardingStep.tsx (reusable)
**-** ProgressIndicator.tsx
**-** TourTooltip.tsx

**---**

**##** 📱 Mobile-Specific Considerations

**###** **Mobile Landing Page**
**-** Same content, optimized layout
**-** Hamburger menu for navigation
**-** Tap-friendly buttons
**-** Scrollable feature showcases

**###** **Mobile Dashboard**
**-** Card layout (single column)
**-** Bottom navigation (optional)
**-** Swipe gestures

**###** **Mobile Canvas** (Limited functionality)
**-** View-only mode recommended
**-** Pinch to zoom
**-** Two-finger pan
**-** Simplified UI
**-** Encourage desktop use with banner

**---**

**##** 🎨 Component Library Organization

******Shared Components****** (used across multiple pages):
**-** Button.tsx
**-** Input.tsx
**-** Textarea.tsx
**-** Select.tsx
**-** Modal.tsx
**-** Dropdown.tsx
**-** Toast.tsx
**-** Skeleton.tsx
**-** Badge.tsx
**-** Card.tsx
**-** Avatar.tsx
**-** Tooltip.tsx
**-** Tabs.tsx
**-** Alert.tsx

******Layout Components******:
**-** Header.tsx
**-** Footer.tsx
**-** Sidebar.tsx
**-** Container.tsx
**-** Section.tsx

******Feature-Specific Components******:
**-** Canvas components (in /components/canvas)
**-** Project components (in /components/projects)
**-** Settings components (in /components/settings)
**-** Auth components (in /components/auth)

**---**

**##** 📊 Page Priority for MVP Launch

**###** **Critical (Must Have)**:
**1.** ✅ Landing Page
**2.** ✅ Sign In Page
**3.** ✅ Auth Callback
**4.** ✅ Dashboard
**5.** ✅ Canvas/Editor Page
**6.** ✅ Settings (Profile + Subscription)
**7.** ✅ Privacy Policy
**8.** ✅ Terms of Service
**9.** ✅ 404 Page

**###** **High Priority (Launch Week)**:
**10.** Pricing Page
**11.** Documentation Home
**12.** Getting Started Guide
**13.** Shared Project View
**14.** Onboarding Flow

**###** **Medium Priority (Month 1)**:
**15.** Template Gallery
**16.** API Documentation
**17.** Billing Page
**18.** All Docs Sub-pages
**19.** About Page

**###** **Low Priority (Month 2+)**:
**20.** Blog
**21.** Cookie Policy
**22.** 500 Error Page
**23.** Maintenance Page

**---**

**##** 🗺️ Complete Route Map

**```**
**Public Routes:
**├── / (Landing)
├── /pricing
├── /about
├── /docs
│   ├── /docs/getting-started
│   ├── /docs/features/*
│   ├── /docs/integrations/*
│   ├── /docs/api
│   └── /docs/troubleshooting
├── /blog
│   └── /blog/[slug]
├── /privacy
├── /terms
├── /cookies
└── /shared/[token]

Auth Routes:
├── /auth/signin
├── /auth/callback
└── /auth/signout

Authenticated Routes:
├── /dashboard
├── /projects/[id]
├── /templates
├── /settings
│   ├── /settings/profile
│   ├── /settings/subscription
│   ├── /settings/usage
│   └── /settings/preferences
├── /billing
└── /onboarding

Error Routes:
├── /404
├── /500
**└── /maintenance**
**```**

**---**

**##** 💡 Navigation Structure

******Public Header****** (not logged in):
**-** Logo (links to /)
**-** Pricing
**-** Docs
**-** About (optional)
**-** Sign In button

******Authenticated Header****** (logged in):
**-** Logo (links to /dashboard)
**-** Projects dropdown (recent)
**-** Create New button
**-** Docs link
**-** User avatar dropdown
**-** Settings
**-** Billing
**-** Sign Out

******Footer****** (all pages):
**-** Product
**-** Features
**-** Pricing
**-** Documentation
**-** API
**-** Company
**-** About
**-** Blog
**-** Contact
**-** Legal
**-** Privacy
**-** Terms
**-** Cookies
**-** Social
**-** GitHub
**-** Twitter
**-** Discord

**---**

******Total Pages for MVP******: **~**15 pages
******Total Pages for Full Launch******: **~**25 pages
******Total Pages Long-term******: ~30+ pages

******Development Order Recommendation******:
**1.** Landing → Sign In → Auth Callback
**2.** Dashboard → Canvas Page
**3.** Settings → Shared View
**4.** Pricing → Docs Home
**5.** Onboarding → Templates
**6.** Blog → Additional Docs

This gives you a working product after step 2, with progressive enhancement afterward!
