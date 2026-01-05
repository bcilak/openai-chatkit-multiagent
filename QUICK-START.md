# ⚡ Quick Start Guide
## chatbot.altikodtech.com.tr - Hızlı Kurulum

---

## 🚀 5 Adımda Production'a Al

### 1️⃣ Sunucuya Bağlan
```bash
ssh altikodtech@chatbot.altikodtech.com.tr
cd /home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html
```

### 2️⃣ Environment Ayarla
```bash
cp .env.production.example .env.local
nano .env.local
```

**Mutlaka değiştir:**
```env
DASHBOARD_PASSWORD=güçlü-şifre-buraya
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 3️⃣ Deploy Et
```bash
chmod +x deploy-virtualmin.sh
./deploy-virtualmin.sh
```

### 4️⃣ SSL Ekle (Virtualmin Panel)
- **Server Configuration → SSL Certificate**
- **Let's Encrypt** tab
- **Request Certificate**

### 5️⃣ Test Et
```bash
# Health check
curl https://chatbot.altikodtech.com.tr/api/health

# Dashboard'a gir
https://chatbot.altikodtech.com.tr/dashboard
```

---

## 📝 İlk Bot Oluşturma

1. Dashboard'a giriş yap
2. "Add New Bot" formunu doldur:
   ```
   Bot Name: Müşteri Adı
   Site ID: musteriadi
   Workflow ID: wf_xxx (OpenAI'dan)
   API Key: sk-proj-xxx (Müşteriye özel)
   Color: #3b82f6
   Title: Destek
   Position: bottom-right
   ```
3. Embed kodunu kopyala ve müşteriye gönder

---

## 🔧 Günlük Komutlar

```bash
# PM2 status
pm2 status

# Logs
pm2 logs chatbot-dashboard

# Restart
pm2 restart chatbot-dashboard

# Backup (manuel)
./backup-chatbot.sh

# Database kontrol
sqlite3 data/chatkit.db "SELECT * FROM bots;"
```

---

## 🆘 Sorun Çözme

**Uygulama çalışmıyor:**
```bash
pm2 restart chatbot-dashboard
pm2 logs chatbot-dashboard --lines 50
```

**Port hatası:**
```bash
sudo lsof -i :3000
pm2 restart chatbot-dashboard
```

**SSL hatası:**
- Virtualmin → SSL Certificate → Let's Encrypt → Request

---

## 📚 Detaylı Dokümantasyon

- [**PRODUCTION-DEPLOY.md**](PRODUCTION-DEPLOY.md) - Tam kurulum kılavuzu
- [**SETUP.md**](SETUP.md) - Genel setup bilgileri
- [**README.md**](README.md) - Proje hakkında

---

## ✅ Her Şey Hazır!

Dashboard: https://chatbot.altikodtech.com.tr/dashboard

Başarılar! 🎉
