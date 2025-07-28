import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    const { name } = usePage().props as any;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-3 self-center font-medium hover:opacity-80 transition-opacity">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                        <span className="text-lg font-bold">{name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{name || 'App Name'}</span>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl shadow-lg border-0">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
