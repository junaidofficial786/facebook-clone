<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConversationController extends Controller
{
            /**
     * Get all conversations for the authenticated user (inbox)
     */
    public function index()
    {
        $user = Auth::user();

        // Get all conversations where user is a participant
        $conversations = Conversation::whereHas('conversationParticipants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with([
            'lastMessage.user', // Get the sender of the last message
            'conversationParticipants.user', // Get all participants
            'creator' // Get conversation creator
        ])
        ->orderBy('updated_at', 'desc') // Most recent conversations first
        ->get()
        ->map(function ($conversation) use ($user) {
            // Get other participants (excluding current user)
            $otherParticipants = $conversation->conversationParticipants
                ->where('user_id', '!=', $user->id)
                ->pluck('user');

            // For private conversations, get the other user's name
            $conversationName = $conversation->name;
            if ($conversation->type === 'private' && $otherParticipants->count() > 0) {
                $conversationName = $otherParticipants->first()->name;
            }

            // Get receiver information for last message
            $lastMessageReceiver = null;
            if ($conversation->lastMessage) {
                if ($conversation->type === 'private') {
                    // For private: other participant is the receiver
                    $lastMessageReceiver = $otherParticipants->first();
                } else {
                    // For group: all participants except sender are receivers
                    $receivers = $conversation->conversationParticipants
                        ->where('user_id', '!=', $conversation->lastMessage->user_id)
                        ->pluck('user');
                    $lastMessageReceiver = $receivers->first(); // Show first receiver for display
                }
            }

            return [
                'id' => $conversation->id,
                'type' => $conversation->type,
                'name' => $conversationName,
                'last_message' => $conversation->lastMessage ? [
                    'id' => $conversation->lastMessage->id,
                    'content' => $conversation->lastMessage->content,
                    'sender_name' => $conversation->lastMessage->user->name,
                    'sender_id' => $conversation->lastMessage->user_id,
                    'receiver_name' => $lastMessageReceiver ? $lastMessageReceiver->name : null,
                    'receiver_id' => $lastMessageReceiver ? $lastMessageReceiver->id : null,
                    'created_at' => $conversation->lastMessage->created_at,
                    'status' => $conversation->lastMessage->status,
                ] : null,
                'participants' => $conversation->conversationParticipants->map(function ($participant) {
                    return [
                        'id' => $participant->user->id,
                        'name' => $participant->user->name,
                        'profile_pic' => $participant->user->profile_pic,
                        'role' => $participant->role,
                    ];
                }),
                'created_at' => $conversation->created_at,
                'updated_at' => $conversation->updated_at,
            ];
        });

        // Check if request wants JSON (for inbox dropdown)
        if (request()->wantsJson()) {
            return response()->json([
                'conversations' => $conversations,
            ]);
        }

        return Inertia::render('Conversations/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get conversations for inbox dropdown (API endpoint)
     */
    public function apiIndex()
    {
        $user = Auth::user();

        // Get all conversations where user is a participant
        $conversations = Conversation::whereHas('conversationParticipants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with([
            'lastMessage.user', // Get the sender of the last message
            'conversationParticipants.user', // Get all participants
            'creator' // Get conversation creator
        ])
        ->orderBy('updated_at', 'desc') // Most recent conversations first
        ->get()
        ->map(function ($conversation) use ($user) {
            // Get other participants (excluding current user)
            $otherParticipants = $conversation->conversationParticipants
                ->where('user_id', '!=', $user->id)
                ->pluck('user');

            // For private conversations, get the other user's name
            $conversationName = $conversation->name;
            if ($conversation->type === 'private' && $otherParticipants->count() > 0) {
                $conversationName = $otherParticipants->first()->name;
            }

            // Get receiver information for last message
            $lastMessageReceiver = null;
            if ($conversation->lastMessage) {
                if ($conversation->type === 'private') {
                    // For private: other participant is the receiver
                    $lastMessageReceiver = $otherParticipants->first();
                } else {
                    // For group: all participants except sender are receivers
                    $receivers = $conversation->conversationParticipants
                        ->where('user_id', '!=', $conversation->lastMessage->user_id)
                        ->pluck('user');
                    $lastMessageReceiver = $receivers->first(); // Show first receiver for display
                }
            }

            return [
                'id' => $conversation->id,
                'type' => $conversation->type,
                'name' => $conversationName,
                'last_message' => $conversation->lastMessage ? [
                    'id' => $conversation->lastMessage->id,
                    'content' => $conversation->lastMessage->content,
                    'sender_name' => $conversation->lastMessage->user->name,
                    'sender_id' => $conversation->lastMessage->user_id,
                    'receiver_name' => $lastMessageReceiver ? $lastMessageReceiver->name : null,
                    'receiver_id' => $lastMessageReceiver ? $lastMessageReceiver->id : null,
                    'created_at' => $conversation->lastMessage->created_at,
                    'status' => $conversation->lastMessage->status,
                ] : null,
                'participants' => $conversation->conversationParticipants->map(function ($participant) {
                    return [
                        'id' => $participant->user->id,
                        'name' => $participant->user->name,
                        'profile_pic' => $participant->user->profile_pic,
                        'role' => $participant->role,
                    ];
                }),
                'created_at' => $conversation->created_at,
                'updated_at' => $conversation->updated_at,
            ];
        });

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get a specific conversation with its messages
     */
    public function show($id)
    {
        $user = Auth::user();

        $conversation = Conversation::whereHas('conversationParticipants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with([
            'messages.user',
            'conversationParticipants.user',
            'creator'
        ])
        ->findOrFail($id);

        // Get other participants
        $otherParticipants = $conversation->conversationParticipants
            ->where('user_id', '!=', $user->id)
            ->pluck('user');

        $conversationName = $conversation->name;
        if ($conversation->type === 'private' && $otherParticipants->count() > 0) {
            $conversationName = $otherParticipants->first()->name;
        }

                $conversationData = [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversationName,
            'participants' => $conversation->conversationParticipants->map(function ($participant) {
                return [
                    'id' => $participant->user->id,
                    'name' => $participant->user->name,
                    'role' => $participant->role,
                ];
            }),
            'messages' => $conversation->messages->map(function ($message) use ($conversation) {
                // Get receivers for this message
                $receivers = $conversation->conversationParticipants
                    ->where('user_id', '!=', $message->user_id)
                    ->pluck('user');

                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'sender_name' => $message->user->name,
                    'sender_id' => $message->user_id,
                    'receivers' => $receivers->map(function ($receiver) {
                        return [
                            'id' => $receiver->id,
                            'name' => $receiver->name,
                        ];
                    }),
                    'created_at' => $message->created_at,
                    'status' => $message->status,
                ];
            }),
        ];

        // Check if request wants JSON (for chat popup)
        if (request()->wantsJson()) {
            return response()->json([
                'conversation' => $conversationData,
            ]);
        }

        return Inertia::render('Conversations/Show', [
            'conversation' => $conversationData,
        ]);
    }

    /**
     * Create a new private conversation
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $otherUserId = $request->user_id;

        // Check if conversation already exists
        $existingConversation = Conversation::where('type', 'private')
            ->whereHas('conversationParticipants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereHas('conversationParticipants', function ($query) use ($otherUserId) {
                $query->where('user_id', $otherUserId);
            })
            ->first();

        if ($existingConversation) {
            return redirect()->route('conversations.show', $existingConversation->id);
        }

        // Create new conversation
        $conversation = Conversation::create([
            'type' => 'private',
            'created_by' => $user->id,
        ]);

        // Add participants
        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $otherUserId,
            'role' => 'member',
        ]);

        return redirect()->route('conversations.show', $conversation->id);
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        $conversation = Conversation::whereHas('conversationParticipants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($id);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'content' => $request->content,
            'status' => 'sent',
        ]);

        // Load the user relationship for broadcasting
        $message->load('user');

        // Broadcast the message event
        broadcast(new MessageSent($message))->toOthers();

        // The last_message_id will be automatically updated by the model event

        return back();
    }
}
