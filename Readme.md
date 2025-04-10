# Project Setup Guide

This project consists of a Vite React.js frontend (client) and a Node.js/Express backend (server) with Prisma ORM. Follow these steps to set up and run the project locally.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- PostgreSQL (or your preferred database supported by Prisma)
- Git

## Project Structure

```
project-root/
├── client/      # Vite + React.js frontend
└── server/      # Node.js + Express + Prisma backend
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/rahulmuralitechnology/ihubE-Commerce.git
cd ihubE-Commerce
```

### 2. Backend (Server) Setup

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
.env
# Edit the .env file with your database credentials

# Set up Prisma
npx prisma generate
npx prisma migrate dev

# Start the development server
npm run dev
```

The backend server should now be running at `http://localhost:5000` (or the port specified in your .env file).

### 3. Frontend (Client) Setup

```bash
cd ../client

# Install dependencies
npm install

# Set up environment variables
.env
# Edit the .env file if you need to change the API endpoint

# Start the development server
npm run dev
```

The frontend should now be running at `http://localhost:3000` (or the port specified in your vite config).

## Available Scripts

### Client (Vite + React)

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Server (Node + Express + Prisma)

- `npm start`: Start production server
- `npm run migrate`: Run Prisma migrations
- `npm run generate`: Generate Prisma client

## Environment Variables

### Server (.env)

```
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
JWT_SECRET=your_jwt_secret_here
```

## Database Setup

1. Ensure you have PostgreSQL running locally
2. Update the `DATABASE_URL` in server/.env with your credentials
3. Run migrations:
   ```bash
   cd server
   npx prisma migrate dev
   ```

## Troubleshooting

- If you encounter Prisma errors, try:
  ```bash
  npx prisma generate
  npx prisma migrate reset
  ```
- If ports are in use, change the PORT in the respective .env files
- Ensure all dependencies are installed in both client and server folders

## Deployment

For production deployment, you'll need to:
1. Build the client (`npm run build` in client folder)
2. Set up production environment variables
3. Consider using PM2 or similar process manager for the Node server

## Additional Documentation

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/learn)
- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)