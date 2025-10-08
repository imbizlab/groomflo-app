# How to Import Make.com Scenarios

You now have 3 Make.com scenario blueprint files ready to import:

1. **make-scenario-1-account-creation.json** - Creates accounts when customers purchase
2. **make-scenario-2-verify-membership.json** - Verifies membership on login
3. **make-scenario-3-update-subscription.json** - Updates subscription on renewal/cancellation

---

## 📥 Step-by-Step Import Instructions

### For Each Scenario File:

1. **Log into Make.com** (https://www.make.com)

2. **Click "Scenarios"** in the left sidebar

3. **Click the "..." menu** (three dots) in the top right

4. **Select "Import Blueprint"**

5. **Click "Choose File"** and select one of the JSON files:
   - Start with `make-scenario-1-account-creation.json`
   - Then `make-scenario-2-verify-membership.json`
   - Finally `make-scenario-3-update-subscription.json`

6. **Click "Save"**

7. **The scenario will open** - now you need to configure it

---

## ⚙️ Configuration Steps (For Each Imported Scenario)

### All Scenarios Need:

#### 1. Configure the Webhook (First Module):
- Click on the **webhook module** (module #1)
- Click **"Create a webhook"**
- Give it a name (e.g., "OptimizePress Purchase")
- **Copy the webhook URL** Make.com generates
- You'll use this URL in OptimizePress settings

#### 2. Update Your API Key and URL:
- Click on the **HTTP module** (module #2 or #3)
- Find the **Headers** section
- Replace `your-api-key-here` with your actual API key from Replit Secrets
- Find the **URL** field
- Replace `https://your-app.replit.app` with your actual Replit deployment URL

#### 3. Map Data Fields:
- In the HTTP module, look at the **Body** section
- You'll see fields like `{{1.email}}`, `{{1.password}}`, etc.
- These reference data from module 1 (the webhook)
- **You may need to update these** based on what OptimizePress sends
- Click on each field and select the correct data from the webhook

---

## 🔗 Connect to OptimizePress

After importing and configuring all scenarios:

### Step 1: Get Webhook URLs
Each scenario will have a webhook URL from module #1. Copy these URLs:
- Scenario 1: Account Creation webhook URL
- Scenario 2: Verify Membership webhook URL  
- Scenario 3: Update Subscription webhook URL

### Step 2: Configure OptimizePress
In OptimizePress, set up webhooks to call these Make.com URLs:
- **Purchase Complete** → Call Scenario 1 webhook
- **Login Attempt** → Call Scenario 2 webhook
- **Payment Received/Cancelled** → Call Scenario 3 webhook

---

## 🧪 Testing Each Scenario

### Test Scenario 1 (Account Creation):
1. In Make.com, click "Run once" on the scenario
2. It will wait for webhook data
3. In OptimizePress, make a test purchase OR manually trigger the webhook
4. Check if Make.com received the data and sent it to your API

### Test Scenario 2 (Verify Membership):
1. Click "Run once"
2. Trigger a login attempt in OptimizePress
3. Check the router output - it should set either `accessGranted` or `accessDenied`

### Test Scenario 3 (Update Subscription):
1. Click "Run once"
2. The scenario will automatically format dates to ISO 8601
3. Trigger a payment/renewal webhook
4. Verify the subscription was updated

---

## ✏️ Customization Notes

### Scenario 1 - Account Creation:
- Default sends: email, password, businessName
- **Optional fields** you can add to the body:
  - `address`
  - `phone`
  - `website`
  - `notificationEmail`

### Scenario 2 - Verify Membership:
- Has a **Router module** that checks `isActive`
- Route 1: Sets `accessGranted = true` if active
- Route 2: Sets `accessDenied = true` if inactive
- You can add more modules after the router to:
  - Redirect users
  - Send emails
  - Update OptimizePress

### Scenario 3 - Update Subscription:
- **Automatically calculates dates**:
  - Start date = current time
  - End date = 1 month from now
- Both formatted in ISO 8601
- **To change subscription length**:
  - Edit module #2 (Set Variables)
  - Change `addMonths(now; 1)` to `addMonths(now; 3)` for 3 months
  - Or use `addDays(now; 7)` for 7 days trial

---

## 🔄 Activate Scenarios

Once configured and tested:

1. **Click the "Scheduling" toggle** to turn it ON
2. Set schedule to "Immediately as data arrives" (default for webhooks)
3. Each scenario will now run automatically when triggered

---

## ❓ Common Issues

### Issue: "Invalid API key" in HTTP response
**Fix**: Double-check you replaced `your-api-key-here` in the HTTP module headers

### Issue: "Cannot read property 'email' of undefined"
**Fix**: The webhook data structure is different than expected
- Click on the webhook module
- Look at "Data structure" 
- Update the mappings in the HTTP module to match

### Issue: Dates are wrong format
**Fix**: In Scenario 3, module #2 formats dates automatically
- Verify the formatDate function: `formatDate(now; "YYYY-MM-DDTHH:mm:ss.SSS[Z]")`
- Make sure quotes around the format are correct

### Issue: Scenario not triggering
**Fix**: 
- Verify the webhook URL is correctly configured in OptimizePress
- Check that the scenario is activated (Scheduling is ON)
- Look at scenario history to see if it received any data

---

## 📊 Monitoring

To check scenario execution:
1. Go to **Scenarios** in Make.com
2. Click on a scenario name
3. Click **"History"** tab
4. View all executions with success/error status
5. Click on any execution to see detailed logs

---

## 🎉 You're Done!

Once all 3 scenarios are:
- ✅ Imported
- ✅ Configured with your API key and URL
- ✅ Tested successfully
- ✅ Activated (Scheduling ON)

Your OptimizePress membership site will be fully integrated with your social media automation platform!
