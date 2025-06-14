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
- June 14, 2025. Updated Gemini API to latest 2.5 series models (gemini-2.5-flash as default)
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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```