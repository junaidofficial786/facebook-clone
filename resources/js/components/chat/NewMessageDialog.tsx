import React, { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useChatManager } from '@/hooks/use-chat-manager';

interface Friend {
    id: number;
    name: string;
    profile_pic?: string;
}

interface NewMessageDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewMessageDialog({ isOpen, onClose }: NewMessageDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const { openChat } = useChatManager();

    // Fetch friends when dialog opens
    useEffect(() => {
        if (isOpen) {
            fetchFriends();
        }
    }, [isOpen]);

    // Filter friends based on search query
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = friends.filter(friend =>
                friend.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        } else {
            setFilteredFriends(friends);
        }
    }, [searchQuery, friends]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/friends', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFriends(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFriendClick = async (friend: Friend) => {
        try {
            // Create or get existing conversation
            const response = await fetch('/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ user_id: friend.id }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Conversation created:', data);
                if (data.conversation && data.conversation.id) {
                    openChat(data.conversation.id);
                    onClose();
                    setSearchQuery('');
                } else {
                    console.error('Invalid response format:', data);
                }
            } else {
                console.error('Failed to create conversation:', response.status);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>New Message</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Friends List */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-4 text-muted-foreground">
                                Loading friends...
                            </div>
                        ) : filteredFriends.length > 0 ? (
                            filteredFriends.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => handleFriendClick(friend)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                                >
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={friend.profile_pic} alt={friend.name} />
                                        <AvatarFallback>
                                            {friend.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium text-foreground">
                                            {friend.name}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : searchQuery ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No friends found matching "{searchQuery}"
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                No friends found
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
