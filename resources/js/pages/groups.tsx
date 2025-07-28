import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AppShell } from '@/layouts/app/app-shell';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
const route = (window as any).route;

export default function GroupsPage() {
    const { joinedGroups = [], moreGroups = [] } = usePage().props as any;
    const [joiningGroups, setJoiningGroups] = useState<{ [key: number]: boolean }>({});

    const handleJoinGroup = async (groupId: number) => {
        setJoiningGroups(prev => ({ ...prev, [groupId]: true }));
        try {
            const response = await axios.post(`/groups/${groupId}/join`);
            if (response.data.success) {
                // Refresh the page to update the groups
                window.location.reload();
            } else {
                alert(response.data.message || 'Failed to join group');
            }
        } catch (error) {
            alert('Failed to join group');
        } finally {
            setJoiningGroups(prev => ({ ...prev, [groupId]: false }));
        }
    };

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
                        {(joinedGroups as {id: number, name: string, members: number}[]).map(group => (
                            <div key={group.id} className="p-4 bg-white rounded-lg shadow border flex flex-col">
                                <Link href={route('groups.show', group.id)} className="font-medium text-lg hover:underline">
                                    {group.name}
                                </Link>
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
                                <Link href={route('groups.show', group.id)} className="font-medium text-lg hover:underline">
                                    {group.name}
                                </Link>
                                <span className="text-sm text-muted-foreground">{group.members} members</span>
                                <Button
                                    size="sm"
                                    className="mt-2 w-fit self-end"
                                    onClick={() => handleJoinGroup(group.id)}
                                    disabled={joiningGroups[group.id]}
                                >
                                    {joiningGroups[group.id] ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                            Joining...
                                        </>
                                    ) : (
                                        'Join'
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
