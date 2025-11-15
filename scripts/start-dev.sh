#!/bin/bash

# ==============================================================================
# AllmightyAPI - Development Environment Startup Script
# ==============================================================================
# This script starts the development environment with Neon Local and your app.
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}  AllmightyAPI - Dev Startup${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo -e "${RED}❌ Error: .env.development not found!${NC}"
    echo -e "${YELLOW}Please create .env.development with your Neon credentials.${NC}"
    echo ""
    echo "Required variables:"
    echo "  - NEON_API_KEY"
    echo "  - NEON_PROJECT_ID"
    echo "  - PARENT_BRANCH_ID"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again.${NC}"
    exit 1
fi

# Ask user if they want to run in detached mode
echo -e "${BLUE}How do you want to start the containers?${NC}"
echo "  1) Detached mode (background) - Recommended for daily use"
echo "  2) Attached mode (with logs) - Good for debugging"
echo ""
read -p "Enter your choice (1 or 2) [default: 1]: " choice
choice=${choice:-1}

echo ""
echo -e "${GREEN}🚀 Starting development environment...${NC}"
echo ""

# Stop existing containers if running
if docker ps | grep -q "allmightyapi"; then
    echo -e "${YELLOW}⚠️  Stopping existing containers...${NC}"
    docker compose -f docker-compose.dev.yml down
    echo ""
fi

# Start containers based on user choice
if [ "$choice" = "2" ]; then
    echo -e "${CYAN}Starting in attached mode (press Ctrl+C to stop)...${NC}"
    echo ""
    docker compose -f docker-compose.dev.yml up --build
else
    echo -e "${CYAN}Starting in detached mode...${NC}"
    echo ""
    docker compose -f docker-compose.dev.yml up --build -d
    
    # Wait a moment for containers to start
    sleep 3
    
    # Check container status
    echo ""
    echo -e "${GREEN}✅ Containers started successfully!${NC}"
    echo ""
    
    # Display running containers
    echo -e "${CYAN}Running containers:${NC}"
    docker ps --filter "name=allmightyapi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ Development environment is ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}🌐 Application:${NC}    http://localhost:8000"
    echo -e "${CYAN}🗄️  Database:${NC}       postgres://neon:npg@localhost:5432/neondb"
    echo -e "${CYAN}🌿 Neon Branch:${NC}    Ephemeral (auto-created)"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "  pnpm docker:dev:logs     - View logs"
    echo "  pnpm docker:dev:restart  - Restart containers"
    echo "  pnpm docker:dev:down     - Stop containers"
    echo ""
    echo -e "${CYAN}📋 View logs:${NC}"
    echo "  docker compose -f docker-compose.dev.yml logs -f"
    echo ""
fi
