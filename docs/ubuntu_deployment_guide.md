# Ubuntu Server Setup & Deployment Guide

This guide details how to prepare your Ubuntu server for the **Cameco** application and the automated CI/CD pipeline.

## 1. Initial Server Preparation
Update your server and install the core dependencies:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx php8.4-fpm php8.4-mysql php8.4-gd php8.4-xml php8.4-mbstring php8.4-bcmath php8.4-curl php8.4-zip php8.4-intl unzip git supervisor curl
```

## 2. NGINX Configuration
Create a site configuration at `/etc/nginx/sites-available/cameco`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/cameco/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cameco /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Directory Permissions
Ensure the web server can write to necessary directories:

```bash
sudo chown -R www-data:www-data /var/www/cameco/storage /var/www/cameco/bootstrap/cache
sudo chmod -R 775 /var/www/cameco/storage /var/www/cameco/bootstrap/cache
```

## 4. Supervisor (Queue Management)
Create `/etc/supervisor/conf.d/cameco-worker.conf`:

```ini
[program:cameco-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/cameco/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/cameco/storage/logs/worker.log
stopwaitsecs=3600
```
Update Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start cameco-worker:*
```

## 5. GitHub Secrets
For the CI/CD pipeline to work, add these secrets to your GitHub Repository (**Settings > Secrets and variables > Actions**):

| Secret Name | Description |
| :--- | :--- |
| `DEPLOY_HOST` | Your server's IP address or domain |
| `DEPLOY_USER` | The SSH user (e.g., `ubuntu` or `deploy`) |
| `DEPLOY_KEY` | Your SSH Private Key (RSA or Ed25519) |
| `DEPLOY_PATH` | Full path to the app (e.g., `/var/www/cameco`) |
| `DEPLOY_PORT` | (Optional) SSH port if not 22 |

## 6. SSH Key Setup
On your server, ensure the public key corresponding to `DEPLOY_KEY` is in `~/.authorized_keys` and the user has sudo-less permissions for `php artisan` commands OR is the owner of the web directory.
