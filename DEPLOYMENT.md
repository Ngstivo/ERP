# ERP Inventory & Warehouse Management System - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Production Checklist](#production-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x or higher
- **Redis**: 7.x or higher (optional, for caching)
- **Docker**: 20.x or higher (for containerized deployment)
- **Nginx**: Latest stable (for reverse proxy)

### Development Tools
- Git
- npm or yarn
- PM2 (for process management)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ERP
```

### 2. Backend Environment Variables
Create `backend/.env`:
```env
# Application
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=erp_user
DB_PASSWORD=<strong-password>
DB_DATABASE=erp_production

# Authentication
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRATION=1d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=<smtp-password>
```

### 3. Frontend Environment Variables
Create `frontend/.env.production`:
```env
VITE_API_URL=https://api.your-domain.com/api
```

## Database Setup

### 1. Create Database
```bash
psql -U postgres
CREATE DATABASE erp_production;
CREATE USER erp_user WITH ENCRYPTED PASSWORD '<strong-password>';
GRANT ALL PRIVILEGES ON DATABASE erp_production TO erp_user;
\q
```

### 2. Run Migrations
```bash
cd backend
npm run migration:run
```

### 3. Seed Initial Data (Optional)
```bash
npm run seed
```

## Backend Deployment

### Option 1: PM2 (Recommended for VPS)

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend
cd backend

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2
pm2 start dist/main.js --name erp-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 2: Systemd Service

Create `/etc/systemd/system/erp-backend.service`:
```ini
[Unit]
Description=ERP Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/erp/backend
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable erp-backend
sudo systemctl start erp-backend
sudo systemctl status erp-backend
```

## Frontend Deployment

### Build for Production
```bash
cd frontend
npm ci
npm run build
```

### Deploy to Nginx

1. Copy build files:
```bash
sudo cp -r dist/* /var/www/erp/frontend/
```

2. Configure Nginx (`/etc/nginx/sites-available/erp`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        root /var/www/erp/frontend;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Docker Deployment

### 1. Build and Run with Docker Compose
```bash
# Copy environment file
cp .env.example .env

# Edit .env with production values
nano .env

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Production Docker Compose
For production, use `docker-compose.prod.yml` with:
- Volume mounts for persistent data
- Health checks
- Resource limits
- Restart policies

## Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up fail2ban
- [ ] Enable database encryption at rest
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Regular security updates

### Performance
- [ ] Enable Redis caching
- [ ] Configure database connection pooling
- [ ] Set up CDN for static assets
- [ ] Enable Gzip compression
- [ ] Optimize database indexes
- [ ] Configure PM2 cluster mode

### Monitoring
- [ ] Set up application logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure database backups
- [ ] Set up alerts for critical errors
- [ ] Monitor disk space and memory

### Backup
- [ ] Automated daily database backups
- [ ] Backup retention policy (30 days)
- [ ] Test backup restoration
- [ ] Off-site backup storage

## Monitoring & Maintenance

### Application Logs
```bash
# PM2 logs
pm2 logs erp-backend

# Docker logs
docker-compose logs -f backend

# System logs
sudo journalctl -u erp-backend -f
```

### Database Backup
```bash
# Manual backup
pg_dump -U erp_user erp_production > backup_$(date +%Y%m%d).sql

# Automated backup (add to crontab)
0 2 * * * pg_dump -U erp_user erp_production > /backups/erp_$(date +\%Y\%m\%d).sql
```

### Health Checks
- API Health: `https://api.your-domain.com/api/health`
- Database: Check connection and query performance
- Redis: Monitor memory usage and hit rate

### Updates
```bash
# Pull latest code
git pull origin main

# Backend update
cd backend
npm ci
npm run build
pm2 restart erp-backend

# Frontend update
cd frontend
npm ci
npm run build
sudo cp -r dist/* /var/www/erp/frontend/
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check PostgreSQL is running
- Verify credentials in .env
- Check firewall rules

**API 502 Bad Gateway**
- Check backend is running: `pm2 status`
- Check logs: `pm2 logs erp-backend`
- Verify port 3001 is not blocked

**Frontend Not Loading**
- Check Nginx configuration
- Verify build files exist
- Check browser console for errors

## Support

For issues and support:
- Documentation: `/api/docs`
- GitHub Issues: <repository-url>/issues
- Email: support@your-company.com
