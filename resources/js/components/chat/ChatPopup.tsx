import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePage, Link } from '@inertiajs/react';
import { useOnlineUsers } from '@/contexts/OnlineUsersContext';

interface Message {
    id: number;
    content: string;
    sender_name: string;
    sender_id: number;
    created_at: string;
    status: 'sent' | 'delivered' | 'seen';
}

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
    messages: Message[];
}

interface ChatPopupProps {
    conversation: Conversation;
    onClose: () => void;
    isOpen: boolean;
}

export function ChatPopup({ conversation, onClose, isOpen }: ChatPopupProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState(() => {
        if (conversation.messages) {
            return Array.isArray(conversation.messages)
                ? conversation.messages
                : Object.values(conversation.messages) as Message[];
        }
        return [];
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { auth } = usePage().props as any;
    const currentUser = auth?.user || { id: 1, name: 'Junaid Hassan' };
    const { isUserOnline } = useOnlineUsers();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Update messages when conversation changes
    useEffect(() => {
        console.log('Conversation messages:', conversation.messages);
        if (conversation.messages) {
            // Convert object to array if needed
            const messagesArray = Array.isArray(conversation.messages)
                ? conversation.messages
                : Object.values(conversation.messages) as Message[];
            setMessages(messagesArray);
        }
    }, [conversation.messages]);

    useEffect(() => {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }, [messages]);

    // Also scroll when component first mounts
    useEffect(() => {
        scrollToBottom();
    }, []);

    // Listen for new messages via Echo
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).Echo && isOpen) {
            const channel = (window as any).Echo.private(`conversation.${conversation.id}`);

            channel.listen('.message.sent', (e: any) => {
                console.log('New message received:', e);
                setMessages(prev => [...prev, {
                    id: e.id,
                    content: e.content,
                    sender_name: e.sender_name,
                    sender_id: e.sender_id,
                    created_at: e.created_at,
                    status: e.status,
                }]);
            });

            return () => {
                channel.stopListening('.message.sent');
                (window as any).Echo.leaveChannel(`conversation.${conversation.id}`);
            };
        }
    }, [conversation.id, isOpen]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const messageContent = newMessage.trim();

        try {
            const response = await fetch(`/conversations/${conversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ content: messageContent }),
            });

            if (response.ok) {
                setNewMessage('');
                // The new message will be added via Echo event
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSending) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                        {conversation.type === 'private' && conversation.participants.length > 0 ? (
                            <>
                                <AvatarImage
                                    src={conversation.participants.find(p => p.id !== 1)?.profile_pic}
                                    alt={conversation.name}
                                />
                                <AvatarFallback>
                                    {conversation.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </>
                        ) : (
                            <AvatarFallback>
                                {conversation.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <Link
                            href={`/settings/profile/${conversation.participants.find(p => p.id !== currentUser.id)?.id || 1}`}
                            className="font-semibold text-sm hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                        >
                            {conversation.name}
                        </Link>
                        <div className={`text-xs ${isUserOnline(conversation.participants.find(p => p.id !== currentUser.id)?.id || 0) ? 'text-green-600' : 'text-gray-500'}`}>
                            {isUserOnline(conversation.participants.find(p => p.id !== currentUser.id)?.id || 0) ? '● Online' : '○ Offline'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {Array.isArray(messages) && messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-sm px-4 py-3 rounded-lg ${
                                message.sender_id === currentUser.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                        >
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${
                                message.sender_id === currentUser.id ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                                {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                {message.sender_id === currentUser.id && (
                                    <span className="ml-2">
                                        {message.status === 'seen' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-900 px-3 py-2 rounded-lg border border-gray-200">
                            <div className="text-sm italic">typing...</div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t bg-gray-50 rounded-b-lg">
                <div className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isSending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
