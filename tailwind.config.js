import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    50:  '#fff4ed',
                    100: '#ffe4cc',
                    200: '#ffc999',
                    300: '#ffad66',
                    400: '#ff8c2e',
                    500: '#e86a00',
                    600: '#cc5500',
                    700: '#993f00',
                    800: '#662a00',
                    900: '#331500',
                },
            },
        },
    },

    plugins: [forms],
};
