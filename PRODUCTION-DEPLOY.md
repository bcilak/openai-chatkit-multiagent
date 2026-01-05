# 🚀 Production Deployment Guide
## chatbot.altikodtech.com.tr - Virtualmin

---

## 📋 Ön Gereksinimler

### Sunucu Gereksinimleri
- **OS:** Ubuntu/Debian veya CentOS/RHEL
- **RAM:** Minimum 1GB (2GB+ önerilir)
- **Disk:** 10GB+ boş alan
- **Node.js:** 20.x veya üzeri
- **Domain:** chatbot.altikodtech.com.tr (DNS ayarları yapılmış)

### Virtualmin Ayarları
- Virtual Server oluşturulmuş olmalı
- SSH erişimi aktif
- Kullanıcı: `altikodtech`

---

## 🔧 Adım 1: Sunucuya Bağlan

```bash
ssh altikodtech@chatbot.altikodtech.com.tr
# veya
ssh altikodtech@SERVER_IP
```

---

## 📦 Adım 2: Node.js Kurulumu (Eğer yoksa)

### Ubuntu/Debian:
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js kur
sudo apt-get install -y nodejs

# Versiyonu kontrol et
node -v  # v20.x.x görmeli
npm -v
```

### CentOS/RHEL:
```bash
# NodeSource repository ekle
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js kur
sudo yum install -y nodejs

# Versiyonu kontrol et
node -v
npm -v
```

---

## 📂 Adım 3: Proje Dosyalarını Yükle

### Seçenek A: Git (Önerilir)
```bash
cd /home/altikodtech/domains/chatbot.altikodtech.com.tr/
git clone https://github.com/YOUR_USERNAME/chatkit-dashboard.git public_html
cd public_html
```

### Seçenek B: Manuel Upload (FTP/SFTP)
1. Tüm proje dosyalarını şu konuma yükle:
   ```
   /home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html/
   ```
2. Aşağıdaki dosyaların yüklendiğinden emin ol:
   - `package.json`
   - `src/` klasörü
   - `.env.production.example`
   - `ecosystem.config.js`
   - `deploy-virtualmin.sh`
   - `backup-chatbot.sh`
   - Tüm diğer dosyalar

---

## 🔐 Adım 4: Environment Variables Ayarla

```bash
cd /home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html

# Example dosyadan kopyala
cp .env.production.example .env.local

# Düzenle
nano .env.local
```

### Gerekli Değişkenler:

```bash
# 1. Dashboard şifresi oluştur (güçlü bir şifre)
DASHBOARD_PASSWORD=your-super-secure-password-here

# 2. Encryption key oluştur
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Çıktıyı kopyala ve yapıştır:
ENCRYPTION_KEY=paste-generated-key-here

# 3. OpenAI API Key (opsiyonel - dashboard'dan da eklenebilir)
OPENAI_API_KEY=sk-proj-your-key-here

# 4. Production domain
NEXT_PUBLIC_URL=https://chatbot.altikodtech.com.tr
```

**Önemli:** Dosyayı kaydet ve çık (Ctrl+O, Enter, Ctrl+X)

---

## 🚀 Adım 5: Deployment Script Çalıştır

```bash
# Script'i executable yap
chmod +x deploy-virtualmin.sh

# Deploy et
./deploy-virtualmin.sh
```

Script otomatik olarak:
- ✅ Bağımlılıkları yükler
- ✅ Next.js build yapar
- ✅ PM2 ile uygulamayı başlatır
- ✅ Otomatik restart ayarlar

---

## 🌐 Adım 6: Nginx/Apache Konfigürasyonu

### Virtualmin İçinden (Önerilir):

1. **Virtualmin Panel'e giriş yap**
2. **Server Configuration → Website Options**
3. **Proxy Settings:**
   - Proxy to port: `3000`
   - Proxy path: `/`

### Manuel Nginx Konfigürasyonu:

```bash
# Nginx config dosyasını kopyala
sudo cp nginx-chatbot.conf /etc/nginx/sites-available/chatbot.altikodtech.com.tr

# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/chatbot.altikodtech.com.tr /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

---

## 🔒 Adım 7: SSL Sertifikası (Let's Encrypt)

### Virtualmin İçinden (Kolay Yol):

1. **Server Configuration → SSL Certificate**
2. **Let's Encrypt** sekmesi
3. **Request Certificate** butonu

### Manuel Certbot:

```bash
# Certbot kur (Ubuntu/Debian)
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d chatbot.altikodtech.com.tr

# Otomatik yenileme test
sudo certbot renew --dry-run
```

---

## ✅ Adım 8: Doğrulama

### 1. Uygulama Kontrolü
```bash
# PM2 status
pm2 status

# Logs kontrol
pm2 logs chatbot-dashboard --lines 50

# Process kontrol
curl http://localhost:3000/api/health
```

Beklenen çıktı:
```json
{
  "status": "ok",
  "database": "sqlite",
  "encrypted": true
}
```

### 2. Web Kontrolü
```bash
# HTTPS test
curl -I https://chatbot.altikodtech.com.tr

# Dashboard erişim
curl -I https://chatbot.altikodtech.com.tr/dashboard
```

