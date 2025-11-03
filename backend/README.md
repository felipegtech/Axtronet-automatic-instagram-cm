# Backend Server

Express.js server for handling Instagram webhooks and API requests.

## Setup

1. Create a `.env` file in the `backend` directory:

```bash
cp env.template .env
```

2. Edit `.env` with your configuration

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS
- `INSTAGRAM_WEBHOOK_SECRET`: Secret for webhook verification

## API Endpoints

- `GET /health` - Health check
- `GET /api/interactions` - Get all interactions
- `GET /api/stats` - Get statistics
- `POST /webhook` - Instagram webhook endpoint
- `GET /webhook` - Webhook verification

## Models

### Interaction

- `type`: "comment" | "reaction"
- `message`: String
- `user`: String (username or ID)
- `timestamp`: Date
- `postId`: String (optional)
- `reactionType`: String (optional)

