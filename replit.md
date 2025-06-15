# AI İçerik Paneli - Replit Application Guide

## Overview

This is a full-stack web application for AI-powered content creation using the Gemini API. The application is built as a Turkish content management system that allows users to create, edit, and manage articles with AI assistance, bulk article generation, and WordPress integration capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with session management
- **File Processing**: Multer for file uploads with XLSX support
- **AI Integration**: Google Generative AI (Gemini API)

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Authentication System
- **Provider**: Replit Authentication with OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL
- **Security**: HTTP-only cookies with secure flags in production
- **User Management**: Automatic user provisioning and profile management

### Content Management
- **AI Editor**: Rich text editor with Gemini API integration
- **WordPress Editor**: Specialized editor for WordPress content publishing
- **Bulk Article Generator**: Excel/CSV file processing for mass article creation
- **Article Storage**: Full CRUD operations with metadata tracking

### AI Integration
- **Provider**: Google Generative AI (Gemini)
- **Features**: Content generation, article enhancement, bulk processing
- **Usage Tracking**: API call monitoring and token counting
- **Error Handling**: Comprehensive error management for AI operations

### File Processing
- **Upload Handling**: Multer middleware with memory storage
- **File Types**: Excel (.xlsx, .xls) and CSV support
- **Size Limits**: 10MB maximum file size
- **Processing**: XLSX library for spreadsheet parsing

## Data Flow

### Authentication Flow
1. User accesses application
2. Replit Auth redirects to OAuth provider
3. Successful authentication creates/updates user record
4. Session established with PostgreSQL storage
5. Protected routes verify authentication status

### Content Creation Flow
1. User inputs content parameters or uploads files
2. Frontend validates input using Zod schemas
3. Backend processes request with Gemini API
4. Generated content stored in database
5. Real-time updates provided to frontend via React Query

### Article Management Flow
1. Articles stored with full metadata (word count, reading time, status)
2. CRUD operations through REST API endpoints
3. Pagination and filtering for large datasets
4. Status tracking (draft, published, archived)

## External Dependencies

