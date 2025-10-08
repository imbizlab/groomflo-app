# OptimizePress Integration Setup Guide
## Social Media Automation Platform

This guide will walk you through integrating your OptimizePress membership site with the Social Media Automation Platform for Pet Groomers.

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] OptimizePress account with admin access
- [ ] Your Replit app published/deployed (URL will look like: `https://your-app.replit.app`)
- [ ] Your API key from Replit Secrets

---

## 🔑 Step 1: Get Your API Key

1. In your Replit project, look at the left sidebar
2. Click on the "🔒 Secrets" icon (or Tools → Secrets)
3. Find the secret named `API_KEY`
4. Copy its value - you'll need this for all OptimizePress webhooks

**Important**: Keep this API key secure! Never share it publicly.

---

## 🌐 Step 2: Get Your App URL

1. In Replit, click the "Publish" button (or "Deployments" tab)
2. Copy your deployment URL (e.g., `https://your-app.replit.app`)
3. Keep this handy - you'll use it in the webhook URLs below

---

## ⚙️ Step 3: Configure OptimizePress Webhooks

OptimizePress may call webhooks differently depending on your version. Here are the common ways to set them up:

### Method A: Using OptimizePress with Make.com Integration

If OptimizePress integrates with Make.com:

1. **Log into Make.com** (create free account if needed)
2. **Create a new Scenario** for each webhook below
3. **Configure the trigger** from OptimizePress events
4. **Add an HTTP module** → "Make a request"
5. **Configure as POST request** with custom headers and body

### Method B: Direct Webhook Configuration

If OptimizePress has a direct webhook/API settings page:

1. **Log into OptimizePress**
2. **Navigate to**: Settings → Integrations → Webhooks (or similar)
3. **Create new webhooks** for each scenario below

---

## 🔧 Step 3A: Detailed Make.com Scenario Setup

Here's how to create each scenario in Make.com:

### Creating a Scenario in Make.com:

1. **Log into Make.com** and click "Create a new scenario"
2. **Add the Trigger Module**:
   - Search for "Webhook" or your payment processor (Stripe, PayPal, etc.)
   - If using Webhook: Select "Custom Webhook"
   - Copy the webhook URL Make.com provides
   - Configure in OptimizePress to send data to this URL

3. **Add HTTP Request Module**:
   - Click the "+" button to add a new module
   - Search for "HTTP" and select "Make a request"
   - Configure as follows:
     - **URL**: `https://your-app.replit.app/api/accounts/create` (or other endpoint)
     - **Method**: POST
     - **Headers**: 
       - Add header: `X-API-Key` = `your-api-key-here`
       - Add header: `Content-Type` = `application/json`
     - **Body Type**: Raw
     - **Content Type**: JSON (application/json)
     - **Request Content**: Paste JSON body (see webhook configs below)

4. **Map Variables**:
   - Click on fields in the JSON body
   - Select data from the trigger (OptimizePress webhook data)
   - Map email, password, business name, etc.

5. **Test and Activate**:
   - Click "Run once" to test
   - Verify the response shows success
   - Toggle "Scheduling" to ON to activate

---

## 🎯 Step 4: Configure Three Webhooks

You need to set up 3 different webhooks. Here's what each one does:

---

### **Webhook #1: New Customer Registration**

**Purpose**: When someone purchases your membership, create their account automatically

**When to trigger**: After successful payment/purchase completion

**Webhook Settings**:
- **URL**: `https://your-app.replit.app/api/accounts/create`
  - ⚠️ Replace `your-app.replit.app` with your actual Replit deployment URL
- **Method**: POST
- **Headers**:
  ```
  X-API-Key: your-api-key-here
  Content-Type: application/json
  ```
  - ⚠️ Replace `your-api-key-here` with your actual API key from Step 1

**Body/Payload** (JSON format):
```json
{
  "email": "{{customer_email}}",
  "password": "{{customer_password}}",
  "businessName": "{{business_name}}"
}
```

**Field Mapping**:
- `{{customer_email}}` = Customer's email from OptimizePress
- `{{customer_password}}` = Password they set during signup
- `{{business_name}}` = Their business name (or use a default like "My Pet Grooming Business")

