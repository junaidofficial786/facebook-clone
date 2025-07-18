import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {

    Echo.join('online-users')
    .here((users) => {
        console.log("Currently online:", users);
        // users = array of users with email included
    })
    .joining((user) => {
        console.log(`${user.name} (${user.email}) just came online.`);
    })
    .leaving((user) => {
        console.log(`${user.name} (${user.email}) just went offline.`);
    });

    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
