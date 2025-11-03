# Project Structure

Complete overview of the Instagram Webhook Dashboard project structure.

```
Axtronet-automatic-instagram-cm/
│
├── 📁 backend/                      # Backend Node.js/Express server
│   ├── 📁 models/
│   │   └── Interaction.js           # Mongoose schema/model for interactions
│   ├── server.js                    # Main Express server file
│   ├── package.json                 # Backend dependencies
│   ├── env.template                 # Environment variables template
│   ├── .gitignore                   # Backend gitignore
│   └── README.md                    # Backend documentation
│
├── 📁 frontend/                     # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Dashboard.jsx        # Main dashboard component
│   │   │   ├── Stats.jsx            # Statistics cards component
│   │   │   └── InteractionsList.jsx # Interactions table component
│   │   ├── App.jsx                  # Root React component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles with TailwindCSS
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── package.json                 # Frontend dependencies
│   └── README.md                    # Frontend documentation (auto-generated)
│
├── README.md                        # Main project documentation
├── START.md                         # Quick start guide
├── WEBHOOK_TESTING.md               # Webhook testing guide
├── PROJECT_STRUCTURE.md             # This file
└── .gitignore                       # Git ignore rules

```

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client

## Key Files

### Backend

#### server.js
Main server file containing:
- Express app setup
- Middleware configuration
- API routes
- Webhook handling
- Database connection

#### models/Interaction.js
Mongoose schema defining:
- Interaction data structure
- Validation rules
- Indexes for performance

### Frontend

#### src/App.jsx
Root component with:
- Main layout
- Header
- Dashboard container

#### src/components/Dashboard.jsx
Core functionality:
- API integration
- State management
- Data fetching
- Health checks
- Auto-refresh

#### src/components/Stats.jsx
Statistics display:
- Total interactions
- Comments count
- Reactions count
- 24-hour activity

#### src/components/InteractionsList.jsx
Interactions table:
- Data display
- Time formatting
- Type badges
- Empty states

## Data Flow

```
Instagram → Webhook → Backend → MongoDB
                            ↓
                    Frontend Dashboard
```

1. Instagram sends webhook to `/webhook`
2. Backend processes and stores in MongoDB
3. Frontend fetches data from `/api/interactions`
4. Dashboard displays interactions in real-time

## API Endpoints

### GET /health
Returns server and database status.

### GET /api/interactions
Returns list of interactions (limited to 100 most recent).

### GET /api/stats
Returns aggregated statistics.

### POST /webhook
Receives Instagram webhook data.

### GET /webhook
Webhook verification endpoint.

## Database Schema

```javascript
{
  type: String,           // "comment" or "reaction"
  message: String,        // Interaction content
  user: String,           // Username or ID
  timestamp: Date,        // When it occurred
  postId: String,         // Instagram post ID
  reactionType: String,   // Type of reaction
  metadata: Object,       // Additional data
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/axtronet-instagram
PORT=5000
FRONTEND_URL=http://localhost:5173
INSTAGRAM_WEBHOOK_SECRET=your_secret_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Development Workflow

1. Start MongoDB
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm run dev`
4. Open browser: `http://localhost:5173`
5. Test webhooks using curl/Postman
6. View dashboard for updates

## Build & Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Frontend build
cd frontend && npm run build

# Backend (requires PM2 or similar)
cd backend && npm start
```

## Security Considerations

- Environment variables for sensitive data
- CORS configuration for allowed origins
- Webhook secret verification
- Input validation
- MongoDB connection security

## Performance Optimizations

- MongoDB indexes on commonly queried fields
- Limit on interaction retrieval (100)
- Auto-refresh every 30 seconds
- Efficient React rendering
- Cached responses

## Future Enhancements

- WebSocket for real-time updates
- User authentication
- Advanced filtering/search
- Data export functionality
- Analytics charts
- Multiple account support
- Automated responses

