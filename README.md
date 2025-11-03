# Instagram Webhook Dashboard

A modern, full-stack application for monitoring and managing Instagram webhook interactions. Built with Node.js, Express, MongoDB, React, and TailwindCSS.

## 🚀 Features

- **Real-time Dashboard**: Monitor Instagram interactions (comments and reactions) in real-time
- **Health Monitoring**: Check server and database connection status
- **Statistics**: View total interactions, comments, reactions, and activity in the last 24 hours
- **Responsive Design**: Beautiful, modern UI that works on desktop and mobile devices
- **RESTful API**: Well-structured endpoints for webhook processing and data retrieval

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (locally installed or MongoDB Atlas account)
- **npm** or **yarn**
- **Git**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Axtronet-automatic-instagram-cm.git
cd Axtronet-automatic-instagram-cm
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/axtronet-instagram

# Server Configuration
PORT=5000

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Instagram Webhook Secret (optional)
INSTAGRAM_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Configure Frontend Environment

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Start MongoDB

If using local MongoDB:

```bash
# On macOS/Linux
mongod

# On Windows
# Start MongoDB service from Windows Services
```

Or use MongoDB Atlas (cloud) by updating the `MONGODB_URI` in your `.env` file.

### Start the Backend Server

```bash
cd backend
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns the status of the API and MongoDB connection.

### Get All Interactions
```
GET /api/interactions
```
Returns the most recent 100 interactions.

### Get Statistics
```
GET /api/stats
```
Returns aggregated statistics (total, comments, reactions, last 24 hours).

### Webhook Endpoint
```
POST /webhook
```
Receives and processes Instagram webhook data.

### Webhook Verification
```
GET /webhook
```
Verifies the webhook during Instagram setup.

## 🧪 Testing the Webhook

You can test the webhook endpoint using curl or Postman:

### Basic Webhook Test
```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {"id": "test_user_123"},
        "message": {"text": "This is a test comment"}
      }]
    }]
  }'
```

### Test Comment
```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "changes": [{
        "field": "comments",
        "value": {
          "text": "Great post!",
          "from": {"username": "test_user"},
          "media": {"id": "post_123"},
          "created_time": 1699123456
        }
      }]
    }]
  }'
```

### Test Reaction
```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "changes": [{
        "field": "reactions",
        "value": {
          "reaction_type": "like",
          "user": {"username": "test_user"},
          "media": {"id": "post_123"},
          "created_time": 1699123456
        }
      }]
    }]
  }'
```

## 🏗️ Project Structure

```
Axtronet-automatic-instagram-cm/
├── backend/
│   ├── models/
│   │   └── Interaction.js      # Mongoose model for interactions
│   ├── server.js                # Express server and routes
│   ├── package.json             # Backend dependencies
│   └── .env                     # Environment variables (not in git)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Main dashboard component
│   │   │   ├── Stats.jsx        # Statistics cards
│   │   │   └── InteractionsList.jsx  # Interactions table
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
└── README.md                    # This file
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Webhook Secret**: Always use a strong secret for production
3. **CORS**: Configure allowed origins appropriately for production
4. **Rate Limiting**: Consider adding rate limiting for production use
5. **Input Validation**: Add more robust validation for production webhooks

## 📊 MongoDB Schema

### Interaction Collection

```javascript
{
  type: String,           // "comment" or "reaction"
  message: String,        // The interaction content
  user: String,           // Username or user ID
  timestamp: Date,        // When the interaction occurred
  postId: String,         // Instagram post ID
  reactionType: String,   // Type of reaction (if applicable)
  metadata: Object,       // Additional data
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## 🚢 Deployment

### Backend Deployment

1. Deploy to services like:
   - Heroku
   - Railway
   - DigitalOcean App Platform
   - AWS Elastic Beanstalk

2. Set environment variables in your hosting platform

3. Ensure MongoDB is accessible (use MongoDB Atlas for cloud hosting)

### Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

3. Update the `VITE_API_URL` environment variable

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - CORS
  - dotenv

- **Frontend**:
  - React
  - TailwindCSS
  - Axios
  - Vite

## 📞 Support

If you have any questions or issues, please open an issue in the GitHub repository.

## 🎯 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time updates using WebSockets
- [ ] Advanced filtering and search
- [ ] Export data to CSV/JSON
- [ ] Analytics dashboard with charts
- [ ] Email notifications
- [ ] Multiple Instagram account support
- [ ] Automated response system
