# Quick Start Guide

Follow these steps to run the Instagram Webhook Dashboard locally.

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally or MongoDB Atlas account

## Installation & Setup

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `.env` with the following content:

```env
MONGODB_URI=mongodb://localhost:27017/axtronet-instagram
PORT=5000
FRONTEND_URL=http://localhost:5173
INSTAGRAM_WEBHOOK_SECRET=your_secret_here
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows: MongoDB service should already be running
# macOS/Linux:
mongod
```

**Option B: MongoDB Atlas**
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### Step 4: Start Backend Server

Open a terminal:

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Server running on port 5000
```

### Step 5: Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 6: Open Dashboard

Open your browser and go to:
```
http://localhost:5173
```

You should see the Instagram Interactions Dashboard!

## Testing

### Test the Backend

```bash
# Health check
curl http://localhost:5000/health

# Get interactions
curl http://localhost:5000/api/interactions

# Get stats
curl http://localhost:5000/api/stats
```

### Send a Test Webhook

```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "changes": [{
        "field": "comments",
        "value": {
          "text": "Test comment",
          "from": {"username": "test_user"},
          "media": {"id": "123"},
          "created_time": 1699123456
        }
      }]
    }]
  }'
```

Then refresh your browser to see the interaction appear in the dashboard!

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` should connect
- Check `.env` file exists and has correct `MONGODB_URI`
- Try: `mongodb://127.0.0.1:27017/axtronet-instagram`

### Port Already in Use
- Change `PORT` in `backend/.env`
- Or kill the process using port 5000

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

### No Data Showing
- Check browser console for errors
- Verify both servers are running
- Test backend directly with curl

## Next Steps

- Read `WEBHOOK_TESTING.md` for detailed webhook testing
- Read `README.md` for full documentation
- Check `backend/models/Interaction.js` for data model
- Explore `frontend/src/components/` for UI customization

## Development Mode

For development with auto-reload:

```bash
# Backend (requires Node 19+ for --watch)
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
```

## Need Help?

- Check console logs for errors
- Verify all environment variables are set
- Make sure MongoDB is accessible
- Review the README.md for more details

Happy coding! 🚀

