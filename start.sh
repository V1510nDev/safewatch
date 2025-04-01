#!/bin/bash

# Start script for SafeWatch-Simple
# This script starts both the backend and frontend servers

echo "Starting SafeWatch-Simple..."

# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Detected Windows environment"
    echo "Please run these commands in separate Command Prompt windows:"
    echo ""
    echo "For backend:"
    echo "cd backend"
    echo "npm install"
    echo "node server.js"
    echo ""
    echo "For frontend:"
    echo "cd frontend"
    echo "npm install"
    echo "npm run dev"
    exit 0
fi

# For Linux/Mac
echo "Starting backend server..."
cd backend
npm install &
wait
node server.js &
BACKEND_PID=$!

echo "Starting frontend server..."
cd ../frontend
npm install &
wait
npm run dev &
FRONTEND_PID=$!

echo "SafeWatch is running!"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle shutdown
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

trap cleanup SIGINT

# Keep script running
wait
