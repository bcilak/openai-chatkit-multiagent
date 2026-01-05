# 📦 Production Deployment Dosyaları
## chatbot.altikodtech.com.tr

Bu proje production'a almak için aşağıdaki dosyalar hazırlandı:

---

## 📄 Deployment Dosyaları

### 1. **Configuration Files**

#### `.env.production.example`
- Production environment template
- Tüm gerekli environment variables
- Güvenlik ayarları

#### `ecosystem.config.js`
- PM2 yapılandırma dosyası
- Process management settings
- Auto-restart ve cron ayarları

---

### 2. **Deployment Scripts**

#### `deploy-virtualmin.sh` ⭐ ANA SCRIPT
- Otomatik deployment scripti
- Dependency kurulumu
- Build ve PM2 başlatma
- Kullanım: `./deploy-virtualmin.sh`

#### `backup-chatbot.sh`
- Otomatik yedekleme scripti
- Database, env ve config backup
- Retention policy (30 gün)
- Kullanım: `./backup-chatbot.sh`

---

### 3. **Server Configuration**

#### `nginx-chatbot.conf`
- Nginx reverse proxy ayarları
- SSL/HTTPS yapılandırması
- Security headers
- Gzip compression

---

### 4. **Documentation**

#### `PRODUCTION-DEPLOY.md` 📘 DETAYLI KILAVUZ
- **350+ satır kapsamlı deployment kılavuzu**
- Tüm adımlar detaylı
- Sorun çözme rehberi
- Security checklist

#### `QUICK-START.md` ⚡ HIZLI BAŞLANGIÇ
- 5 dakikada deployment
- Temel komutlar
- Hızlı referans

#### `DEPLOYMENT-CHECKLIST.md` ✅ CHECKLIST
- Adım adım checklist
- Test senaryoları
- Security verification
- Sign-off formu

#### `SETUP.md`
- Virtualmin özel kurulum
- Detaylı talimatlar
- Backup stratejisi

---

## 🚀 Deployment Sırası

### Hızlı Kurulum (5 Adım):
```bash
1. Sunucuya SSH ile bağlan
2. cp .env.production.example .env.local
3. nano .env.local (şifreleri ayarla)
4. ./deploy-virtualmin.sh
5. SSL sertifikası ekle (Virtualmin panel)
```

### Detaylı Kurulum:
👉 [PRODUCTION-DEPLOY.md](PRODUCTION-DEPLOY.md) dosyasını takip et

---

## 📁 Dosya Konumları

### Sunucuda Dizin Yapısı:
```
/home/altikodtech/domains/chatbot.altikodtech.com.tr/
├── public_html/                    # Ana uygulama
│   ├── src/                        # Source code
│   ├── data/                       # SQLite database
│   │   └── chatkit.db
│   ├── .env.local                  # Environment (gizli)
│   ├── ecosystem.config.js         # PM2 config
│   ├── deploy-virtualmin.sh        # Deploy script
│   ├── backup-chatbot.sh           # Backup script
│   ├── package.json
│   └── ...
├── backups/chatbot/                # Yedekler
│   ├── chatbot_backup_20260105.tar.gz
│   └── ...
└── logs/                           # Log dosyaları
    ├── chatbot-out.log
    ├── chatbot-error.log
    └── backup.log
```

---

## 🔐 Güvenlik Notları

### Sunucuya Yüklenmemesi Gereken Dosyalar:
- ❌ `.env.local` (her sunucuda yeniden oluşturulmalı)
- ❌ `data/chatkit.db` (production'da oluşturulur)
- ❌ `node_modules/` (npm install ile kurulur)
- ❌ `.next/` (build ile oluşturulur)

### Git'e Commit Edilmemesi Gerekenler:
- ✅ `.gitignore` zaten ayarlı
- ❌ `.env.local`
- ❌ `data/`
- ❌ `*.db`, `*.db-wal`, `*.db-shm`

---

## ✅ Deployment Öncesi Kontrol

- [ ] Tüm dosyalar yüklendi
- [ ] `.env.production.example` → `.env.local` kopyalandı
- [ ] Şifreler değiştirildi
- [ ] Scripts executable yapıldı (`chmod +x *.sh`)
- [ ] Domain DNS ayarları yapıldı
- [ ] SSH erişimi test edildi

---

## 📞 Yardım

- **Hızlı Başlangıç:** [QUICK-START.md](QUICK-START.md)
- **Detaylı Kılavuz:** [PRODUCTION-DEPLOY.md](PRODUCTION-DEPLOY.md)
- **Checklist:** [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
- **Genel Setup:** [SETUP.md](SETUP.md)

---

## 🎯 Başarılar!

Tüm dosyalar hazır. Production deployment için **PRODUCTION-DEPLOY.md** dosyasını takip et!
