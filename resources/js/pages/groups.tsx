import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AppShell } from '@/layouts/app/app-shell';
const route = (window as any).route;

export default function GroupsPage() {
    // Dummy data for now
    const joinedGroups = [
        { id: 1, name: 'React Developers', members: 1200 },
        { id: 2, name: 'Laravel Pakistan', members: 800 },
    ];
    const moreGroups = [
        { id: 3, name: 'Open Source Enthusiasts', members: 500 },
        { id: 4, name: 'UI/UX Designers', members: 300 },
    ];
    return (
        <AppShell>
            <div className="flex-1 min-h-0 h-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Groups</h1>
                    <Button variant="default" asChild>
                        <Link href={route('groups.create')}>Create New Group</Link>
                    </Button>
                </div>
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">Groups you have joined</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {joinedGroups.map(group => (
                            <div key={group.id} className="p-4 bg-white rounded-lg shadow border flex flex-col">
                                <span className="font-medium text-lg">{group.name}</span>
                                <span className="text-sm text-muted-foreground">{group.members} members</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">More groups to follow</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {moreGroups.map(group => (
                            <div key={group.id} className="p-4 bg-white rounded-lg shadow border flex flex-col">
                                <span className="font-medium text-lg">{group.name}</span>
                                <span className="text-sm text-muted-foreground">{group.members} members</span>
                                <Button size="sm" className="mt-2 w-fit self-end">Join</Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
