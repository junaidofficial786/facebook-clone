import { AppHeader } from '@/components/app/app-header';
import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppHeader />
            <div className="flex-1 min-w-0 flex flex-col h-full min-h-0">
                {children}
            </div>
        </>
    );
}
