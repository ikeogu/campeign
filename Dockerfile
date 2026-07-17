### Stage 1 — PHP dependencies
FROM composer:2 AS composer-deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs

### Stage 2 — frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY --from=composer-deps /app/vendor ./vendor
RUN npm run build

### Stage 3 — runtime image (php-fpm + nginx + supervisor)
FROM php:8.2-fpm-alpine AS runtime

RUN apk add --no-cache \
        nginx supervisor bash curl git \
        libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev icu-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && apk del libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev icu-dev oniguruma-dev

WORKDIR /var/www/html

COPY --from=composer-deps /app/vendor ./vendor
COPY . .
COPY --from=frontend-build /app/public/build ./public/build

RUN composer dump-autoload --optimize --no-dev \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
