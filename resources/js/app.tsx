import '../css/app.css';
import './echo.js'

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';
import { ToastProvider } from '@/components/ui/toast';
import { OnlineUsersProvider } from '@/contexts/OnlineUsersContext';
import NotFound from './pages/404';


configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ToastProvider>
                <OnlineUsersProvider>
                    <App
                        {...props}
                        errorBoundary={({ error }) => {
                            if (error.status === 404) {
                                return <NotFound />;
                            }
                            return <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-bold">An unexpected error occurred.</div>;
                        }}
                    />
                </OnlineUsersProvider>
            </ToastProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
