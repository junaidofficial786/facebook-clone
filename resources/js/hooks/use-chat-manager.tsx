import { useState, useEffect } from 'react';

interface Conversation {
    id: number;
    type: 'private' | 'group';
    name: string;
    participants: Array<{
        id: number;
        name: string;
        profile_pic?: string;
        role: string;
    }>;
    messages: Array<{
        id: number;
        content: string;
        sender_name: string;
        sender_id: number;
        created_at: string;
        status: 'sent' | 'delivered' | 'seen';
    }>;
}

interface OpenChat {
    conversation: Conversation;
    position: { x: number; y: number };
}

export function useChatManager() {
    const [openChats, setOpenChats] = useState<Map<number, OpenChat>>(new Map());
    const [conversations, setConversations] = useState<Conversation[]>([]);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/conversations', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    // Open a chat popup
    const openChat = async (conversationId: number) => {
        // Check if chat is already open
        if (openChats.has(conversationId)) {
            return;
        }

        try {
            // Fetch full conversation data
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/conversations/${conversationId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                const conversation = data.conversation;
                console.log('Fetched conversation:', conversation);

                // Calculate position for new chat
                const chatCount = openChats.size;
                const position = {
                    x: 20 + (chatCount * 20),
                    y: 20 + (chatCount * 20),
                };

                setOpenChats(prev => new Map(prev).set(conversationId, {
                    conversation,
                    position,
                }));
            }
        } catch (error) {
            console.error('Error opening chat:', error);
        }
    };

    // Close a chat popup
    const closeChat = (conversationId: number) => {
        setOpenChats(prev => {
            const newMap = new Map(prev);
            newMap.delete(conversationId);
            return newMap;
        });
    };

    // Update conversation data
    const updateConversation = (conversationId: number, updatedConversation: Conversation) => {
        setOpenChats(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(conversationId);
            if (existing) {
                newMap.set(conversationId, {
                    ...existing,
                    conversation: updatedConversation,
                });
            }
            return newMap;
        });
    };

    // Get conversation by ID
    const getConversation = (conversationId: number) => {
        return openChats.get(conversationId)?.conversation;
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    return {
        openChats: Array.from(openChats.values()),
        conversations,
        openChat,
        closeChat,
        updateConversation,
        getConversation,
        refetchConversations: fetchConversations,
    };
}
