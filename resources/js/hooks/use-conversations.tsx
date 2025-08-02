import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface Conversation {
    id: number;
    type: 'private' | 'group';
    name: string;
    last_message?: {
        id: number;
        content: string;
        sender_name: string;
        sender_id: number;
        receiver_name?: string;
        receiver_id?: number;
        created_at: string;
        status: 'sent' | 'delivered' | 'seen';
    };
    participants: Array<{
        id: number;
        name: string;
        role: string;
    }>;
    created_at: string;
    updated_at: string;
}

export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            // Get CSRF token from meta tag
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/conversations', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin', // Include cookies for authentication
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            } else {
                console.error('Failed to fetch conversations:', response.status);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    return { conversations, loading, refetch: fetchConversations };
}
