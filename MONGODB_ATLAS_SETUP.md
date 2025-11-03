# 🗄️ MongoDB Atlas Setup Guide

This guide will help you configure the project to use MongoDB Atlas (cloud database).

## 📋 Prerequisites

- MongoDB Atlas account (free tier available)
- Cluster created in MongoDB Atlas

## 🔑 Get Your Connection String

### Step 1: Get Your Database Password

When you created your MongoDB Atlas cluster, you set a database password. You need this to complete the connection string.

**⚠️ Important**: If you forgot your password, you'll need to reset it in MongoDB Atlas:
1. Go to Database Access
2. Find your user
3. Click "Edit"
4. Reset the password

### Step 2: Build Your Connection String

Your connection string from MongoDB Atlas:
```
mongodb+srv://fgomezd1_db_user:<db_password>@instagram-cm.zkeq4v4.mongodb.net/?appName=instagram-cm
```

**Replace `<db_password>` with your actual database password**

For example, if your password is `MySecurePassword123!`, your connection string would be:
```
mongodb+srv://fgomezd1_db_user:MySecurePassword123!@instagram-cm.zkeq4v4.mongodb.net/?appName=instagram-cm
```

## ⚙️ Configure the Backend

### Step 1: Create Backend .env File

Navigate to the `backend` directory and create a `.env` file:

```bash
cd backend
```

Copy the template:
```bash
# On Windows
copy env.template .env

# On Mac/Linux
cp env.template .env
```

### Step 2: Edit the .env File

Open the `.env` file in a text editor and update it:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://fgomezd1_db_user:YOUR_ACTUAL_PASSWORD@instagram-cm.zkeq4v4.mongodb.net/instagram-cm?retryWrites=true&w=majority&appName=instagram-cm

# Server Configuration
PORT=5000

# CORS Configuration (Frontend URL)
FRONTEND_URL=http://localhost:5173

# Instagram Webhook Secret (for webhook verification)
INSTAGRAM_WEBHOOK_SECRET=your_webhook_secret_here
```

**Key points:**
- Replace `YOUR_ACTUAL_PASSWORD` with your actual database password
- The database name `instagram-cm` is included in the connection string
- Added `retryWrites=true&w=majority` for better connection reliability

### Step 3: Configure Network Access in MongoDB Atlas

You need to allow your IP address to access MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Click **Network Access** in the left menu
3. Click **Add IP Address**
4. Choose one of these options:
   - **Add Current IP Address** (for local development)
   - **Allow Access from Anywhere** - `0.0.0.0/0` (for testing only, not recommended for production)

   **For quick testing:**
   ```
   Add IP Address: 0.0.0.0/0
   ```

**⚠️ Security Warning:** `0.0.0.0/0` allows access from anywhere. For production, use specific IP addresses.

## 🚀 Test the Connection

### Step 1: Start the Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on port 5000
```

### Step 2: Test the Health Endpoint

Open a new terminal and run:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "mongodb": "connected"
}
```

If you see `"mongodb": "connected"`, congratulations! 🎉 Your MongoDB Atlas connection is working!

## 🐛 Troubleshooting

### Error: "Authentication failed"

**Problem**: Wrong password in connection string

**Solution**:
- Double-check your password in `.env`
- Reset password in MongoDB Atlas if needed
- Make sure there are no spaces or extra characters

### Error: "Connection timeout"

**Problem**: IP address not whitelisted

**Solution**:
- Go to Network Access in MongoDB Atlas
- Add your current IP address
- Or temporarily add `0.0.0.0/0` for testing

### Error: "SSL/TLS errors"

**Problem**: Connection string format issue

**Solution**:
- Make sure you're using `mongodb+srv://` (not `mongodb://`)
- Check that the connection string is properly formatted
- Ensure the password is URL-encoded if it contains special characters

### Error: "Invalid database name"

**Problem**: Database name not specified in connection string

**Solution**:
- Add the database name after the hostname
- Example: `...mongodb.net/instagram-cm?...`

## 🔒 Production Security

For production deployment:

1. **Use specific IP whitelist** (not `0.0.0.0/0`)
2. **Use environment variables** (never hardcode passwords)
3. **Enable MongoDB Atlas authentication**
4. **Use dedicated database user** with limited permissions
5. **Enable audit logging**
6. **Regular backup strategy**

## 📝 Connection String Format Explained

```
mongodb+srv://username:password@cluster-host/database?options
```

- `mongodb+srv://` - Protocol (SRV connection for MongoDB Atlas)
- `username` - Your database username (fgomezd1_db_user)
- `password` - Your database password
- `cluster-host` - Your cluster hostname (instagram-cm.zkeq4v4.mongodb.net)
- `database` - Database name (instagram-cm)
- `options` - Connection options (retryWrites, appName, etc.)

## ✅ Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (IP whitelist)
- [ ] `.env` file created in `backend/` directory
- [ ] Connection string updated with correct password
- [ ] Backend server starts successfully
- [ ] Health check returns `"mongodb": "connected"`

## 🎯 Next Steps

Once your MongoDB Atlas connection is working:

1. Test webhook functionality
2. Send test data to verify storage
3. Check the frontend dashboard
4. Verify data appears in MongoDB Atlas

## 📞 Need Help?

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Connection String Guide: https://docs.atlas.mongodb.com/reference/connection-string/
- Check MongoDB Atlas logs for connection issues

---

**Ready to test?** Run `npm start` in the backend directory and check the console output!

