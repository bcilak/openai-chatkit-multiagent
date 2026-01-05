# 🚀 Virtualmin Kurulum Talimatları

## Gereksinimler

- Node.js 20+
- npm
- Virtualmin (Apache/Nginx)

## Kurulum Adımları

### 1. Projeyi Klonlayın veya Yükleyin

```bash
cd /var/www/chatbot.altikodtech.com.tr
# Projeyi buraya kopyalayın
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables Ayarlayın

```bash
cp .env.example .env.local
nano .env.local
```

**Önemli:** Aşağıdaki değerleri mutlaka değiştirin:

```env
# Dashboard giriş şifresi (güçlü bir şifre belirleyin)
DASHBOARD_PASSWORD=super-güvenli-şifreniz-buraya

# API Key şifreleme anahtarı (rastgele 32+ karakter)
# Oluşturmak için: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=buraya-64-karakterlik-hex-string-yapistirin

# Opsiyonel: Varsayılan OpenAI API key
OPENAI_API_KEY=sk-proj-...
```

**Encryption Key Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Çıktıyı kopyalayıp ENCRYPTION_KEY= kısmına yapıştırın
```

### 4. Uygulamayı Build Edin

```bash
npm run build
```

### 5. PM2 ile Production'da Çalıştırın

```bash
# PM2'yi global olarak yükleyin (yoksa)
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "chatbot" -- start

# Sunucu restart'ta otomatik başlasın
pm2 startup
pm2 save
```

### 6. Nginx/Apache Reverse Proxy Ayarları

#### Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name chatbot.altikodtech.com.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Apache Konfigürasyonu (Virtualmin)

```apache
<VirtualHost *:80>
    ServerName chatbot.altikodtech.com.tr

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3000/$1 [P,L]
</VirtualHost>
```

**Gerekli Apache modüllerini aktif edin:**
```bash
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
systemctl restart apache2
```

### 7. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulu değilse
apt install certbot python3-certbot-apache

# SSL sertifikası al
certbot --apache -d chatbot.altikodtech.com.tr
```

### 8. Veritabanı Yedeği

SQLite veritabanı `data/chatkit.db` dosyasındadır. Düzenli yedek alın:

```bash
# Otomatik yedek scripti oluştur
nano /root/backup-chatbot.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/chatbot"
mkdir -p $BACKUP_DIR

# Database backup
cp /var/www/chatbot.altikodtech.com.tr/data/chatkit.db \
   $BACKUP_DIR/chatkit_$DATE.db

# Son 30 günü tut, eskilerini sil
find $BACKUP_DIR -name "chatkit_*.db" -mtime +30 -delete
```

```bash
chmod +x /root/backup-chatbot.sh

# Crontab'a ekle (her gün saat 03:00)
crontab -e
# Ekle: 0 3 * * * /root/backup-chatbot.sh
```

### 9. Güvenlik

```bash
# Veritabanı dosyasına sadece uygulama erişebilsin
chmod 600 /var/www/chatbot.altikodtech.com.tr/data/chatkit.db
chown www-data:www-data /var/www/chatbot.altikodtech.com.tr/data/chatkit.db
```

### 10. İlk Kullanım

1. Tarayıcıda `https://chatbot.altikodtech.com.tr/dashboard` açın
2. `.env.local`'deki şifre ile giriş yapın
3. Global API key ekleyin (isterseniz)
4. Müşteri için bot oluşturun:
   - Bot Name: Müşteri adı
   - Site ID: müşteridomaini (örn: `altikodtech`)
   - Workflow ID: OpenAI'dan aldığınız `wf_...`
   - API Key: Müşteriye özel API key
   - Renk, başlık, konum ayarlayın
5. Embed kodunu kopyalayın ve müşterinin sitesine ekleyin

## Sorun Giderme

### Port 3000 kullanımda hatası
```bash
# Çalışan process'i bul
lsof -i :3000
# Kill et
kill -9 <PID>
```

### PM2 logları kontrol
```bash
pm2 logs chatbot
pm2 restart chatbot
```

### Database hatası
```bash
# Database yoksa otomatik oluşturulur
# Hata varsa data klasörünü kontrol edin
ls -la /var/www/chatbot.altikodtech.com.tr/data/
```

### Uygulama güncellemesi
```bash
cd /var/www/chatbot.altikodtech.com.tr
git pull  # veya yeni dosyaları yükle
npm install
npm run build
pm2 restart chatbot
```

## Kullanım

### Yeni Müşteri Ekleme

1. Dashboard'a giriş yap
2. "Add New Bot" bölümünü doldur
3. Müşteriye özel API key'i gir (OpenAI Platform'dan)
4. Embed kodunu kopyala
5. Müşterinin web sitesine `</body>` tag'inden önce ekle

### Örnek Embed Kodu

```html
<script
    src="https://chatbot.altikodtech.com.tr/embed.js"
    data-site="altikodtech"
    data-color="#3b82f6"
    data-title="Destek Ekibi"
    data-position="bottom-right"
></script>
```

## Önemli Notlar

- ⚠️ `ENCRYPTION_KEY` değerini asla değiştirmeyin (mevcut API key'ler okunamaz hale gelir)
- ✅ Düzenli database yedeği alın
- ✅ SSL sertifikasını kullanın (Let's Encrypt ücretsiz)
- ✅ Dashboard şifresini güçlü tutun
- ✅ Her müşteri için ayrı API key kullanın (OpenAI Platform'dan)
