# Development Setup Guide

This guide explains how to automatically start both your frontend and backend servers when developing.

## Quick Start

### Option 1: Using npm scripts (Recommended)

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start both servers in development mode:**
   ```bash
   npm run dev:full
   ```

3. **Start both servers in production mode:**
   ```bash
   npm run start:full
   ```

### Option 2: Using the startup script

1. **Make the script executable:**
   ```bash
   chmod +x start-dev.js
   ```

2. **Run the startup script:**
   ```bash
   node start-dev.js
   ```

## Available Scripts

### Root package.json scripts:
- `npm run dev:full` - Starts both frontend and backend in development mode
- `npm run start:full` - Starts both frontend and backend in production mode
- `npm run dev:frontend` - Starts only the frontend in development mode
- `npm run dev:backend` - Starts only the backend in development mode
- `npm run install:all` - Installs dependencies for both frontend and backend

### Individual server scripts:
- `npm run dev` - Starts only the frontend (original behavior)
- `cd backend && npm run dev` - Starts only the backend

## Server URLs

When both servers are running:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

## Stopping the Servers

- **For npm scripts:** Press `Ctrl+C` in the terminal
- **For the startup script:** Press `Ctrl+C` in the terminal (automatically stops both servers)

## Troubleshooting

1. **Port conflicts:** Make sure ports 5173 (frontend) and 3001 (backend) are available
2. **Dependencies:** Run `npm run install:all` to ensure all dependencies are installed
3. **Backend not starting:** Check if you have the required database setup (see backend README)

## Development Workflow

1. Start both servers: `npm run dev:full`
2. Make changes to your code
3. Both servers will automatically reload with your changes
4. Stop servers with `Ctrl+C` when done 