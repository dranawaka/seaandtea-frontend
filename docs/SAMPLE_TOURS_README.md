# Sample Tours Creation Script

This script creates sample tours for the guide account `d@guild.com` in the Sea & Tea Tours application.

## Overview

The script creates 5 diverse sample tours covering different categories:

1. **Ceylon Tea Plantation Discovery** (Tea Tours) - $75, 6 hours
2. **Mirissa Whale Watching & Beach Bliss** (Beach Tours) - $95, 8 hours  
3. **Ancient Kandy Cultural Heritage** (Cultural Tours) - $85, 7 hours
4. **Sigiriya Rock Fortress Adventure** (Adventure Tours) - $65, 5 hours
5. **Colombo Street Food & Market Safari** (Food Tours) - $45, 4 hours

Each tour includes:
- Detailed descriptions and highlights
- Pricing and duration information
- What's included/excluded
- Requirements and difficulty levels
- Realistic Sri Lankan locations and experiences

## Prerequisites

1. **Backend API running** on `http://localhost:8080` (or set `REACT_APP_API_BASE_URL` environment variable)
2. **Guide account exists** with email `d@guild.com`
3. **Node.js** installed on your system
4. **Network access** to the API server

## Usage Options

### Option 1: Automatic Login (Recommended)

The script will automatically log in as `d@guild.com`:

```bash
node create_sample_tours.js
```

**Default password assumption:** `password123`

If the password is different, you'll need to either:
- Update the password in the script (line 179)
- Use Option 2 with a manual token

### Option 2: Manual Token

If you already have an authentication token:

```bash
node create_sample_tours.js --token YOUR_AUTH_TOKEN_HERE
```

### Option 3: Get Token Manually

1. Log in to the application with `d@guild.com`
2. Open browser developer tools (F12)
3. Go to Application/Storage → Local Storage
4. Find `authToken` and copy its value
5. Use Option 2 with that token

## Environment Configuration

Set the API base URL if different from default:

```bash
# Linux/Mac
export REACT_APP_API_BASE_URL=http://your-api-server:8080/api/v1
node create_sample_tours.js

# Windows
set REACT_APP_API_BASE_URL=http://your-api-server:8080/api/v1
node create_sample_tours.js
```

## Expected Output

```
🚀 Starting sample tour creation process...
📡 Using API Base URL: http://localhost:8080/api/v1
🔐 Attempting to login as d@guild.com...
✅ Login successful!
📝 Creating 5 sample tours...

🎯 Creating tour 1/5: "Ceylon Tea Plantation Discovery"
✅ Successfully created: "Ceylon Tea Plantation Discovery" (ID: 123)

🎯 Creating tour 2/5: "Mirissa Whale Watching & Beach Bliss"
✅ Successfully created: "Mirissa Whale Watching & Beach Bliss" (ID: 124)

... (continuing for all tours)

🎉 Sample tour creation completed!
✅ Successfully created 5 out of 5 tours

📋 Created tours summary:
1. Ceylon Tea Plantation Discovery - $75 (6h, TEA_TOURS)
2. Mirissa Whale Watching & Beach Bliss - $95 (8h, BEACH_TOURS)
3. Ancient Kandy Cultural Heritage - $85 (7h, CULTURAL_TOURS)
4. Sigiriya Rock Fortress Adventure - $65 (5h, ADVENTURE_TOURS)
5. Colombo Street Food & Market Safari - $45 (4h, FOOD_TOURS)
```

## Troubleshooting

### Login Issues

**Error:** `Login failed: 401 - Invalid credentials`
- Check if `d@guild.com` account exists
- Verify the password (default: `password123`)
- Make sure the account has GUIDE role permissions

### API Connection Issues

**Error:** `fetch failed` or connection refused
- Verify the backend API is running
- Check the API URL (default: `http://localhost:8080/api/v1`)
- Ensure no firewall blocking the connection

### Authorization Issues

**Error:** `403 - Forbidden` or `Unauthorized`
- Ensure the account has GUIDE role
- Check if the account is verified (if verification required)
- Try obtaining a fresh token manually

### Tour Creation Issues

**Error:** `Failed to create tour: 400 - Validation error`
- Check if required fields are missing in the tour data
- Verify the tour data structure matches API expectations
- Review backend validation rules

## Customization

To modify the sample tours:

1. Edit the `sampleTours` array in `create_sample_tours.js`
2. Adjust tour details as needed:
   - `title`, `description`, `category`
   - `location`, `duration`, `maxGroupSize`, `price`
   - `difficulty`, `includes`, `excludes`, `requirements`, `highlights`

### Tour Categories

Available categories (check your backend for exact values):
- `TEA_TOURS`
- `BEACH_TOURS` 
- `CULTURAL_TOURS`
- `ADVENTURE_TOURS`
- `FOOD_TOURS`
- `WILDLIFE_TOURS`
- `HISTORICAL_TOURS`

### Difficulty Levels
- `EASY`
- `MODERATE`
- `CHALLENGING`

## Script Features

- **Automatic authentication** with retry logic
- **Error handling** for individual tour creation failures
- **Progress tracking** with detailed console output
- **Rate limiting** (1-second delay between requests)
- **Flexible configuration** via environment variables
- **Token-based operation** for manual authentication

## Next Steps

After running the script:

1. **Log in to the application** as `d@guild.com`
2. **Navigate to Guide Tours** page (`/guide-tours`)
3. **Verify tours were created** correctly
4. **Test tour management** features (edit, delete, view)
5. **Check public tour listings** to ensure tours appear

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify all prerequisites are met
3. Try the manual token approach if automatic login fails
4. Check network connectivity and API server status
5. Review the backend logs for additional error details

The script is designed to be robust and provide clear feedback about any issues encountered during the tour creation process.
