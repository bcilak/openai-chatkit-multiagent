#!/bin/bash

################################################################################
# OpenAI ChatKit Dashboard - Automated Backup Script
# chatbot.altikodtech.com.tr
################################################################################

# Configuration
APP_DIR="/home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html"
BACKUP_DIR="/home/altikodtech/backups/chatbot"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="chatbot_backup_$DATE"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "💾 ChatKit Dashboard Backup"
echo "=========================================="
echo "Date: $(date)"
echo "Backup: $BACKUP_NAME"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create temporary backup folder
TEMP_BACKUP="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$TEMP_BACKUP"

# Backup SQLite database
echo -n "→ Backing up database... "
if [ -f "$APP_DIR/data/chatkit.db" ]; then
    cp "$APP_DIR/data/chatkit.db" "$TEMP_BACKUP/chatkit.db"
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Database not found${NC}"
    exit 1
fi

# Backup environment file
echo -n "→ Backing up environment... "
if [ -f "$APP_DIR/.env.local" ]; then
    cp "$APP_DIR/.env.local" "$TEMP_BACKUP/.env.local"
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
fi

# Backup PM2 config
echo -n "→ Backing up PM2 config... "
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    cp "$APP_DIR/ecosystem.config.js" "$TEMP_BACKUP/ecosystem.config.js"
    echo -e "${GREEN}✓${NC}"
fi

# Create backup info file
cat > "$TEMP_BACKUP/backup_info.txt" << EOF
ChatKit Dashboard Backup
========================
Date: $(date)
Hostname: $(hostname)
User: $(whoami)
Database Size: $(du -h "$APP_DIR/data/chatkit.db" | cut -f1)
App Directory: $APP_DIR

Files:
------
$(ls -lh "$TEMP_BACKUP")
EOF

# Compress backup
echo -n "→ Compressing backup... "
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
echo -e "${GREEN}✓${NC}"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
echo -e "  Size: ${GREEN}$BACKUP_SIZE${NC}"

# Delete old backups
echo -n "→ Cleaning old backups (>$RETENTION_DAYS days)... "
DELETED=$(find "$BACKUP_DIR" -name "chatbot_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✓ ($DELETED files)${NC}"

# List recent backups
echo ""
echo "Recent Backups:"
echo "---------------"
ls -lth "$BACKUP_DIR"/chatbot_backup_*.tar.gz | head -5

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Backup Complete!${NC}"
echo "=========================================="
echo "Location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo ""

# Optional: Upload to remote backup (uncomment if needed)
# echo "→ Uploading to remote backup..."
# rsync -avz "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" user@backup-server:/backups/chatbot/

exit 0
