import { SidebarInset } from '@/components/ui/sidebar';
import LeftColumn from '@/components/dashboard/left-column';
import RightColumn from '@/components/dashboard/right-column';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <div className="flex w-full gap-12 px-6 min-h-0 mt-6">
            <div className="hidden lg:block w-1/4">
                <div className="sticky top-24">
                    <LeftColumn />
                </div>
            </div>
            <main className="flex-1 min-w-0 flex flex-col" {...props}>
                {children}
            </main>
            <div className="hidden xl:block w-1/4">
                <div className="sticky top-24">
                    <RightColumn />
                </div>
            </div>
        </div>
    );
}
