# Realtime Leaderboard Application

A real-time leaderboard application with user selection, point claiming, and dynamic ranking. This application demonstrates real-time data updates using Socket.IO, state management, and responsive UI design.

## Features

- User selection from a list of available users
- Random point claiming for selected users (1-10 points)
- Real-time leaderboard updates with rankings
- Time-windowed leaderboards (All-time, Daily, Weekly, Monthly)
- Point claim history tracking
- Animated themed backgrounds based on selected time window
- Responsive design with modern UI

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- Socket.IO for real-time updates

### Frontend
- React (Vite)
- Socket.IO client
- Custom CSS with theme support

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas connection string

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

Server runs on http://localhost:4000

### Frontend Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to the URL displayed in the terminal (usually http://localhost:5173)

## Application Usage

1. Add users through the form at the top of the application
2. Select a user from the dropdown menu
3. Click "Claim Points" to award random points to the selected user
4. View the updated leaderboard and claim history in real-time
5. Switch between different time windows (All, Daily, Weekly, Monthly) to see different rankings
   - Gold theme for All-time and Monthly views
   - Orange theme for Daily view
   - Purple theme for Weekly view

## API (brief)
- GET /api/users?page=&limit=  – users
- POST /api/users              – add user { name }
- POST /api/users/:id/claim    – random award 1..10, returns { awarded, user }
- GET /api/leaderboard?page=&limit=&window= – ranked users (dense ranking)
- GET /api/claims?userId=&page=&limit= – claim history

Socket event: `leaderboard:changed` – leaderboard refreshes automatically when received.

## Notes
- Ranks are dense (ties share rank, next rank increments by 1)
- Responsive UI with pagination controls
- Themed components based on selected time window
- Animated background effects

## License

MIT
