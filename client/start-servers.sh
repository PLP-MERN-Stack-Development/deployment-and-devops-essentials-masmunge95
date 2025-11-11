#!/bin/bash
# start-servers.sh

echo "Starting backend..."
cd server
MONGO_URI=$MONGO_URI ALLOWED_ORIGINS=$ALLOWED_ORIGINS nohup npm run dev > server.log 2>&1 &
cd ..

echo "Starting frontend..."
cd client
nohup npm run dev > client.log 2>&1 &
cd ..

echo "Servers started in background"
