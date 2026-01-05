#!/bin/bash

################################################################################
# OpenAI ChatKit Multi-Agent Dashboard
# Virtualmin Production Deployment Script
# Domain: chatbot.altikodtech.com.tr
################################################################################

set -e  # Exit on error

echo "=========================================="
echo "🚀 ChatKit Dashboard Deployment"
echo "=========================================="
echo ""

# Configuration
DOMAIN="chatbot.altikodtech.com.tr"
APP_DIR="/home/altikodtech/domains/$DOMAIN/public_html"
NODE_VERSION="20"
PM2_APP_NAME="chatbot-dashboard"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_step() {
    echo ""
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running as correct user
print_step "Checking user permissions..."
if [ "$(whoami)" != "altikodtech" ] && [ "$(whoami)" != "root" ]; then
    print_error "Bu script altikodtech kullanıcısı veya root ile çalıştırılmalı"
    exit 1
fi
print_success "User check passed"

# Check Node.js version
print_step "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js bulunamadı! Lütfen önce Node.js $NODE_VERSION yükleyin"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt "$NODE_VERSION" ]; then
    print_warning "Node.js $NODE_VERSION veya üzeri önerilir (Mevcut: $(node -v))"
else
    print_success "Node.js version: $(node -v)"
fi

# Check PM2
print_step "Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 bulunamadı, yükleniyor..."
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 found: $(pm2 -v)"
fi

# Create application directory
print_step "Creating application directory..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"
print_success "Directory: $APP_DIR"

# Install dependencies
print_step "Installing dependencies..."
if [ -f "package.json" ]; then
    npm install --production
    print_success "Dependencies installed"
else
    print_error "package.json bulunamadı! Önce proje dosyalarını yükleyin"
    exit 1
fi

# Check .env file
print_step "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local dosyası bulunamadı!"
    echo ""
    echo "Lütfen .env.local dosyasını oluşturun:"
    echo "cp .env.production.example .env.local"
    echo "nano .env.local"
    echo ""
    echo "Gerekli değişkenler:"
    echo "  - DASHBOARD_PASSWORD (Dashboard şifresi)"
    echo "  - ENCRYPTION_KEY (API key şifreleme anahtarı)"
    echo ""
    read -p "Devam etmek için .env.local oluşturun ve Enter'a basın..."
fi

# Validate .env
if grep -q "your-secure-password-here" .env.local 2>/dev/null; then
    print_error "DASHBOARD_PASSWORD hala varsayılan değerde! Lütfen değiştirin."
    exit 1
fi

if grep -q "change-this-to-a-random-secure-key" .env.local 2>/dev/null; then
    print_error "ENCRYPTION_KEY hala varsayılan değerde! Lütfen değiştirin."
    exit 1
fi

print_success "Environment configuration OK"

# Build application
print_step "Building Next.js application..."
npm run build
print_success "Build completed"

# Create data directory
print_step "Creating data directory..."
mkdir -p data
chmod 700 data
print_success "Data directory created"

# Setup PM2
print_step "Configuring PM2..."
pm2 delete $PM2_APP_NAME 2>/dev/null || true
pm2 start npm --name "$PM2_APP_NAME" -- start
pm2 save
print_success "PM2 configured"

# Setup PM2 startup
print_step "Setting up PM2 startup..."
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) | tail -n 1 | bash || print_warning "PM2 startup may need manual configuration"
print_success "PM2 startup configured"

# Set correct permissions
print_step "Setting file permissions..."
chown -R $(whoami):$(whoami) "$APP_DIR"
chmod 600 data/*.db 2>/dev/null || true
print_success "Permissions set"

# Check application status
print_step "Checking application status..."
sleep 3
if pm2 status | grep -q "$PM2_APP_NAME.*online"; then
    print_success "Application is running!"
    echo ""
    echo "PM2 Status:"
    pm2 status
else
    print_error "Application failed to start. Check logs:"
    echo "pm2 logs $PM2_APP_NAME"
    exit 1
fi

# Display next steps
echo ""
echo "=========================================="
echo "✅ Deployment Başarılı!"
echo "=========================================="
echo ""
echo "📋 Sonraki Adımlar:"
echo ""
echo "1. Nginx/Apache yapılandırması:"
echo "   - Reverse proxy ayarla (port 3000)"
echo "   - SSL sertifikası ekle (Let's Encrypt)"
echo ""
echo "2. Dashboard'a erişim:"
echo "   https://$DOMAIN/dashboard"
echo ""
echo "3. Faydalı komutlar:"
echo "   - Logs: pm2 logs $PM2_APP_NAME"
echo "   - Restart: pm2 restart $PM2_APP_NAME"
echo "   - Status: pm2 status"
echo "   - Database: ls -lh $APP_DIR/data/"
echo ""
echo "4. Yedekleme:"
echo "   - Database: $APP_DIR/data/chatkit.db"
echo "   - Env: $APP_DIR/.env.local"
echo ""
echo "=========================================="
