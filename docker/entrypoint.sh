#!/bin/bash
set -e

cp /var/www/html/docker/www.conf /usr/local/etc/php-fpm.d/www.conf

cd /var/www/html

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link || true

exec "$@"
