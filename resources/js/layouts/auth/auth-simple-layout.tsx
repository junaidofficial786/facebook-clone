import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage().props as any;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        {/* App Logo/Name */}
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                                    <span className="text-2xl font-bold">{name?.charAt(0)?.toUpperCase() || 'A'}</span>
                                </div>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name || 'App Name'}</h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