**What it does**: Creates a new user account with a 1-month active subscription

---

### **Webhook #2: Login Verification**

**Purpose**: Check if customer has active membership before granting access

**When to trigger**: When customer tries to log in to members area

**Webhook Settings**:
- **URL**: `https://your-app.replit.app/api/auth/verify-membership`
  - ⚠️ Replace `your-app.replit.app` with your actual Replit deployment URL
- **Method**: POST
- **Headers**:
  ```
  X-API-Key: your-api-key-here
  Content-Type: application/json
  ```
  - ⚠️ Replace `your-api-key-here` with your actual API key from Step 1

**Body/Payload** (JSON format):
```json
{
  "email": "{{customer_email}}",
  "password": "{{customer_password}}"
}
```

**Expected Response**:
```json
{
  "success": true,
  "subscription": {
    "isActive": true
  }
}
```

**Access Control Logic**:
- If `"isActive": true` → **GRANT ACCESS** to members area
- If `"isActive": false` → **DENY ACCESS** and redirect to payment/renewal page

**What it does**: Validates credentials and checks if subscription is current

---

### **Webhook #3: Subscription Updates**

**Purpose**: Update subscription status when payments are received or memberships are cancelled

**When to trigger**: 
- ✅ Payment received (renewal)
- ✅ Subscription cancelled by customer
- ✅ Payment failed/expired

**Webhook Settings**:
- **URL**: `https://your-app.replit.app/api/auth/update-subscription`
  - ⚠️ Replace `your-app.replit.app` with your actual Replit deployment URL
- **Method**: POST
- **Headers**:
  ```
  X-API-Key: your-api-key-here
  Content-Type: application/json
  ```
  - ⚠️ Replace `your-api-key-here` with your actual API key from Step 1

**Body/Payload** (JSON format):
```json
{
  "email": "{{customer_email}}",
  "subscriptionStatus": "active",
  "subscriptionStartDate": "{{subscription_start_date}}",
  "subscriptionEndDate": "{{subscription_end_date}}"
}
```

**Field Mapping**:
- `{{customer_email}}` = Customer's email
- `subscriptionStatus` = One of these values:
  - `"active"` - Paid and current (use this for renewals)
  - `"expired"` - Subscription ended naturally
  - `"cancelled"` - Customer cancelled
  - `"trial"` - In trial period
- `{{subscription_start_date}}` = Start date in ISO format: `2025-10-07T00:00:00.000Z`
- `{{subscription_end_date}}` = End date in ISO format: `2025-11-07T00:00:00.000Z`

**⚠️ CRITICAL - Date Format**: Dates MUST be in ISO 8601 format:
- Correct: `"2025-10-07T00:00:00.000Z"`
- Incorrect: `"10/07/2025"`, `"Oct 7, 2025"`, `"2025-10-07"`

**What it does**: Updates the subscription dates and status in the database

---

## 🎨 Make.com Scenario Examples

### Scenario 1: Account Creation (for Webhook #1)

**Modules Flow**:
```
OptimizePress Webhook → HTTP Request → (Optional) Email Module
```

**HTTP Request Configuration**:
- **URL**: `https://your-app.replit.app/api/accounts/create`
- **Method**: POST
- **Headers**:
  ```
  Name: X-API-Key
  Value: your-api-key-here
  
  Name: Content-Type
  Value: application/json
  ```
- **Body**:
  ```json
  {
    "email": "{{1.email}}",
    "password": "{{1.password}}",
    "businessName": "{{1.business_name}}"
  }
  ```
  *Note: The numbers (1, 2, etc.) refer to module numbers in Make.com*

### Scenario 2: Verify Membership (for Webhook #2)

**Modules Flow**:
```
OptimizePress Login → HTTP Request → Router (check isActive) → Grant/Deny Access
```

**HTTP Request Configuration**:
- **URL**: `https://your-app.replit.app/api/auth/verify-membership`
- **Method**: POST
- **Headers**: Same as Scenario 1
- **Body**:
  ```json
  {
    "email": "{{1.email}}",
    "password": "{{1.password}}"
  }
  ```

