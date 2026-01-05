# OpenAI ChatKit Multi-Agent Dashboard

A powerful dashboard for managing and deploying AI chat bots powered by OpenAI ChatKit. Easily embed chat widgets on multiple websites with customizable appearance and behavior.

## ✨ Features

- 🤖 **Multi-Bot Management**: Create and manage multiple chat bots from a single dashboard
- 🎨 **Customizable Widgets**: Configure colors, positions, and titles for each bot
- 🔐 **AES-256-GCM Encryption**: All API keys stored with military-grade encryption
- 🗄️ **SQLite Database**: Lightweight, file-based storage with WAL mode
- 📦 **Easy Embedding**: Simple script tag to embed chat on any website
- ⚡ **Rate Limiting**: Built-in protection against API abuse (20-30 req/min)
- 🌐 **CORS Support**: Works seamlessly with cross-origin websites
- 🔒 **Dashboard Protection**: Password-protected admin panel
- 💾 **Auto Backup**: Automated daily backup with 30-day retention

## 🚀 Quick Start

### ⚡ 5-Minute Deployment (Virtualmin/VPS)

```bash
# 1. Upload files to server
cd /home/youruser/domains/yourdomain.com/public_html

# 2. Setup environment
cp .env.production.example .env.local
nano .env.local  # Set DASHBOARD_PASSWORD and ENCRYPTION_KEY

# 3. Deploy!
chmod +x deploy-virtualmin.sh
./deploy-virtualmin.sh
```

📘 **Full Guide:** [PRODUCTION-DEPLOY.md](PRODUCTION-DEPLOY.md)
⚡ **Quick Start:** [QUICK-START.md](QUICK-START.md)
✅ **Checklist:** [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

### 📦 Alternative: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chatkit-dashboard)

**Note:** Vercel deployment requires Vercel Postgres or similar database service.


## 🗄️ Database

This project uses **SQLite** for data storage with AES-256-GCM encryption for API keys. The database file is automatically created at `data/chatkit.db` on first run. No external database server required!

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
OPENAI_API_KEY=sk-proj-your-api-key-here
DASHBOARD_PASSWORD=your-secure-password-here
ENCRYPTION_KEY=your-random-32-char-encryption-key
```

**Important Security Notes:**
- `DASHBOARD_PASSWORD`: Protects admin panel access (required)
- `ENCRYPTION_KEY`: Encrypts API keys in database (required, min 32 chars)
- Generate secure encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- All data is stored in SQLite database at `data/chatkit.db`

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

> **Note**: All data is stored in `data/chatkit.db`. Backup this file regularly for production use.

## 📖 Usage

### 1. Access the Dashboard

Navigate to `/dashboard` and log in with your password (if configured).

### 2. Configure API Key

Enter your OpenAI API key in the API Configuration section.

### 3. Create a Bot

Fill in the bot details:
- **Bot Name**: A friendly name for your reference
- **Site ID**: Unique identifier for this bot (e.g., "mystore")
- **Workflow ID**: Your OpenAI ChatKit workflow ID (starts with `wf_`)
- **API Key** (Optional): Use a different API key for this specific bot
- **Color**: Widget accent color
- **Title**: Chat window title
- **Position**: Bottom-right or bottom-left

### 4. Embed on Your Website

Copy the embed code and paste it before the closing `</body>` tag:

```html
<script 
    src="https://your-domain.vercel.app/embed.js"
    data-site="mystore"
    data-color="#3b82f6"
    data-title="Chat with us"
    data-position="bottom-right"
></script>
```

## 🔒 Security

- **AES-256-GCM encryption** for all API keys in database
- Dashboard password protection (required)
- Rate limiting prevents API abuse (20-30 req/min per IP)
- Bot-specific API keys allow granular access control
- SQLite database file permissions should be 600 (owner read/write only)

## 🛠️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Optional | Default OpenAI API key (can be set in dashboard) |
| `DASHBOARD_PASSWORD` | **Required** | Password to protect dashboard access |
| `ENCRYPTION_KEY` | **Required** | 32+ character key for API key encryption |

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/verify/   # Authentication endpoint
│   │   │   ├── config/        # Bot configuration API
│   │   │   └── token/         # ChatKit session tokens
│   │   ├── chat/              # Full-page chat
│   │   ├── dashboard/         # Admin dashboard
│   │   └── embed/             # Embeddable widget
│   ├── components/
│   │   └── ChatBubble.tsx     # Chat widget component
│   ├── lib/
│   │   └── db.ts              # Database (SQLite + Encryption) layer
│   └── types/
│       └── chatkit.d.ts       # TypeScript definitions
├── data/
│   └── chatkit.db             # SQLite database (auto-created)
├── public/
│   └── embed.js               # Embed script for websites
└── Dockerfile                 # Docker container setup
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
