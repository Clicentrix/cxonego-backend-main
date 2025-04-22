module.exports = {
  apps: [
    {
      name: "cxonego-backend-main",
      script: "build/src/index.js",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
      },
      env_file: ".env",
      node_args: "--require=dotenv/config"
    }
  ]
}; 