**Router Configuration**:
- Add a "Router" module after HTTP Request
- **Route 1** (Grant Access): Condition `{{2.subscription.isActive}}` = `true`
- **Route 2** (Deny Access): Condition `{{2.subscription.isActive}}` = `false`

### Scenario 3: Update Subscription (for Webhook #3)

**Modules Flow**:
```
Payment Webhook → Set Variables (format dates) → HTTP Request
```

**Set Variables Module** (for date formatting):
- **Variable 1 Name**: `startDate`
- **Variable 1 Value**: `{{formatDate(now; "YYYY-MM-DDTHH:mm:ss.SSS[Z]")}}`
- **Variable 2 Name**: `endDate`
- **Variable 2 Value**: `{{formatDate(addMonths(now; 1); "YYYY-MM-DDTHH:mm:ss.SSS[Z]")}}`

**HTTP Request Configuration**:
- **URL**: `https://your-app.replit.app/api/auth/update-subscription`
- **Method**: POST
- **Headers**: Same as Scenario 1
- **Body**:
  ```json
  {
    "email": "{{1.email}}",
    "subscriptionStatus": "active",
    "subscriptionStartDate": "{{2.startDate}}",
    "subscriptionEndDate": "{{2.endDate}}"
  }
  ```

---

## 📅 Step 5: Date Format Configuration

**Important**: OptimizePress must send dates in ISO 8601 format.

If OptimizePress doesn't format dates correctly by default:

### Using Make.com (Recommended):
1. Add a "Tools" → "Set variable" module before the HTTP request
2. Or use "Text parser" → "Format date" function
3. Input: `{{subscription_end_date}}` from OptimizePress
4. Format function: `formatDate({{subscription_end_date}}; YYYY-MM-DDTHH:mm:ss.SSS[Z])`
5. Example output: `2025-11-07T00:00:00.000Z`

### Using Make.com Built-in Functions:
- For current date: `{{now}}`
- For date + 1 month: `{{addMonths(now; 1)}}`
- To format: `{{formatDate(addMonths(now; 1); YYYY-MM-DDTHH:mm:ss.SSS[Z])}}`

### Manual Date Calculation:
If you need to calculate the end date (for monthly subscriptions):
- Start date: Current date
- End date: Current date + 1 month (or your billing cycle)
- Both formatted in ISO 8601

---

## 🧪 Step 6: Test Your Integration

### Test Webhook #1 (Account Creation)
Open your terminal/command prompt and run:

```bash
curl -X POST https://your-app.replit.app/api/accounts/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123",
    "businessName":"Test Business"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "user": {"id": "...", "email": "test@example.com"},
  "business": {"id": "...", "businessName": "Test Business"},
  "message": "Account created successfully"
}
```

### Test Webhook #2 (Verify Membership)
```bash
curl -X POST https://your-app.replit.app/api/auth/verify-membership \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "subscription": {
    "status": "active",
    "isActive": true,
    "startDate": "2025-10-07T...",
    "endDate": "2025-11-07T..."
  }
}
```

### Test Webhook #3 (Update Subscription)
```bash
curl -X POST https://your-app.replit.app/api/auth/update-subscription \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "subscriptionStatus":"active",
    "subscriptionStartDate":"2025-10-07T00:00:00.000Z",
    "subscriptionEndDate":"2025-11-07T00:00:00.000Z"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Subscription updated successfully"
}
```

---

## 🔄 Step 7: OptimizePress Member Area Configuration

Configure your OptimizePress member area to use the verification system:

1. **Create a custom login page** (if not using default)
2. **Add login form** that collects email and password
3. **On form submission**:
   - Call the verify-membership endpoint
   - Check the `isActive` field in response
   - If `true`: Redirect to `/dashboard` (your app)
   - If `false`: Show "Subscription expired" message with payment link

### Login Page Flow:
```
Customer enters email/password
        ↓
Call verify-membership endpoint
        ↓
   Check isActive
        ↓
    ┌───────┴───────┐
    ↓               ↓
  true            false
    ↓               ↓
Grant access    Show payment page
```

---

## 🎯 Step 8: Subscription Lifecycle

Here's how the subscription system works:

### New Purchase:
1. Customer completes payment in OptimizePress
2. OptimizePress triggers **Webhook #1** (account creation)
3. Account created with 1-month active subscription
4. Customer receives login credentials

