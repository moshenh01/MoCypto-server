# MoveoCrypto Backend

A Node.js/Express backend server for a Crypto Investor Dashboard application. This server provides RESTful APIs for authentication, user management, crypto market data, news, AI insights, and meme content.

## Features

- 🔐 **User Authentication** - JWT-based authentication system
- 📊 **Dashboard API** - Aggregated crypto market data, news, prices, and insights
- 💰 **Price Tracking** - Real-time cryptocurrency price information
- 📰 **Market News** - Crypto market news aggregation
- 🤖 **AI Insights** - Personalized investment insights based on user preferences
- 😄 **Meme Content** - Random crypto memes for entertainment
- 👤 **User Profiles** - User profile management and preferences
- 💬 **Feedback System** - User feedback and voting system
- 🎯 **Onboarding** - User onboarding flow

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Either:
  - MongoDB Atlas (cloud) - [Sign up for free](https://www.mongodb.com/cloud/atlas)
  - Local MongoDB installation - [Download MongoDB](https://www.mongodb.com/try/download/community)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory of the project:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/moveocrypto
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moveocrypto

   # JWT Secret Key (use a strong random string in production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Server Port (optional, defaults to 5000)
   PORT=5000

   # Frontend URL (optional, for CORS configuration)
   FRONTEND_URL=http://localhost:3000
   APP_URL=http://localhost:3000

   # External API Keys (optional, but recommended for full functionality)
   # CryptoPanic API Key - for crypto news (get free at https://cryptopanic.com/developers/api/)
   CRYPTOPANIC_API_KEY=your-cryptopanic-api-key

   # OpenRouter API Key - for AI insights (get free at https://openrouter.ai/)
   OPENROUTER_API_KEY=your-openrouter-api-key
   ```

   **Important:** Replace the placeholder values with your actual configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token signing (use a strong secret in production)
   - `CRYPTOPANIC_API_KEY`: (Optional) API key for crypto news. Without it, No news.
   - `OPENROUTER_API_KEY`: (Optional) API key for AI insights. Without it, fallback insights will be used.

## Running Locally

### Development Mode (with auto-reload)

```bash
npm run dev
```

This will start the server using `nodemon`, which automatically restarts the server when you make changes to the code.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Verify Installation

Once the server is running, you should see:
```
MongoDB connected
Server running on port 5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Onboarding
- `POST /api/onboarding` - Complete user onboarding

### Dashboard
- `GET /api/dashboard` - Get dashboard data (protected)
  - Returns: news, prices, insights, memes, votes, preferences

### Profile
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)

### Feedback
- `POST /api/feedback` - Submit feedback/vote (protected)

### Static Files
- `GET /uploads/images/*` - Access uploaded meme images

## Project Structure

```
server/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── CachedNews.js        # News cache model
│   ├── CachedPrice.js       # Price cache model
│   ├── Feedback.js          # Feedback/vote model
│   └── User.js              # User model
├── routes/
│   ├── auth-route.js        # Authentication routes
│   ├── onboarding.js        # Onboarding routes
│   ├── profile.js           # Profile routes
│   ├── feedback.js          # Feedback routes
│   └── dashboard/
│       ├── dashboard.js     # Dashboard main route
│       └── services/
│           ├── insightService.js  # AI insights service
│           ├── memeService.js     # Meme service
│           ├── newsService.js     # News service
│           └── priceService.js    # Price service
├── public/
│   └── uploads/
│       └── images/          # Static meme images
├── utils/
│   └── cache.js             # Caching utilities
├── server.js                # Main server file
└── package.json             # Dependencies and scripts
```

## Technologies Used

- **Express.js** - Web framework for Node.js
- **MongoDB** - Database (via Mongoose ODM)
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for external API calls
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

## External APIs Used

This project integrates with the following external APIs to provide crypto market data:

### 1. CoinGecko API
- **Purpose**: Cryptocurrency price data
- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Usage**: Fetches real-time prices, 24h change, and market cap for cryptocurrencies
- **Rate Limit**: 30 requests per minute (free tier)
- **Caching**: Prices are cached for 10 minutes to optimize API usage
- **Documentation**: [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- **API Key Required**: No (free tier available)

### 2. CryptoPanic API
- **Purpose**: Cryptocurrency news aggregation
- **Endpoint**: `https://cryptopanic.com/api/developer/v2/posts/`
- **Usage**: Fetches hot crypto news articles
- **Caching**: News is cached for 1 hour
- **Documentation**: [CryptoPanic API Docs](https://cryptopanic.com/developers/api/)
- **API Key Required**: Yes (free tier available)
- **Get API Key**: [Sign up at CryptoPanic](https://cryptopanic.com/developers/api/)

### 3. OpenRouter API
- **Purpose**: AI-powered investment insights
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Usage**: Generates personalized crypto investment insights based on user preferences
- **Fallback**: If API key is not provided, generates static fallback insights
- **Documentation**: [OpenRouter API Docs](https://openrouter.ai/docs)
- **API Key Required**: Yes (free tier available)
- **Get API Key**: [Sign up at OpenRouter](https://openrouter.ai/)


## Development

### Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload

### Environment Variables

**Required Variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

**Optional Variables (for enhanced functionality):**
- `CRYPTOPANIC_API_KEY` - API key for crypto news 
- `OPENROUTER_API_KEY` - API key for AI insights (fallback insights will be used if not provided)
- `PORT` - Server port (defaults to 5000)
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `APP_URL` - Application URL for CORS configuration

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local installation)
- Verify your `MONGODB_URI` is correct
- Check network connectivity if using MongoDB Atlas

### Port Already in Use
- Change the `PORT` in your `.env` file
- Or stop the process using port 5000

### CORS Errors
- Make sure your frontend URL is included in the `FRONTEND_URL` or `APP_URL` environment variables
- The server allows `localhost` origins by default in development


## Author

Moshe Nahshon

