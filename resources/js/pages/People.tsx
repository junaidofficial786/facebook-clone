import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, UserPlus, Clock } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/toast';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    profile_pic?: string;
}

interface PendingRequest {
    id: number;
    user: User;
    requested_at: string;
}

interface PeopleProps {
    pendingRequests: PendingRequest[];
    suggestedPeople: User[];
}

export default function People({ pendingRequests, suggestedPeople }: PeopleProps) {
    const [pendingRequestsState, setPendingRequestsState] = useState(pendingRequests);
    const [suggestedPeopleState, setSuggestedPeopleState] = useState(suggestedPeople);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
    const { show: showToast } = useToast();

    const handleAcceptRequest = async (friendshipId: number) => {
        setLoadingStates(prev => ({ ...prev, [`accept-${friendshipId}`]: true }));
        try {
            await axios.post('/api/friend-request/accept', { friendship_id: friendshipId });
            setPendingRequestsState(prev => prev.filter(req => req.id !== friendshipId));
            showToast("Friend request accepted!");
        } catch (error) {
            showToast("Failed to accept friend request.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`accept-${friendshipId}`]: false }));
        }
    };

    const handleRejectRequest = async (friendshipId: number) => {
        setLoadingStates(prev => ({ ...prev, [`reject-${friendshipId}`]: true }));
        try {
            await axios.post('/api/friend-request/reject', { friendship_id: friendshipId });
            setPendingRequestsState(prev => prev.filter(req => req.id !== friendshipId));
            showToast("Friend request rejected.");
        } catch (error) {
            showToast("Failed to reject friend request.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`reject-${friendshipId}`]: false }));
        }
    };

    const handleSendRequest = async (userId: number) => {
        setLoadingStates(prev => ({ ...prev, [`send-${userId}`]: true }));
        try {
            await axios.post('/api/friend-request', { friend_id: userId });
            setSuggestedPeopleState(prev => prev.filter(user => user.id !== userId));
            showToast("Friend request sent!");
        } catch (error) {
            showToast("Failed to send friend request.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [`send-${userId}`]: false }));
        }
    };

    return (
        <>
            <Head title="People" />
            <div className="flex-1 p-6 h-full overflow-y-auto">
                <h1 className="text-3xl font-bold mb-8">People</h1>

                {/* Pending Requests Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Pending Requests
                            {pendingRequestsState.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {pendingRequestsState.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingRequestsState.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No pending friend requests</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequestsState.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={request.user.profile_pic} alt={request.user.name} />
                                                <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{request.user.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Sent {request.requested_at}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAcceptRequest(request.id)}
                                                disabled={loadingStates[`accept-${request.id}`]}
                                            >
                                                {loadingStates[`accept-${request.id}`] ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                ) : (
                                                    <Check className="h-4 w-4 mr-2" />
                                                )}
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRejectRequest(request.id)}
                                                disabled={loadingStates[`reject-${request.id}`]}
                                            >
                                                {loadingStates[`reject-${request.id}`] ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                                ) : (
                                                    <X className="h-4 w-4 mr-2" />
                                                )}
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Separator className="my-8" />

                {/* People You May Know Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            People You May Know
                            {suggestedPeopleState.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {suggestedPeopleState.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {suggestedPeopleState.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No suggestions available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {suggestedPeopleState.map((person) => (
                                    <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={person.profile_pic} alt={person.name} />
                                                <AvatarFallback>{person.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link
                                                    href={`/settings/profile/${person.id}`}
                                                    className="font-semibold hover:underline text-black hover:text-gray-700 transition-colors"
                                                >
                                                    {person.name}
                                                </Link>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSendRequest(person.id)}
                                            disabled={loadingStates[`send-${person.id}`]}
                                        >
                                            {loadingStates[`send-${person.id}`] ? (
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                                            ) : (
                                                <UserPlus className="h-3 w-3 mr-1" />
                                            )}
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

People.layout = (page: React.ReactNode) => <AppHeaderLayout>{page}</AppHeaderLayout>;
