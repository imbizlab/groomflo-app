# Social Media Automation Platform for Pet Groomers

## Overview
A full-stack social media automation platform that generates weekly content for pet groomers and automatically posts to Facebook. The system creates 7 posts per week (3 informative, 2 fun facts, 2 promotional) using custom ChatGPT prompts and DALL-E generated images.

## Recent Changes
- **2025-10-07**: Implemented subscription/membership verification system for OptimizePress integration
- **2025-10-07**: Added subscription tracking fields (subscriptionStatus, subscriptionStartDate, subscriptionEndDate) to users table
- **2025-10-07**: Created POST /api/auth/verify-membership endpoint for credential verification and membership status checking
- **2025-10-07**: Created POST /api/auth/update-subscription endpoint for subscription management
- **2025-10-07**: Added AES-256-GCM encryption for Facebook access tokens in database
- **2025-10-07**: Created public API endpoint for OptimizePress account creation integration
- **2025-10-07**: Implemented API key authentication for external webhook integration
- **2025-10-03**: Completed Facebook integration with automated posting scheduler
- **2025-10-03**: Implemented PostSchedulerWorker that runs every 5 minutes to publish approved scheduled posts
- **2025-10-03**: Fixed security vulnerabilities in API routes (multi-tenant authorization, field whitelisting)
- **2025-10-03**: Fixed post scheduling to properly handle week boundaries and promotional post placement

## Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Wouter routing, TanStack Query, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **AI Services**: OpenAI GPT-4o for content, DALL-E for images
- **Social Media**: Facebook Graph API for automated posting

### Key Features
1. **Business Onboarding**: Collect business details, social links, and custom ChatGPT prompts
2. **Automated Content Generation**: Generate 7 weekly posts based on business context
3. **Smart Scheduling**: 
   - Promotional posts placed 4 and 2 days before slowest day (within same week)
   - Posts scheduled between 7:00 AM - 9:30 AM
4. **Facebook Integration**: Automated posting with scheduler worker
5. **Post Management**: Review, edit, approve, and publish posts
6. **OptimizePress Integration**: 
   - Public API endpoint for automated account creation via webhook
   - Membership verification endpoint for credential validation
   - Subscription management endpoint for payment updates
7. **Email Notifications**: Daily email summaries via Close API
8. **Subscription Management**: Track subscription status, start/end dates for membership verification

### Database Schema
- `users`: User accounts with encrypted passwords and subscription tracking (status, start date, end date)
- `businesses`: Business profiles with Facebook credentials and custom prompts
- `posts`: Generated posts with content, images, scheduling, and status tracking

### Automated Posting System
The PostSchedulerWorker service runs every 5 minutes and:
1. Queries all businesses in the database
2. For each business with Facebook credentials, finds approved posts due for publishing
3. Publishes posts to Facebook Page using Graph API
4. Marks posts as published (or failed if error occurs)
5. Logs all activities for monitoring

## Security Features

### Implemented Security
✅ **Facebook Token Encryption**: Access tokens encrypted with AES-256-GCM before storage
✅ **API Key Authentication**: Public API endpoints protected with API key verification
✅ **Multi-tenant Authorization**: All API routes verify business ownership
✅ **Field Whitelisting**: PATCH routes only allow specific fields to prevent privilege escalation
✅ **Input Validation**: Zod schemas validate all request bodies
✅ **Session Management**: Express sessions with secure cookies
✅ **Password Hashing**: Bcrypt with 10 salt rounds

### Encryption Details
- Facebook access tokens are encrypted using AES-256-GCM
- Encryption key stored in Replit Secrets (ENCRYPTION_KEY)
- Tokens automatically encrypted on write, decrypted on read
- Graceful error handling if decryption fails

## Subscription/Membership System

### Overview
The platform includes a complete subscription management system that integrates with OptimizePress to handle payment verification and membership status.

### API Endpoints

#### 1. Verify Membership (POST /api/auth/verify-membership)
**Purpose**: Verify user credentials and check membership status
**Authentication**: Requires API key in `X-API-Key` or `Authorization: Bearer` header

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "subscription": {
    "status": "active",
    "isActive": true,
    "startDate": "2025-10-07T00:00:00.000Z",
    "endDate": "2025-11-07T00:00:00.000Z"
  }
}
```

**Response (Invalid Credentials)**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

#### 2. Update Subscription (POST /api/auth/update-subscription)
**Purpose**: Update subscription status and dates when payments are processed
**Authentication**: Requires API key in `X-API-Key` or `Authorization: Bearer` header

**Request Body** (all fields required):
```json
{
  "email": "user@example.com",
  "subscriptionStatus": "active",
  "subscriptionStartDate": "2025-10-07T00:00:00.000Z",
  "subscriptionEndDate": "2025-11-07T00:00:00.000Z"
}
```

**Subscription Status Values**: "active", "expired", "cancelled", "trial"

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "subscription": {
    "status": "active",
    "startDate": "2025-10-07T00:00:00.000Z",
    "endDate": "2025-11-07T00:00:00.000Z"
  },
  "message": "Subscription updated successfully"
}
```

### Subscription Logic
- **Active Status**: `isActive = true` only when:
  - `subscriptionStatus` is "active"
  - `subscriptionEndDate` exists and is in the future
  - Missing end dates result in `isActive = false` (prevents indefinite access)
- **Expired Status**: Automatically detected when `subscriptionEndDate` < current date
- **Account Creation**: New accounts automatically get 1-month active subscription by default

### Integration with OptimizePress
1. **On Purchase**: OptimizePress calls `/api/accounts/create` to create user account
2. **On Login Redirect**: OptimizePress calls `/api/auth/verify-membership` to check if membership is valid
3. **On Renewal**: OptimizePress calls `/api/auth/update-subscription` with new subscription dates
4. **On Cancellation**: OptimizePress calls `/api/auth/update-subscription` with status "cancelled"

### Security Notes
- All subscription endpoints require API key authentication
- Passwords are hashed with bcrypt (10 salt rounds)
- Subscription dates must be provided in ISO 8601 format
- Missing subscription end dates are treated as inactive to prevent unauthorized access

## Running the Project
The workflow "Start application" runs `npm run dev` which starts:
- Express server on port 5000
- Vite development server
- PostSchedulerWorker (automated posting every 5 minutes)
- EmailNotificationWorker (daily email summaries every 24 hours)

## User Preferences
- Material Design aesthetic with professional blue theme
- Dark mode support throughout application
- Using existing Facebook app (not OAuth flow)
- Custom ChatGPT prompts provided by user during onboarding
