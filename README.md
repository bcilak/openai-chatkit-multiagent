# OpenAI ChatKit Multi-Agent Dashboard

A powerful dashboard for managing and deploying AI chat bots powered by OpenAI ChatKit. Easily embed chat widgets on multiple websites with customizable appearance and behavior.

## ✨ Features

- 🤖 **Multi-Bot Management**: Create and manage multiple chat bots from a single dashboard
- 🎨 **Customizable Widgets**: Configure colors, positions, and titles for each bot
- 🔐 **Secure API Key Management**: Store API keys securely with password protection
- 📦 **Easy Embedding**: Simple script tag to embed chat on any website
- ⚡ **Rate Limiting**: Built-in protection against API abuse
- 🌐 **CORS Support**: Works seamlessly with cross-origin websites

## 🚀 Deploy to Vercel

### Prerequisites

1. An OpenAI account with API access
2. A Vercel account
3. OpenAI ChatKit workflow IDs

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bcilak/openai-chatkit-multiagent)

### Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/bcilak/openai-chatkit-multiagent.git
   cd openai-chatkit-multiagent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your values:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DASHBOARD_PASSWORD`: Password to protect the dashboard (optional but recommended)

4. **Deploy to Vercel**
   ```bash
   npx vercel
   ```

5. **Add Vercel KV (Required for production)**
   - Go to your Vercel dashboard
   - Navigate to your project → Storage → Create Database → KV
   - The environment variables will be automatically added

6. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` and `DASHBOARD_PASSWORD`

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

> **Note**: In local development without Vercel KV, the app uses in-memory storage which resets on restart.

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

- API keys are stored securely in Vercel KV
- Dashboard access can be protected with a password
- Rate limiting prevents API abuse
- Bot-specific API keys allow granular access control

## 🛠️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Default OpenAI API key |
| `DASHBOARD_PASSWORD` | No | Password to protect dashboard access |
| `KV_REST_API_URL` | Auto | Vercel KV URL (auto-configured) |
| `KV_REST_API_TOKEN` | Auto | Vercel KV token (auto-configured) |

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
│   │   └── db.ts              # Database (Vercel KV) layer
│   └── types/
│       └── chatkit.d.ts       # TypeScript definitions
├── public/
│   └── embed.js               # Embed script for websites
└── vercel.json                # Vercel configuration
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
