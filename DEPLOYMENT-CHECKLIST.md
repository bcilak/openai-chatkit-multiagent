# ✅ Production Deployment Checklist
## chatbot.altikodtech.com.tr

---

## 📋 Ön Hazırlık

### Sunucu Tarafı
- [ ] SSH erişimi test edildi
- [ ] Node.js 20.x kurulu
- [ ] PM2 global olarak kurulu (`npm i -g pm2`)
- [ ] Git kurulu (opsiyonel)
- [ ] Nginx/Apache çalışıyor
- [ ] Virtualmin paneline erişim var

### Domain & DNS
- [ ] chatbot.altikodtech.com.tr domain'i satın alındı
- [ ] DNS A kaydı sunucu IP'sine yönlendiriliyor
- [ ] DNS propagation tamamlandı (`nslookup chatbot.altikodtech.com.tr`)

### Dosyalar
- [ ] Tüm proje dosyaları hazır
- [ ] `.env.production.example` dosyası mevcut
- [ ] `deploy-virtualmin.sh` executable yapıldı
- [ ] `backup-chatbot.sh` executable yapıldı

---

## 🚀 Deployment Adımları

### 1. Dosya Yükleme
- [ ] Proje dosyaları `/home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html/` konumuna yüklendi
- [ ] Dosya izinleri doğru (`chown -R altikodtech:altikodtech`)

### 2. Environment Configuration
- [ ] `.env.local` dosyası oluşturuldu
- [ ] `DASHBOARD_PASSWORD` güçlü bir şifre ile değiştirildi
- [ ] `ENCRYPTION_KEY` random 64-char hex ile değiştirildi
- [ ] `NEXT_PUBLIC_URL=https://chatbot.altikodtech.com.tr` ayarlandı
- [ ] `NODE_ENV=production` ayarlandı

### 3. Dependencies & Build
- [ ] `npm install` başarıyla tamamlandı
- [ ] `npm run build` başarıyla tamamlandı
- [ ] Build hataları yok
- [ ] `/data/` klasörü oluşturuldu

### 4. PM2 Setup
- [ ] PM2 ile uygulama başlatıldı (`pm2 start npm --name chatbot-dashboard -- start`)
- [ ] PM2 status "online" gösteriyor
- [ ] PM2 startup ayarlandı (`pm2 startup`)
- [ ] PM2 save yapıldı (`pm2 save`)
- [ ] Cron restart ayarlandı (ecosystem.config.js)

### 5. Web Server (Nginx/Apache)
- [ ] Reverse proxy yapılandırması eklendi
- [ ] Port 3000'e proxy ayarlandı
- [ ] Configuration test edildi (`nginx -t`)
- [ ] Web server restart edildi
- [ ] HTTP (80) çalışıyor