### Login Attempt:
1. Customer enters email/password
2. OptimizePress calls **Webhook #2** (verify membership)
3. System checks if subscription is active
4. Access granted or denied

### Monthly Renewal:
1. Payment processor charges customer
2. OptimizePress triggers **Webhook #3** (update subscription)
3. Send new start/end dates (extend by 1 month)
4. Set status to `"active"`

### Cancellation:
1. Customer cancels subscription
2. OptimizePress triggers **Webhook #3** (update subscription)
3. Set status to `"cancelled"`
4. Keep current end date (access until period ends)

### Expiration:
1. End date passes
2. Next login attempt → verify returns `isActive: false`
3. Customer redirected to payment page

---

## 🔒 Security Notes

### Important Security Practices:
- ✅ Always send API key in headers (never in URL)
- ✅ Use HTTPS for all webhook URLs (Replit provides this automatically)
- ✅ Keep your API key secret - never commit it to code
- ✅ All passwords are automatically hashed (bcrypt)
- ✅ Missing subscription end dates = access denied (prevents indefinite access)

### What's Protected:
- All webhook endpoints require API key authentication
- Passwords are hashed before storage (bcrypt with 10 salt rounds)
- Facebook tokens are encrypted (AES-256-GCM)
- Multi-tenant authorization on all routes

---

## ❓ Troubleshooting

### Problem: "Invalid API key" error
**Solution**: 
- Double-check you copied the API key correctly from Replit Secrets
- Make sure header name is exactly: `X-API-Key` (case sensitive)
- Verify no extra spaces in the API key value

### Problem: "Invalid credentials" response
**Solution**:
- Verify the email exists in the system
- Check that password matches exactly (case sensitive)
- Try creating a test account first using Webhook #1

### Problem: "isActive is false" but subscription should be active
**Solution**:
- Check that `subscriptionEndDate` is in the future
- Verify date format is ISO 8601: `2025-11-07T00:00:00.000Z`
- Confirm `subscriptionStatus` is set to `"active"`

### Problem: Dates not formatting correctly
**Solution**:
- Use Make.com's formatDate function to convert dates to ISO 8601
- Format: `formatDate({{date}}; YYYY-MM-DDTHH:mm:ss.SSS[Z])`
- Ensure output is: `YYYY-MM-DDTHH:mm:ss.SSS[Z]`
- Test with the curl commands above to verify format

### Problem: Webhook not triggering
**Solution**:
- Check OptimizePress webhook logs (if available)
- Verify the trigger event is configured correctly
- Test webhook manually using the curl commands above
- Ensure your Replit app is published/deployed

---

## 📞 Support

If you need help:
1. Test webhooks using the curl commands in Step 6
2. Check Replit logs for error messages
3. Verify all dates are in ISO 8601 format
4. Confirm API key is correct

---

## ✅ Quick Checklist

Before going live, verify:

### Make.com Setup:
- [ ] Created 3 scenarios in Make.com (one for each webhook)
- [ ] Each scenario has correct HTTP Request module configured
- [ ] API key is correct in all HTTP request headers
- [ ] Deployment URL is correct in all HTTP request URLs
- [ ] Date formatting modules are configured (Scenario 3)
- [ ] All scenarios are activated (Scheduling is ON)

### Testing:
- [ ] Test account creation works (Webhook #1 / Scenario 1)
- [ ] Test verification works (Webhook #2 / Scenario 2)
- [ ] Test subscription update works (Webhook #3 / Scenario 3)
- [ ] Dates are in ISO 8601 format in all requests
- [ ] Login page redirects based on `isActive` status
- [ ] Payment/renewal flow triggers subscription updates

### OptimizePress:
- [ ] Webhooks configured to trigger Make.com scenarios
- [ ] Custom login page calls verify-membership endpoint
- [ ] Welcome emails include login credentials

---

## 🎉 You're All Set!

Once configured, your integration will:
- ✅ Automatically create accounts when customers purchase
- ✅ Verify membership status on every login
- ✅ Update subscriptions when payments are processed
- ✅ Deny access when subscriptions expire
- ✅ Handle cancellations gracefully

Your customers will have seamless access to the social media automation platform!
