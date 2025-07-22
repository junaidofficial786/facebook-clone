import LeftColumn from '@/components/dashboard/left-column';
import RightColumn from '@/components/dashboard/right-column';
import { AppHeader } from '@/components/app/app-header';
import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppHeader />
            <div className="flex w-full max-w-7xl gap-6 px-2 min-h-0 h-screen overflow-hidden mx-auto">
                <div className="hidden lg:block w-1/4">
                    <div className="sticky top-24">
                        <LeftColumn />
                    </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col h-full min-h-0">
                    {children}
                </div>
                <div className="hidden xl:block w-1/4">
                    <div className="sticky top-24">
                        <RightColumn />
                    </div>
                </div>
            </div>
        </>
    );
}
