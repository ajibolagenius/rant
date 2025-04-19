import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        ns: ['common'],      // Change from 'translation' to 'common'
        defaultNS: 'common', // Set default namespace to 'common'
        interpolation: {
            escapeValue: false, // not needed for React
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        },
        backend: {
            // Explicitly specify the full path including /public
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
    });

export default i18n;
