#!/bin/bash

# SwasthyaSetu System Startup Script
# This script helps start all components of the SwasthyaSetu healthcare system

echo "🏥 SwasthyaSetu Healthcare System Startup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to wait for service to start
wait_for_service() {
    local url=$1
    local service_name=$2
    local timeout=30
    local count=0
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to start...${NC}"
    
    while [ $count -lt $timeout ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within $timeout seconds${NC}"
    return 1
}

echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 16 or higher${NC}"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
elif command_exists python; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✅ $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python not found. Please install Python 3.8 or higher${NC}"
    exit 1
fi

# Check MongoDB
if command_exists mongod; then
    echo -e "${GREEN}✅ MongoDB found${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found. Please ensure MongoDB is installed and running${NC}"
fi

# Check pip
if command_exists pip3; then
    echo -e "${GREEN}✅ pip3 found${NC}"
elif command_exists pip; then
    echo -e "${GREEN}✅ pip found${NC}"
else
    echo -e "${RED}❌ pip not found. Please install pip${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Checking port availability...${NC}"

# Check required ports
check_port 3000
check_port 3001
check_port 5000
check_port 8000

echo ""
echo -e "${BLUE}📁 Setting up services...${NC}"

# Function to install dependencies
install_dependencies() {
    local dir=$1
    local package_manager=$2
    
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}📦 Installing dependencies in $dir...${NC}"
        cd "$dir"
        
        if [ "$package_manager" = "npm" ]; then
            if [ -f "package.json" ]; then
                npm install
            else
                echo -e "${RED}❌ package.json not found in $dir${NC}"
                return 1
            fi
        elif [ "$package_manager" = "pip" ]; then
            if [ -f "requirements.txt" ]; then
                pip3 install -r requirements.txt 2>/dev/null || pip install -r requirements.txt
            else
                echo -e "${YELLOW}⚠️  requirements.txt not found in $dir${NC}"
            fi
        fi
        
        cd - >/dev/null
    else
        echo -e "${RED}❌ Directory $dir not found${NC}"
        return 1
    fi
}

# Install dependencies for all services
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
install_dependencies "Login-RegistrationForm-MongoDB-main" "npm"
install_dependencies "frontend" "npm"
install_dependencies "ai/symptom-checker/frontend" "npm"
install_dependencies "ai/prescription-analyzer/frontend" "npm"

echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
install_dependencies "ai/symptom-checker" "pip"
install_dependencies "ai/prescription-analyzer/backend" "pip"

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"

# Create a function to start services in background
start_service() {
    local name=$1
    local command=$2
    local directory=$3
    local log_file="logs/${name}.log"
    
    mkdir -p logs
    
    echo -e "${YELLOW}🚀 Starting $name...${NC}"
    
    if [ -n "$directory" ]; then
        cd "$directory"
    fi
    
    # Start the service in background and redirect output to log file
    eval "$command" > "../$log_file" 2>&1 &
    local pid=$!
    
    # Store PID for later cleanup
    echo $pid > "logs/${name}.pid"
    
    if [ -n "$directory" ]; then
        cd - >/dev/null
    fi
    
    echo -e "${GREEN}✅ $name started (PID: $pid)${NC}"
    echo -e "${BLUE}📝 Logs: $log_file${NC}"
}

# Start MongoDB (if not already running)
if ! pgrep mongod > /dev/null; then
    echo -e "${YELLOW}🗄️  Starting MongoDB...${NC}"
    mongod --fork --logpath logs/mongodb.log --dbpath ./data/db 2>/dev/null || echo -e "${YELLOW}⚠️  Could not start MongoDB automatically. Please start it manually.${NC}"
fi

# Start Authentication Backend
start_service "auth-backend" "npm start" "Login-RegistrationForm-MongoDB-main"

# Wait a moment for auth backend to start
sleep 3

# Start Symptom Checker (includes its own frontend)
start_service "symptom-checker" "python3 run.py" "ai/symptom-checker"

# Start Prescription Analyzer Backend
start_service "prescription-analyzer" "python3 main.py" "ai/prescription-analyzer/backend"

# Wait for backends to start
sleep 5

# Start Main Frontend (on different port to avoid conflicts)
start_service "main-frontend" "BROWSER=none PORT=3001 npm start" "frontend"

echo ""
echo -e "${GREEN}🎉 All services are starting up!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "${YELLOW}⏳ Checking service health...${NC}"

# Wait for services to be ready
sleep 10

# Check service health
echo ""
echo -e "${BLUE}🔍 Health Check Results:${NC}"

# Check each service
curl -s http://localhost:3000/health && echo -e "${GREEN}✅ Auth Backend - Ready${NC}" || echo -e "${RED}❌ Auth Backend - Not responding${NC}"
curl -s http://localhost:5000/health && echo -e "${GREEN}✅ Symptom Checker - Ready${NC}" || echo -e "${RED}❌ Symptom Checker - Not responding${NC}"
curl -s http://localhost:8000/health && echo -e "${GREEN}✅ Prescription Analyzer - Ready${NC}" || echo -e "${RED}❌ Prescription Analyzer - Not responding${NC}"

echo ""
echo -e "${GREEN}🌐 Access Your Applications:${NC}"
echo -e "${BLUE}👥 Main Frontend:${NC}        http://localhost:3001"
echo -e "${BLUE}🔐 Auth Backend:${NC}         http://localhost:3000"
echo -e "${BLUE}🩺 Symptom Checker UI:${NC}   http://localhost:3000 (integrated)"
echo -e "${BLUE}💊 Prescription Analyzer:${NC} http://localhost:8000/docs"
echo -e "${BLUE}📊 API Documentation:${NC}    http://localhost:8000/docs"

echo ""
echo -e "${YELLOW}📋 Important Notes:${NC}"
echo "• Main application runs on port 3001 to avoid conflicts"
echo "• Symptom checker includes its own UI on port 3000"
echo "• All logs are stored in the 'logs/' directory"
echo "• Use Ctrl+C to stop this script and all services"

echo ""
echo -e "${GREEN}✨ SwasthyaSetu is now running!${NC}"
echo -e "${BLUE}📖 Check SYSTEM_OVERVIEW.md for detailed documentation${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    if [ -d "logs" ]; then
        for pidfile in logs/*.pid; do
            if [ -f "$pidfile" ]; then
                pid=$(cat "$pidfile")
                service_name=$(basename "$pidfile" .pid)
                
                if kill -0 "$pid" 2>/dev/null; then
                    echo -e "${YELLOW}🛑 Stopping $service_name (PID: $pid)...${NC}"
                    kill "$pid"
                fi
                
                rm -f "$pidfile"
            fi
        done
    fi
    
    echo -e "${GREEN}👋 All services stopped. Thank you for using SwasthyaSetu!${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
echo -e "${BLUE}🔄 System is running. Press Ctrl+C to stop all services.${NC}"
while true; do
    sleep 1
done