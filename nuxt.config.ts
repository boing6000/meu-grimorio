import Theme from './themes/executor'
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    modules: [
        '@nuxt/image',
        '@primevue/nuxt-module',
        '@pinia/nuxt',
        '@nuxtjs/mdc'
    ],
    primevue: {
        options: {
            theme: {
                preset: Theme, // Ou o tema de sua preferência
                options: {
                    darkModeSelector: '.p-dark'
                }
            }
        }
    },
    css: [
        'primeicons/primeicons.css',
        'primeflex/primeflex.css' // Utilitários CSS poderosos
    ],
    //vite host
    vite: {
        server: {
            hosts: '0.0.0.0'
        }
    }
})