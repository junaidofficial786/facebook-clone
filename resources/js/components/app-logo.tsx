import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props as any;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <span className="text-sm font-bold">{name?.charAt(0)?.toUpperCase() || 'A'}</span>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{name || 'App Name'}</span>
            </div>
        </>
    );
}