### Core Dependencies
- **@google/generative-ai**: Gemini API integration
- **@neondatabase/serverless**: PostgreSQL connection for Neon
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **@radix-ui/***: Accessible UI primitives

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **@types/***: TypeScript definitions
- **@replit/***: Replit-specific development tools

### Authentication Dependencies
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 via Replit modules
- **Database**: PostgreSQL 16 provisioned automatically
- **Build Process**: Hot module replacement via Vite
- **Port Configuration**: Port 5000 exposed as port 80

### Production Build
- **Frontend**: Vite build with asset optimization
- **Backend**: esbuild compilation to ESM format
- **Static Files**: Served from dist/public directory
- **Process**: PM2 or similar for process management

### Environment Configuration
- **DATABASE_URL**: Automatic provisioning via Replit
- **SESSION_SECRET**: Required for session security
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OAuth issuer for authentication

### Scaling Considerations
- **Database**: Neon serverless auto-scaling
- **Application**: Stateless design enables horizontal scaling
- **Sessions**: Database-backed sessions support multiple instances
- **File Storage**: Memory-based uploads suitable for small files

## Changelog

```
Changelog:
- June 14, 2025. Initial setup
- June 14, 2025. Completed AI Content Editor with focus keywords system and bulk article generation
- June 14, 2025. Updated Gemini API to stable 1.5 series models (gemini-1.5-flash as default)
- June 14, 2025. Integrated Excel file upload for bulk article creation
- June 14, 2025. Completely redesigned AI Content Editor interface to match user's reference design
- June 14, 2025. Added comprehensive interface sections: Genel Ayarlar, Güncel Bilgiler, Görsel Seçenekleri, İçerik Özellikleri, Sitenizde Yayınlama, İç & Dış Linkler
- June 14, 2025. Redesigned sidebar menu with comprehensive navigation structure including main menu, bulk operations, voice & media, and help sections
- June 14, 2025. Implemented all menu item navigation with placeholder pages for future development areas
- June 14, 2025. Completed WP Makalesi V1 interface with 4-step workflow (Temel Bilgiler → Başlık Seç → Taslak Oluştur → Makale Oluştur)
- June 14, 2025. Added comprehensive WordPress article generation with focus keywords, writing styles, AI model selection, and optional features (meta description, summary, YouTube video)
- June 14, 2025. Implemented WP Makalesi V2 with advanced multi-section interface including Genel Ayarlar, Başlık Ayarları, Güncel Bilgiler, Anahtar Kelimeler, Alt Başlıklar, Görsel Seçenekleri, İçerik Özellikleri, Yayınlama, and İç & Dış Linkler sections
- June 14, 2025. Added comprehensive WordPress V2 backend API with detailed content generation based on all section settings and preferences
- June 14, 2025. Removed "Yeni Özellik Önerin" menu item from sidebar navigation and updated routing system
- June 14, 2025. Implemented URL Rewrite functionality with complete interface matching reference design including URL input, Genel Ayarlar, Görsel Seçenekleri, İçerik Özellikleri, Yayınlama, and İç & Dış Linkler sections
- June 14, 2025. Added backend API endpoint for URL content fetching, HTML parsing, and AI-powered content rewriting using Gemini 2.5-flash model
- June 14, 2025. Created "Toplu Oluşturulan Makalelerim" page with exact design match including stacked file icons, empty state messaging, navigation buttons to bulk creation tools, and YouTube help video link
- June 14, 2025. Implemented comprehensive "Toplu Makale Oluştur V1" interface with 5 generation types (Anahtar Kelime, Web Siteniz, Rakip Siteler, Manuel Başlıklar, Excel Upload), language selection, title count configuration, and two-step workflow with generated title editing capabilities
- June 14, 2025. Added backend API endpoint for bulk title generation V1 supporting all generation types with Gemini AI integration and intelligent fallback mechanisms
- June 14, 2025. Created advanced "Toplu Makale Oluştur V2" interface with comprehensive multi-section design including Genel Ayarlar, Görsel Seçenekleri, İçerik Özellikleri, Yayınlama settings, and enhanced title generation with image keywords
- June 14, 2025. Added backend API endpoint for bulk title generation V2 with extended functionality supporting advanced content configuration and image keyword generation
- June 14, 2025. Implemented comprehensive "Toplu Yemek Tarifi" interface with recipe-specific content options, structured data support, and multi-step workflow (recipe input → review → detailed configuration)
- June 14, 2025. Added backend API endpoints for recipe processing and bulk recipe generation with Gemini AI integration supporting 15+ recipe content sections and customizable display options
- June 14, 2025. Created "Toplu Rüya Tabiri" interface with dream subject input, multi-step workflow, and comprehensive article generation settings including similar dream topics and psychological interpretations
- June 14, 2025. Implemented "Özgünleştirilen Makaleler" empty state page with navigation to article customization tools and help video integration
- June 14, 2025. Built "Makale Özgünleştir" interface with website/competitor content selection, filtering options, and article listing functionality for content customization workflows
- June 14, 2025. Added backend API endpoints for dream interpretation article generation and article customization listing with Gemini AI integration and WordPress content management
- June 14, 2025. Created "Web Sitelerim" comprehensive website management interface with search functionality, platform badges (WordPress, Blogger, XenForo), SEO plugin indicators, and Google Search Console status tracking
- June 14, 2025. Added backend API endpoints for website management including listing, synchronization, and deletion operations with complete dropdown menu functionality and table-based display
- June 14, 2025. Removed 9 example websites from default listing and implemented "Yeni Web Sitesi Ekle" form with complete WordPress and XenForo configuration options
- June 14, 2025. Added comprehensive website addition interface matching provided HTML template with SEO plugin codes, user authentication fields, and multi-platform support
- June 14, 2025. Integrated WordPress website addition workflow with navigation between Web Sitelerim list and add website form, plus backend API for website creation
- June 14, 2025. Created Excel Template system for bulk article generation with advanced column mapping supporting "Makale Başlığı", "Odak Anahtar Kelime", "Diğer Anahtar Kelimeler", "Alt Başlık 1-20" structure matching user's provided Excel template
- June 14, 2025. Implemented comprehensive Excel processing backend API with intelligent column detection, 20 sub-heading support, and advanced AI prompt generation for bulk article creation with Gemini 2.5-flash integration
- June 14, 2025. Added Excel Template to sidebar navigation with dedicated interface featuring 3-step workflow: file upload → article review → generation results with detailed progress tracking and error handling
- June 14, 2025. Fixed content generation issues: removed article title from content body, enhanced content features implementation (tables, lists, bold, italic, quotes), separated article summary from main content
- June 14, 2025. Improved AI model selection to properly use Gemini 2.5 Flash when selected, updated section length handling including "Çok Uzun" option for 2,000-2,500 words
- June 14, 2025. Enhanced meta description generation with SEO optimization: 140-160 character limit, focus keyword placement, power words usage, and SEO compliance indicators in frontend
- June 14, 2025. Fixed web sitesi dropdown issue: websites now appear in "Sitenizde Yayınlama" sections across all bulk article components
- June 14, 2025. Added automatic category fetching: when website is selected, categories are automatically loaded from backend sync
- June 14, 2025. Fixed Gemini model mapping errors: all AI model selections now properly map to available Gemini 1.5 Flash/Pro models
- June 14, 2025. Resolved JavaScript variable initialization errors in React components using useMemo hooks for proper state management
- June 14, 2025. Added comprehensive article publishing system: tekli ve toplu siteye gönderme with checkbox selection, bulk sending dialog, individual article send buttons, WordPress REST API integration for category mapping and post creation, XenForo support framework, and complete backend endpoint for article-to-website publishing workflow
- June 14, 2025. Implemented real WordPress API integration: replaced simulation with actual HTTP Basic Auth using WordPress Application Passwords, added WordPress credentials fields to website form (wp_username, wp_app_password), integrated real category fetching and post creation to WordPress sites via /wp-json/wp/v2/ endpoints with proper authentication and error handling
- June 14, 2025. Cleaned up duplicate WordPress credential fields in website form, kept only wp_username and wp_app_password fields, added default site (https://bestwebstudio.com.tr) with Yoast SEO configuration, implemented dynamic SEO plugin code display showing Rank Math SEO or Yoast SEO functions.php code snippets based on user selection
- June 14, 2025. Enhanced WordPress API integration with comprehensive SEO meta field population: system now automatically populates both Yoast SEO (_yoast_wpseo_focuskw, _yoast_wpseo_metadesc) and Rank Math SEO (rank_math_focus_keyword, rank_math_description) meta fields when sending articles to WordPress sites, ensuring proper SEO optimization regardless of which plugin is used
- June 14, 2025. Fixed "Toplu Makale Oluştur V2" Excel upload functionality: removed 501 error from backend, implemented proper Excel processing workflow in frontend, Excel files now automatically load titles and bypass manual title generation, corrected focus keyword extraction to use first keyword only for cleaner SEO implementation
- June 14, 2025. Fixed Excel article generation database saving issue: corrected field mapping from article.keywords to article.otherKeywords, added focusKeyword field, implemented comprehensive error logging in both routes and storage layers to track article creation process
- June 14, 2025. Enhanced Excel workflow user experience: changed Excel upload behavior from automatic article generation to manual control - Excel files now load titles into Step 2 where users can configure quality settings (AI model, writing style, content features) before manually triggering article generation
- June 14, 2025. Completed BulkTemplateV2 interface enhancements: fixed category auto-update when website is selected, added comprehensive Güncel Bilgiler section with search configuration options, implemented İç & Dış Linkler section with internal/external link density controls, resolved all JavaScript errors including category.id undefined issues with proper error handling
- June 14, 2025. Cleaned up BulkTemplateV2 interface: removed duplicate Görsel Seçenekleri section (bottom one), removed Alt Başlık Sayısı (H2) field as this will be auto-populated from Excel, streamlined interface to show only necessary manual configuration fields
- June 14, 2025. Removed manual "Makale Başlıkları" textarea field from BulkTemplateV2: Excel files now automatically populate article titles, eliminating need for manual title entry and streamlining Excel workflow
- June 14, 2025. Fixed Excel subheading detection: system now properly reads Alt Başlık 1-20 columns from Excel and forces AI to use these exact headings instead of generating new ones, ensuring Excel template structure is maintained in generated articles
- June 14, 2025. Fixed Excel subheading processing workflow: identified that manual "Makale Başlıkları" field was blocking Excel processing, removed it completely, added comprehensive debug logging, updated GeneratedTitle interface to include subheadings and otherKeywords fields, now Excel alt başlık data flows from file reading through frontend to backend AI generation
- June 14, 2025. Enhanced "Diğer Anahtar Kelimeler" processing: improved AI prompt to properly utilize secondary keywords from Excel file, added explicit keyword distribution instructions, system now uses both focus keyword and all secondary keywords naturally throughout article sections
- June 14, 2025. Added "Firma" field support to Excel processing: system now reads company name from "Firma" column in Excel files and naturally mentions the company throughout generated articles when relevant, updated GeneratedTitle interface and AI prompt to include company branding
- June 14, 2025. Implemented Excel-based content length control: removed manual "Bölüm Uzunluğu" field from Genel Ayarlar, system now reads "Bölüm Uzunluğu" column from Excel (S=800-1,200 words, M=1,200-1,700 words, L=1,700-2,200 words, XL=2,200-2,700 words, XXL=2,700-3,200 words), enhanced AI prompt to use Excel length indicators instead of manual settings, strengthened company name mention instructions in AI prompt for better integration
- June 14, 2025. Fixed Excel data flow issue: corrected frontend-to-backend data mapping to properly pass company name and content length from Excel files, updated GeneratedTitle interface to include contentLength field, enhanced debug logging to track Excel data processing, system now correctly uses both "Firma" and "Bölüm Uzunluğu" columns from Excel in AI article generation
- June 14, 2025. Enhanced İç & Dış Linkler section: replaced Az/Orta/Çok options with Yok/Otomatik/Manuel system, added manual link input textareas for bulk link entry, implemented SEO-optimized link processing with intelligent limits (5 internal, 3 external), configured proper link attributes (rel="nofollow" for external, target="_blank"), AI now naturally integrates manual links into article content with contextually relevant anchor text
- June 14, 2025. Fixed keyword density optimization: resolved Yoast SEO over-optimization warnings by implementing strict keyword density controls (8-12 uses max), enhanced AI prompt with specific keyword placement strategy, added natural language writing rules to avoid keyword stuffing, improved SEO compliance with focus on quality content over keyword repetition
- June 14, 2025. Enhanced manual link distribution system: replaced first-N-links limitation with intelligent distribution algorithm supporting unlimited manual links, implemented SEO-optimized link placement across article sections (introduction, middle, conclusion), created automatic link synchronization distributing 504+ manual links throughout article content, improved link density control with contextual placement for better user experience
- June 14, 2025. Fixed mandatory FAQ section implementation: added "Sıkça Sorulan Sorular" as required final section for every article, implemented comprehensive FAQ structure with H2/H3 tags, included 5-7 relevant questions with detailed answers, ensured consistent placement at article end, enhanced content value with topic-related FAQ content
- June 14, 2025. Fixed bulk article request size limit error: increased Express body parser limits from default to 50MB for both JSON and URL-encoded payloads, resolved "request entity too large" 413 errors during bulk article generation, enhanced system capacity for processing large article datasets with extensive content and metadata
- June 14, 2025. Enhanced bulk article generation performance: implemented sequential processing with 1-second delays between requests to prevent API rate limiting, added timeout and retry logic with 60-second timeouts and 3 retry attempts per article, improved progress tracking with detailed logging every 10 articles, resolved issue where only 20 out of 81 articles were processed by adding proper error recovery and request pacing
- June 14, 2025. Increased article display limit from 20 to 100 in İçeriklerim section and added comprehensive bulk delete functionality: updated storage interface and database operations to support bulk deletion, added API endpoint for deleting all user articles (/api/articles DELETE), implemented frontend confirmation dialog and red-themed button for safe bulk deletion with loading states
- June 14, 2025. Implemented proper pagination system with per-page options (25, 50, 100, 200) and search functionality in Articles section: redesigned articles interface with advanced search, filter controls, and pagination matching reference design, added backend support for search queries across article titles and content
- June 14, 2025. Enhanced Actions dropdown menu in Articles section to match reference design: added options for web publishing, folder management, HTML/TXT downloads, and deletion with proper icons and hover states, implemented user-friendly warnings for unselected articles
- June 15, 2025. Created comprehensive API key management system: added new database table for multiple API keys per user, implemented backend storage methods and REST endpoints, completely redesigned Settings interface to match provided template with OpenAI/Gemini support, added secure key storage with masked display, default key selection, and comprehensive FAQ about API requirements, sidebar menu updated with "API Key Ayarları" section for easy access to quota management functionality
- June 15, 2025. Fixed article cache visibility issue in İçeriklerim page: identified that newly created articles were not appearing in frontend due to cache invalidation problems, implemented manual "Yenile" refresh button in empty state section, articles are successfully creating in database (confirmed IDs 183, 184) but required manual refresh to appear in user interface, resolved TanStack Query v5 compatibility issues with gcTime parameter
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```