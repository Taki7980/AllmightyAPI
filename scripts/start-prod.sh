#!/bin/bash

# ==============================================================================
# AllmightyAPI - Production Environment Startup Script
# ==============================================================================
# This script starts the production environment with Neon Cloud connection.
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
echo -e "${CYAN}  AllmightyAPI - Prod Startup${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production not found!${NC}"
    echo -e "${YELLOW}Please create .env.production with your Neon Cloud credentials.${NC}"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (Neon Cloud connection string)"
    echo "  - NODE_ENV=production"
    echo "  - PORT=8000"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker and try again.${NC}"
    exit 1
fi

# Safety check - confirm production deployment
echo -e "${YELLOW}⚠️  WARNING: You are about to start the PRODUCTION environment!${NC}"
echo ""
echo "This will:"
echo "  - Connect to Neon Cloud production database"
echo "  - Run the application in production mode"
echo "  - Expose the application on port 80"
echo ""
read -p "Are you sure you want to continue? (yes/no) [default: no]: " confirm
confirm=${confirm:-no}

if [ "$confirm" != "yes" ]; then
    echo ""
    echo -e "${YELLOW}⛔ Production startup cancelled.${NC}"
    exit 0
fi

# Ask user if they want to run in detached mode
echo ""
echo -e "${BLUE}How do you want to start the container?${NC}"
echo "  1) Detached mode (background) - Recommended for production"
echo "  2) Attached mode (with logs) - Good for initial deployment"
echo ""
read -p "Enter your choice (1 or 2) [default: 1]: " choice
choice=${choice:-1}

echo ""
echo -e "${GREEN}🚀 Starting production environment...${NC}"
echo ""

# Stop existing containers if running
if docker ps | grep -q "allmightyapi-prod"; then
    echo -e "${YELLOW}⚠️  Stopping existing production container...${NC}"
    docker compose -f docker-compose.prod.yml down
    echo ""
fi

# Start containers based on user choice
if [ "$choice" = "2" ]; then
    echo -e "${CYAN}Starting in attached mode (press Ctrl+C to stop)...${NC}"
    echo ""
    docker compose -f docker-compose.prod.yml up --build
else
    echo -e "${CYAN}Starting in detached mode...${NC}"
    echo ""
    docker compose -f docker-compose.prod.yml up --build -d
    
    # Wait a moment for container to start
    sleep 3
    
    # Check container status
    echo ""
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    echo ""
    
    # Display running container
    echo -e "${CYAN}Running container:${NC}"
    docker ps --filter "name=allmightyapi-prod" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ Production environment is ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}🌐 Application:${NC}    http://localhost (or your domain)"
    echo -e "${CYAN}🗄️  Database:${NC}       Neon Cloud (production)"
    echo -e "${CYAN}🔒 Environment:${NC}    Production mode"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "  pnpm docker:prod:logs    - View logs"
    echo "  pnpm docker:prod:restart - Restart container"
    echo "  pnpm docker:prod:down    - Stop container"
    echo ""
    echo -e "${CYAN}📋 View logs:${NC}"
    echo "  docker compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo -e "${YELLOW}⚠️  Remember to:${NC}"
    echo "  - Set up a reverse proxy (Nginx, Traefik) for SSL/TLS"
    echo "  - Configure monitoring and alerting"
    echo "  - Set up log aggregation"
    echo "  - Configure backups for your Neon database"
    echo ""
fi
