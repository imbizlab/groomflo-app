# OptimizePress Integration Guide

## Overview
This guide explains how to integrate your social media automation platform with OptimizePress to automatically create accounts when users purchase a subscription.

## API Endpoint

### Account Creation API
**Endpoint:** `POST /api/accounts/create`

**Authentication:** Requires API key in header

**Headers:**
```
Content-Type: application/json
X-API-Key: 0a9ba50d53621522055ca93f06c32efda3a263bc077a75eaf96dbcdbdbb038b4
```

(Alternative: You can also use `Authorization: Bearer YOUR_API_KEY`)

### Request Body
```json
{
  "email": "customer@example.com",
  "password": "securepassword123",
  "businessName": "Happy Paws Grooming",
  "address": "123 Main St, City, State",
  "phone": "555-1234",
  "website": "https://happypaws.com",
  "notificationEmail": "notifications@example.com"
}
```

**Required Fields:**
- `email` (string) - Customer's email address (becomes username)
- `password` (string) - Minimum 6 characters
- `businessName` (string) - Name of the pet grooming business

**Optional Fields:**
- `address` (string) - Business address
- `phone` (string) - Business phone number
- `website` (string) - Business website URL
- `notificationEmail` (string) - Email for daily notifications (defaults to email field)

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "d2543d5c-5abe-469e-b11c-ccc061ebd46a",
    "email": "customer@example.com"
  },
  "business": {
    "id": "d374ca6d-de29-4a97-a455-1a0df38b39e4",
    "businessName": "Happy Paws Grooming"
  },
  "message": "Account created successfully"
}
```

**Error (400 Bad Request - Duplicate Email):**
```json
{
  "error": "An account with this email already exists"
}
```

**Error (401 Unauthorized - Invalid API Key):**
```json
{
  "error": "Invalid API key"
}
```

**Error (400 Bad Request - Validation Failed):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

## OptimizePress Setup

### Step 1: Configure Webhook in OptimizePress

1. Go to your OptimizePress dashboard
2. Navigate to your subscription product settings
3. Find the "Webhooks" or "Integrations" section
4. Add a new webhook with these settings:
   - **URL:** `https://your-replit-app.replit.app/api/accounts/create`
   - **Method:** POST
   - **Trigger:** After successful payment

### Step 2: Configure Webhook Payload

Map the following fields from OptimizePress to the API:

```javascript
{
  "email": "{customer_email}",
  "password": "{generate_random_password}",  // OptimizePress should generate this
  "businessName": "{business_name_field}",   // From your custom form
  "address": "{address_field}",              // Optional
  "phone": "{phone_field}",                  // Optional
  "website": "{website_field}",              // Optional
  "notificationEmail": "{notification_email_field}" // Optional
}
```

### Step 3: Add Custom Headers

In OptimizePress webhook settings, add this header:
```
X-API-Key: 0a9ba50d53621522055ca93f06c32efda3a263bc077a75eaf96dbcdbdbb038b4
```

### Step 4: Password Handling

**Option A (Recommended):** Generate password in OptimizePress
- Generate a random secure password (12+ characters)
- Send it to the API
- Email the password to the customer separately

**Option B:** Collect password during checkout
- Add a password field to your checkout form
- Pass it through the webhook

### Step 5: Send Welcome Email

After successful account creation, OptimizePress should send a welcome email to the customer with:
- Login URL: `https://your-replit-app.replit.app`
- Username: Their email address
- Password: The generated password
- Instructions to complete onboarding (add Facebook credentials, customize prompts)

## Testing the Integration

Use this cURL command to test the API:

```bash
curl -X POST https://your-replit-app.replit.app/api/accounts/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 0a9ba50d53621522055ca93f06c32efda3a263bc077a75eaf96dbcdbdbb038b4" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "businessName": "Test Grooming Business"
  }'
```

## Security Features

### API Key Authentication
- All requests must include the API key in the `X-API-Key` header
- The API key is stored securely in Replit Secrets
- Invalid requests are rejected with 401 Unauthorized

### Password Hashing
- Passwords are hashed using bcrypt with 10 salt rounds
- Passwords are never stored in plaintext

### Facebook Token Encryption
- Facebook access tokens are encrypted using AES-256-GCM
- Tokens are encrypted before storing in database
- Tokens are decrypted when retrieved by the application
- Encryption key is stored in Replit Secrets

### Duplicate Email Prevention
- API checks for existing accounts before creating new ones
- Returns 400 error if email already exists

## After Account Creation

The customer will need to:
1. Log in at `https://your-replit-app.replit.app`
2. Complete the onboarding flow:
   - Add their Facebook Page ID and Access Token
   - Customize the ChatGPT prompts for their business
   - Set their slowest business day for promotional post timing
   - Configure business hours and contact information
3. Generate their first week of posts
4. Review and approve posts before they're published

## Support

If you encounter issues with the integration:
- Check that the API key is correct
- Verify the request body matches the schema
- Ensure all required fields are provided
- Check OptimizePress webhook logs for errors
- Test the API endpoint directly using cURL

## Environment Variables

Make sure these secrets are configured in Replit:
- `API_KEY` - API key for OptimizePress webhook authentication
- `ENCRYPTION_KEY` - 64-character hex key for Facebook token encryption
- `SESSION_SECRET` - Secret for session management
- `OPENAI_API_KEY` - OpenAI API key for content generation
- `CLOSEGPT_SECRET_KEY` - Close API key for email notifications (optional)
- `CLOSEGPT_PUBLIC_KEY` - Close public key (optional)
