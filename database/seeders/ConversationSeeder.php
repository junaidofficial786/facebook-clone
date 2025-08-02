<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\ConversationParticipant;
use Illuminate\Support\Facades\DB;

class ConversationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();

        if ($users->count() < 2) {
            // Create some users if none exist
            User::factory(10)->create();
            $users = User::all();
        }

        $userIds = $users->pluck('id')->toArray();

        // Create private conversations between random pairs of users
        $this->createPrivateConversations($userIds);

        // Create group conversations
        $this->createGroupConversations($userIds);
    }

    private function createPrivateConversations($userIds)
    {
        $conversationsCreated = 0;
        $maxPrivateConversations = min(15, count($userIds) * 2); // Limit to avoid too many conversations

        for ($i = 0; $i < $maxPrivateConversations; $i++) {
            // Get two random users
            $user1Id = $userIds[array_rand($userIds)];
            $user2Id = $userIds[array_rand($userIds)];

            // Make sure we don't create conversation with same user
            if ($user1Id === $user2Id) {
                continue;
            }

            // Check if conversation already exists between these users
            $existingConversation = Conversation::where('type', 'private')
                ->whereHas('conversationParticipants', function ($query) use ($user1Id) {
                    $query->where('user_id', $user1Id);
                })
                ->whereHas('conversationParticipants', function ($query) use ($user2Id) {
                    $query->where('user_id', $user2Id);
                })
                ->first();

            if ($existingConversation) {
                continue; // Skip if conversation already exists
            }

            // Create private conversation
            $conversation = Conversation::create([
                'type' => 'private',
                'created_by' => $user1Id,
            ]);

            // Add participants
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user1Id,
                'role' => 'member',
            ]);

            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user2Id,
                'role' => 'member',
            ]);

            // Create messages for this conversation
            $this->createMessagesForConversation($conversation, [$user1Id, $user2Id]);

            $conversationsCreated++;
        }

        $this->command->info("Created {$conversationsCreated} private conversations");
    }

    private function createGroupConversations($userIds)
    {
        $groupNames = [
            'Project Team Alpha',
            'Friends Circle',
            'Study Group',
            'Work Colleagues',
            'Gaming Squad',
            'Book Club',
            'Travel Buddies',
            'Fitness Group'
        ];

        $conversationsCreated = 0;

        for ($i = 0; $i < 5; $i++) { // Create 5 group conversations
            // Get 3-6 random users for group
            $groupSize = rand(3, 6);
            $groupUserIds = array_rand(array_flip($userIds), $groupSize);

            if (count($groupUserIds) < 3) {
                continue;
            }

            $groupName = $groupNames[array_rand($groupNames)];
            $creatorId = $groupUserIds[array_rand($groupUserIds)];

            // Create group conversation
            $conversation = Conversation::create([
                'type' => 'group',
                'name' => $groupName,
                'created_by' => $creatorId,
            ]);

            // Add all participants
            foreach ($groupUserIds as $userId) {
                $role = ($userId === $creatorId) ? 'admin' : 'member';

                ConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $userId,
                    'role' => $role,
                ]);
            }

            // Create messages for this group conversation
            $this->createMessagesForConversation($conversation, $groupUserIds);

            $conversationsCreated++;
        }

        $this->command->info("Created {$conversationsCreated} group conversations");
    }

    private function createMessagesForConversation($conversation, $participantIds)
    {
        $messages = [
            'Hey! How are you doing?',
            'I\'m good, thanks! How about you?',
            'Pretty good! What\'s new?',
            'Not much, just working on some projects.',
            'That sounds interesting!',
            'Yeah, it\'s keeping me busy.',
            'We should catch up soon!',
            'Definitely! Let\'s plan something.',
            'How about this weekend?',
            'Sounds perfect to me!',
            'Great! I\'ll send you the details.',
            'Looking forward to it!',
            'Same here! See you then.',
            'Take care!',
            'You too! 👋',
            'Have a great day!',
            'Thanks, you too!',
            'What are your plans for today?',
            'Just some meetings and then free time.',
            'That sounds nice!',
            'What about you?',
            'Probably just relaxing at home.',
            'That sounds perfect!',
            'Yeah, I need some downtime.',
            'We all do sometimes!',
            'True that! 😊',
            'Well, talk to you later!',
            'Bye! Take care!',
            'See you soon!',
            'Until next time! 👋'
        ];

        $messageCount = rand(5, 15); // Create 5-15 messages per conversation
        $lastMessageId = null;

        for ($i = 0; $i < $messageCount; $i++) {
            $senderId = $participantIds[array_rand($participantIds)];
            $messageText = $messages[array_rand($messages)];

            // Add some variety to messages
            if (rand(1, 10) === 1) {
                $messageText = fake()->sentence();
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $senderId,
                'content' => $messageText,
                'status' => ['sent', 'delivered', 'seen'][array_rand(['sent', 'delivered', 'seen'])],
            ]);

            $lastMessageId = $message->id;
        }

        // Update conversation with last message ID
        if ($lastMessageId) {
            $conversation->update(['last_message_id' => $lastMessageId]);
        }
    }
}
