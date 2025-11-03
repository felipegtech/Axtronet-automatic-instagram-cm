# 🚀 Getting Started with Instagram Webhook Dashboard

Welcome! This guide will help you get the dashboard up and running in minutes.

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Create Backend Environment File

```bash
cd backend
```

Create a file named `.env` with this content:

**For MongoDB Atlas (Recommended):**
```env
# Replace <db_password> with your actual MongoDB Atlas password!
MONGODB_URI=mongodb+srv://fgomezd1_db_user:<db_password>@instagram-cm.zkeq4v4.mongodb.net/instagram-cm?retryWrites=true&w=majority&appName=instagram-cm
PORT=5000
FRONTEND_URL=http://localhost:5173
INSTAGRAM_WEBHOOK_SECRET=your_secret_here
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/axtronet-instagram
PORT=5000
FRONTEND_URL=http://localhost:5173
INSTAGRAM_WEBHOOK_SECRET=your_secret_here
```

> **📖 Need help with MongoDB Atlas?** See [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

### 2️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3️⃣ Configure MongoDB Atlas (If using cloud)

If using MongoDB Atlas, you need to configure network access:

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click **Network Access** (left menu)
3. Click **Add IP Address**
4. For testing: Add `0.0.0.0/0` (allows any IP)
5. Click **Confirm**

**⏭️ Skip this step if using local MongoDB**

### 4️⃣ Start Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on port 5000
```

### 5️⃣ Start Frontend

Open a **new terminal**:

```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

### 6️⃣ Open Dashboard

Open your browser: **http://localhost:5173**

---

## 🧪 Test It Out

Send a test webhook:

```bash
curl -X POST http://localhost:5000/webhook -H "Content-Type: application/json" -d "{\"object\":\"instagram\",\"entry\":[{\"changes\":[{\"field\":\"comments\",\"value\":{\"text\":\"Test comment!\",\"from\":{\"username\":\"test_user\"},\"media\":{\"id\":\"123\"},\"created_time\":1699123456}}]}]}"
```

Then refresh your browser to see it appear!

---

## 📚 Documentation

- **📖 README.md** - Full documentation
- **⚡ START.md** - Quick start guide
- **🗄️ MONGODB_ATLAS_SETUP.md** - MongoDB Atlas configuration guide
- **🧪 WEBHOOK_TESTING.md** - Testing instructions
- **🏗️ PROJECT_STRUCTURE.md** - Architecture details
- **✅ IMPLEMENTATION_SUMMARY.md** - Project overview

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to MongoDB | Make sure MongoDB is running or check Atlas config |
| Authentication failed | Double-check password in `.env` file |
| Connection timeout | Add IP address to MongoDB Atlas Network Access |
| Port 5000 in use | Change PORT in `backend/.env` |
| Frontend shows errors | Ensure backend is running on port 5000 |
| No data showing | Send a test webhook (see above) |

---

## 🎯 What You'll See

- **Green dot** = Server is online ✅
- **Statistics cards** = Total, comments, reactions, 24h activity
- **Interactions table** = All your Instagram interactions
- **Auto-refresh** = Updates every 30 seconds

---

## 🔗 API Endpoints

- `GET /health` - Server status
- `GET /api/interactions` - Get all interactions
- `GET /api/stats` - Get statistics
- `POST /webhook` - Instagram webhook

---

## 💡 Next Steps

1. Configure your Instagram webhooks
2. Customize the dashboard UI
3. Add more features
4. Deploy to production

**Need help?** Check the documentation files or review the code comments.

---

**Happy coding! 🎉**

