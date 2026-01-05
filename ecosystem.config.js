// PM2 Ecosystem Configuration
// OpenAI ChatKit Multi-Agent Dashboard
// chatbot.altikodtech.com.tr

module.exports = {
  apps: [
    {
      name: 'chatbot-dashboard',
      script: 'npm',
      args: 'start',
      cwd: '/home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html',

      // Instance configuration
      instances: 1,
      exec_mode: 'fork',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',

      // Restart delay
      restart_delay: 4000,
      min_uptime: '10s',

      // Error handling
      max_restarts: 10,
      exp_backoff_restart_delay: 100,

      // Logs
      error_file: '/home/altikodtech/logs/chatbot-error.log',
      out_file: '/home/altikodtech/logs/chatbot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Additional settings
      cron_restart: '0 4 * * *', // Restart every day at 4 AM
      ignore_watch: ['node_modules', '.next', 'data'],

      // Health check
      max_restarts: 15,
      min_uptime: '5s',
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'altikodtech',
      host: 'chatbot.altikodtech.com.tr',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/chatkit-dashboard.git',
      path: '/home/altikodtech/domains/chatbot.altikodtech.com.tr/public_html',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    }
  }
};
