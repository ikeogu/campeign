import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            // Blade renders every page server-side, so there's no index.html for
            // the plugin to inject into — we register the SW ourselves in app.jsx.
            injectRegister: false,
            registerType: 'prompt',
            // sw.js is physically emitted under /build/ (Laravel's Vite outDir),
            // which would default its registration scope to /build/ only. A root
            // route (routes/web.php) re-serves it at /sw.js, so point the
            // generated registration + scope there to cover the whole app.
            buildBase: '/',
            scope: '/',
            // Hand-written at public/manifest.webmanifest and linked directly from
            // app.blade.php instead of letting the plugin generate one: with
            // `manifest` set here, the plugin unconditionally adds a precache
            // entry for it as a bare relative "manifest.webmanifest" URL that
            // isn't run through modifyURLPrefix, which 404s once the SW is
            // served from "/" instead of "/build/" — and a failed precache
            // entry fails the SW install entirely. Not worth fighting; the
            // manifest's content is static anyway.
            manifest: false,
            workbox: {
                // Bundle the workbox runtime into sw.js itself instead of a
                // separate "workbox-*.js" chunk loaded via a relative import —
                // that import resolves against the SW's serving URL ("/sw.js",
                // see routes/web.php) rather than its build location, so the
                // split chunk would 404.
                inlineWorkboxRuntime: true,
                // Only precache the hashed JS/CSS bundle. Deliberately scoped to
                // `assets/**` (relative to the build outDir) so the service worker
                // never walks into public/storage (user uploads), public/vendor, etc.
                globPatterns: ['assets/**/*.{js,css}'],
                // Entries are generated relative to the build outDir ("assets/x.js").
                // The SW itself is served from "/sw.js" (root, for scope reasons —
                // see routes/web.php), so relative URLs would resolve against "/"
                // and 404. Rewrite them to the real absolute path instead.
                modifyURLPrefix: { '': '/build/' },
                // The plugin defaults navigateFallback to "index.html" (an SPA
                // convenience) — we don't precache one, and page/API/wallet/
                // payment-callback requests must always hit the network, never
                // be served from cache, so disable it explicitly.
                navigateFallback: null,
                cleanupOutdatedCaches: true,
            },
        }),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
        strictPort: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
    }
});
