#!/bin/bash

# WorkZen HRMS Development Script
# Starts both frontend and mock backend in parallel

echo "🚀 Starting WorkZen HRMS..."
echo ""

# Check if mock/db.json exists
if [ ! -f "mock/db.json" ]; then
    echo "📦 Generating mock database..."
    npm run seed:mock
fi

echo "Starting mock backend on port 4000..."
echo "Starting frontend on port 8080..."
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start both services
npm run start:mock & npm run dev

# Trap Ctrl+C to kill both processes
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
