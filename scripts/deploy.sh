#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to the project directory (adjust if needed)
# cd /var/www/cameco

# Enter maintenance mode
echo "🏗️ Entering maintenance mode..."
php artisan down --refresh=15 || true

# Pull the latest version from the repo
echo "📥 Pulling latest changes..."
git pull origin main

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Install Node dependencies and build assets
echo "🎨 Building frontend assets..."
npm install
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Clear and cache configurations
echo "🧹 Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart queues
echo "🔄 Restarting queue workers..."
php artisan queue:restart

# Clear cache
php artisan cache:clear

# Exit maintenance mode
echo "✅ Deployment complete! Exiting maintenance mode..."
php artisan up

echo "🚀 Application is live."