### 6. SSL Certificate
- [ ] Let's Encrypt sertifikası alındı
- [ ] HTTPS (443) çalışıyor
- [ ] HTTP → HTTPS redirect aktif
- [ ] SSL test başarılı (https://www.ssllabs.com/ssltest/)
- [ ] Auto-renewal ayarlandı

---

## ✅ Test & Verification

### Health Checks
- [ ] `curl http://localhost:3000/api/health` → 200 OK
- [ ] `curl https://chatbot.altikodtech.com.tr/api/health` → 200 OK
- [ ] JSON response doğru:
  ```json
  {
    "status": "ok",
    "database": "sqlite",
    "encrypted": true
  }
  ```

### Dashboard Access
- [ ] `https://chatbot.altikodtech.com.tr/dashboard` açılıyor
- [ ] Login sayfası görünüyor
- [ ] Şifre ile giriş başarılı
- [ ] Dashboard UI düzgün yükleniyor
- [ ] API Configuration bölümü çalışıyor

### Database
- [ ] `/data/chatkit.db` dosyası oluşturuldu
- [ ] Database dosyası permission 600
- [ ] Tablolar oluşturuldu (config, bots)
- [ ] SQLite WAL mode aktif

### Bot Creation Test
- [ ] Test bot oluşturuldu
- [ ] Bot listede görünüyor
- [ ] Embed kodu kopyalanabiliyor
- [ ] API key şifreli olarak kaydedildi
- [ ] Bot silinip tekrar eklenebiliyor

---

## 🔒 Security Checklist

### Server Security
- [ ] Firewall aktif (UFW/iptables)
- [ ] Sadece 22, 80, 443 portları açık
- [ ] SSH key-based authentication (şifre disabled)
- [ ] Fail2ban kurulu ve aktif
- [ ] Root login disabled

### Application Security
- [ ] `.env.local` dosyası 600 permission
- [ ] Database dosyası 600 permission
- [ ] DASHBOARD_PASSWORD minimum 16 karakter
- [ ] ENCRYPTION_KEY random generated
- [ ] Rate limiting aktif
- [ ] CORS headers doğru yapılandırılmış

### SSL/TLS
- [ ] TLS 1.2+ aktif
- [ ] Modern cipher suites kullanılıyor
- [ ] HSTS header aktif
- [ ] Security headers ayarlandı

---

## 💾 Backup & Monitoring

### Automated Backups
- [ ] Backup script test edildi (`./backup-chatbot.sh`)
- [ ] Backup directory oluşturuldu (`/home/altikodtech/backups/chatbot/`)
- [ ] Crontab ayarlandı (günlük 03:00)
- [ ] İlk backup başarılı
- [ ] Retention policy aktif (30 gün)

### Monitoring
- [ ] PM2 monitoring aktif (`pm2 monit`)
- [ ] Log rotation ayarlandı
- [ ] Error logs kontrol edildi
- [ ] Disk space monitoring
- [ ] Uptime monitoring (opsiyonel: UptimeRobot)

### Logs
- [ ] Application logs okunabilir
- [ ] Nginx access logs çalışıyor
- [ ] Nginx error logs çalışıyor
- [ ] Log dosyaları düzenli temizleniyor

---

## 📱 Usage Preparation

### Dashboard Setup
- [ ] Global API key eklendi (opsiyonel)
- [ ] Test bot oluşturuldu
- [ ] Embed kodu test edildi
- [ ] Bot düzenleme/silme test edildi

### Documentation
- [ ] Müşterilere embed kodu template hazırlandı
- [ ] Dashboard kullanım dokümantasyonu hazır
- [ ] Troubleshooting guide hazır

---

## 🔄 Post-Deployment

### Immediate Actions (İlk 24 Saat)
- [ ] Tüm endpoint'ler test edildi
- [ ] Error logs kontrol edildi
- [ ] Performance test yapıldı
- [ ] İlk backup başarıyla tamamlandı
- [ ] SSL certificate geçerli

### First Week
- [ ] Günlük log kontrolü
- [ ] Uptime monitoring
- [ ] Backup verification
- [ ] İlk müşteri bot'u deploy edildi
- [ ] Customer feedback alındı

### Ongoing Maintenance
- [ ] Haftalık database backup kontrolü
- [ ] Aylık security update
- [ ] PM2 logs review
- [ ] Disk space monitoring
- [ ] SSL certificate renewal (auto)

---

## 🆘 Emergency Contacts & Commands

### Quick Fix Commands
```bash
# Restart application
pm2 restart chatbot-dashboard

# Check logs
pm2 logs chatbot-dashboard --lines 100

# Database backup
./backup-chatbot.sh

# Restore from backup
tar -xzf /path/to/backup.tar.gz
cp backup/chatkit.db data/
pm2 restart chatbot-dashboard

# Check system resources
free -h
df -h
top -bn1 | head -20

# Clear cache
pm2 flush
npm cache clean --force
```

### Rollback Plan
```bash
# Stop current version
pm2 stop chatbot-dashboard

# Restore from backup
cd /home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html
tar -xzf /backups/chatbot/chatbot_backup_XXXXXXXX.tar.gz
cp chatbot_backup_XXXXXXXX/chatkit.db data/
cp chatbot_backup_XXXXXXXX/.env.local .

# Restart
pm2 restart chatbot-dashboard
```

---

## ✅ Final Sign-Off

### Deployment Team
- [ ] Developer: _________________ Date: _______
- [ ] DevOps: __________________ Date: _______
- [ ] QA: _____________________ Date: _______

### Production Ready
- [ ] All checklist items completed
- [ ] No critical issues
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring active

---

## 🎉 Deployment Complete!

**Production URL:** https://chatbot.altikodtech.com.tr/dashboard

**Status:** 🟢 LIVE

**Deployed:** _______________ (Date/Time)

**Next Review:** _______________ (Date)

---

**Notes:**
_____________________________________________________
_____________________________________________________
_____________________________________________________