### 3. Tarayıcı Testi
1. **Dashboard:** https://chatbot.altikodtech.com.tr/dashboard
2. **Login** yap (`.env.local`'deki şifre ile)
3. **API Key** ekle
4. **Test bot** oluştur

---

## 📊 Adım 9: Monitoring & Logs

### PM2 Komutları
```bash
# Status
pm2 status

# Logs (real-time)
pm2 logs chatbot-dashboard

# Restart
pm2 restart chatbot-dashboard

# Stop
pm2 stop chatbot-dashboard

# Delete
pm2 delete chatbot-dashboard
```

### Log Dosyaları
```bash
# Application logs
tail -f /home/altikodtech/logs/chatbot-out.log
tail -f /home/altikodtech/logs/chatbot-error.log

# Nginx logs
sudo tail -f /var/log/nginx/chatbot.altikodtech.com.tr.access.log
sudo tail -f /var/log/nginx/chatbot.altikodtech.com.tr.error.log
```

---

## 💾 Adım 10: Otomatik Yedekleme

### Backup Script Kurulumu
```bash
# Script'i executable yap
chmod +x backup-chatbot.sh

# Log klasörü oluştur
mkdir -p /home/altikodtech/logs

# Manuel test
./backup-chatbot.sh
```

### Crontab Ayarla (Günlük Otomatik Yedek)
```bash
crontab -e
```

Ekle:
```cron
# ChatKit Dashboard - Günlük yedek (her gün saat 03:00)
0 3 * * * /home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html/backup-chatbot.sh >> /home/altikodtech/logs/backup.log 2>&1
```

---

## 🔧 Yaygın Sorunlar ve Çözümleri

### Problem: Port 3000 kullanımda
```bash
# Process'i bul
sudo lsof -i :3000

# Kill et
sudo kill -9 <PID>

# PM2'yi restart et
pm2 restart chatbot-dashboard
```

### Problem: Build hatası
```bash
# Node modules temizle
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problem: Database permission hatası
```bash
# Data klasörü izinleri
chmod 700 data/
chmod 600 data/*.db
chown -R altikodtech:altikodtech data/
```

### Problem: SSL sertifikası yüklenmiyor
```bash
# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# DNS kontrol
nslookup chatbot.altikodtech.com.tr

# Port 80/443 kontrol
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## 📱 Kullanıma Alma

### 1. İlk Giriş
```
URL: https://chatbot.altikodtech.com.tr/dashboard
Şifre: <.env.local'deki DASHBOARD_PASSWORD>
```

### 2. Müşteri İçin Bot Oluştur
```
Bot Name: Müşteri Adı
Site ID: musteridomaini (örn: altikod)
Workflow ID: wf_... (OpenAI'dan aldığın)
API Key: sk-proj-... (Müşteriye özel)
Color: #FF6B35
Title: Destek Ekibi
Position: bottom-right
```

### 3. Embed Kodu Ver
Dashboard'dan kopyala ve müşteriye ver:
```html
<script
    src="https://chatbot.altikodtech.com.tr/embed.js"
    data-site="musteridomaini"
    data-color="#FF6B35"
    data-title="Destek Ekibi"
    data-position="bottom-right"
></script>
```

---

## 🔒 Güvenlik Önlemleri

### 1. Firewall
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 2. Fail2ban (Brute Force Koruması)
```bash
# Kur
sudo apt install fail2ban

# Nginx jail ekle
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/*error.log
maxretry = 5
bantime = 3600
```

### 3. Database Yedekleri
```bash
# Yedekleri kontrol et
ls -lth /home/altikodtech/backups/chatbot/

# Manuel restore
cd /home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html
tar -xzf /home/altikodtech/backups/chatbot/chatbot_backup_XXXXXXXX.tar.gz
cp chatbot_backup_XXXXXXXX/chatkit.db data/
pm2 restart chatbot-dashboard
```

---

## 📞 Destek ve Yardım

### Komutlar Özeti
```bash
# Deployment
./deploy-virtualmin.sh

# PM2 Yönetimi
pm2 status
pm2 logs chatbot-dashboard
pm2 restart chatbot-dashboard
pm2 monit

# Backup
./backup-chatbot.sh

# Database Kontrolü
sqlite3 data/chatkit.db ".tables"
sqlite3 data/chatkit.db "SELECT COUNT(*) FROM bots;"

# Sistem Durumu
curl https://chatbot.altikodtech.com.tr/api/health
```

---

## ✅ Deployment Checklist

- [ ] Sunucuya SSH bağlantısı
- [ ] Node.js 20.x kuruldu
- [ ] Proje dosyaları yüklendi
- [ ] `.env.local` oluşturuldu ve düzenlendi
- [ ] `deploy-virtualmin.sh` çalıştırıldı
- [ ] PM2 çalışıyor ve uygulatma aktif
- [ ] Nginx/Apache reverse proxy ayarlandı
- [ ] SSL sertifikası yüklendi
- [ ] HTTPS çalışıyor
- [ ] Dashboard'a erişim test edildi
- [ ] Test bot oluşturuldu
- [ ] Otomatik yedekleme ayarlandı (crontab)
- [ ] Firewall kuralları eklendi
- [ ] Monitoring kuruldu

---

## 🎉 Deployment Tamamlandı!

Artık **chatbot.altikodtech.com.tr** üzerinden müşterilerine bot hizmeti verebilirsin!

**Dashboard:** https://chatbot.altikodtech.com.tr/dashboard
