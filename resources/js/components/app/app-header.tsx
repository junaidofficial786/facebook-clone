import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Home,
    PlaySquare,
    Users,
    UsersRound,
    Gamepad2,
    MessageCircle,
    Bell,
    Settings,
    LogOut,
    User,
    KeyRound,
    Paintbrush,
} from 'lucide-react';
import { usePage, Link } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { useConversations } from '@/hooks/use-conversations';
import { useChatManager } from '@/hooks/use-chat-manager';
import { ChatPopup } from '@/components/chat/ChatPopup';
import.meta.env;

export function AppHeader() {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const appName = import.meta.env.VITE_APP_NAME || 'FacebookClone';
    const { conversations, loading } = useConversations();
    const { openChats, openChat, closeChat } = useChatManager();

    const isFeedActive = typeof window !== 'undefined' && window.location.pathname.startsWith('/feed');
    const isGroupsActive = typeof window !== 'undefined' && window.location.pathname.startsWith('/groups');
    const isPeopleActive = typeof window !== 'undefined' && window.location.pathname.startsWith('/people');

    // Dummy data for messages and notifications
    const dummyMessages = [
        {
            id: 1,
            name: 'Alice Smith',
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            lastMessage: 'Hey, how are you?',
        },
        {
            id: 2,
            name: 'John Doe',
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            lastMessage: 'Let’s catch up soon!',
        },
        {
            id: 3,
            name: 'Sara Khan',
            image: 'https://randomuser.me/api/portraits/women/22.jpg',
            lastMessage: 'Sent you the files.',
        },
    ];
    const dummyNotifications = [
        {
            id: 1,
            text: 'Ali Raza liked your post.',
        },
        {
            id: 2,
            text: 'You have a new friend request from Sara Khan.',
        },
        {
            id: 3,
            text: 'Your group event is starting soon.',
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
            <div className="mx-auto flex h-16 items-center gap-2 px-4 md:max-w-7xl">
                {/* Left: Logo */}
                <Link href={route('dashboard')} className="flex items-center mr-2">
                    {/* <AppLogoIcon className="h-8 w-8 text-blue-600" /> */}
                    <span className="text-2xl font-extrabold italic tracking-wide bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent drop-shadow-sm select-none">
                        {appName}
                    </span>
                </Link>

                {/* Search Box */}
                <div className="hidden md:flex flex-1 max-w-xs ml-2">
                    <Input type="text" placeholder="Search Facebook" className="bg-muted border-border focus:border-primary" />
                </div>

                {/* Center: Navigation Icons */}
                <nav className="flex flex-1 justify-center gap-6">
                    <Link
                        href={route('dashboard')}
                        className={
                            'group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-accent transition-colors ' +
                            (isFeedActive ? 'bg-accent text-primary' : '')
                        }
                        title="Home"
                    >
                        <Home className={
                            'h-6 w-6 ' + (isFeedActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')
                        } />
                    </Link>
                    <Link
                        href="/people"
                        className={
                            'group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-accent transition-colors ' +
                            (isPeopleActive ? 'bg-accent text-primary' : '')
                        }
                        title="People"
                    >
                        <Users className={
                            'h-6 w-6 ' + (isPeopleActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')
                        } />
                    </Link>
                    <button className="group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-accent transition-colors" title="Videos">
                        <PlaySquare className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </button>
                    <Link
                        href={route('groups')}
                        className={
                            'group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-accent transition-colors ' +
                            (isGroupsActive ? 'bg-accent text-primary' : '')
                        }
                        title="Groups"
                    >
                        <UsersRound className={
                            'h-6 w-6 ' + (isGroupsActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')
                        } />
                    </Link>
                    <button className="group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-accent transition-colors" title="Games">
                        <Gamepad2 className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </button>
                </nav>

                {/* Right: Messages, Notifications, Profile */}
                <div className="flex items-center gap-2 ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative rounded-full p-2 hover:bg-accent transition-colors">
                                <MessageCircle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 mt-2">
                            <div className="font-semibold px-3 py-2 text-foreground border-b">Messages</div>
                                                        {loading ? (
                                <div className="px-3 py-4 text-muted-foreground text-sm">Loading...</div>
                            ) : conversations.length > 0 ? (
                                conversations.slice(0, 5).map(conversation => (
                                    <DropdownMenuItem
                                        key={conversation.id}
                                        className="flex items-center gap-3 py-2 cursor-pointer"
                                        onClick={() => openChat(conversation.id)}
                                    >
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback>
                                                {conversation.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate text-foreground">
                                                {conversation.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {conversation.last_message ? (
                                                    <>
                                                        <span className="font-medium">{conversation.last_message.sender_name}: </span>
                                                        {conversation.last_message.content}
                                                    </>
                                                ) : 'No messages yet'}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-muted-foreground text-sm">No conversations</div>
                            )}
                            {conversations.length > 5 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                                    View all conversations
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Chat Popups */}
                    {openChats.map((openChat) => (
                        <ChatPopup
                            key={openChat.conversation.id}
                            conversation={openChat.conversation}
                            onClose={() => closeChat(openChat.conversation.id)}
                            isOpen={true}
                        />
                    ))}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative rounded-full p-2 hover:bg-accent transition-colors">
                                <Bell className="h-6 w-6 text-muted-foreground hover:text-primary" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 mt-2">
                            <div className="font-semibold px-3 py-2 text-foreground border-b">Notifications</div>
                            {dummyNotifications.map(n => (
                                <DropdownMenuItem key={n.id} className="py-2">
                                    <div className="text-sm text-foreground">{n.text}</div>
                                </DropdownMenuItem>
                            ))}
                            {dummyNotifications.length === 0 && (
                                <div className="px-3 py-4 text-muted-foreground text-sm">No notifications</div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="ml-2 rounded-full border-2 border-transparent hover:border-primary focus:outline-none focus:border-primary transition-colors">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={auth?.user?.profile_pic} alt={auth?.user?.name} />
                                    <AvatarFallback>{getInitials(auth?.user?.name)}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 mt-2">
                            <DropdownMenuItem asChild>
                                <Link href="/settings/profile" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/password" className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4" />
                                    Password
                                </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem asChild>
                                <Link href="/settings/appearance" className="flex items-center gap-2">
                                    <Paintbrush className="h-4 w-4" />
                                    Appearance
                                </Link>
                            </DropdownMenuItem> */}
                            <DropdownMenuItem asChild>
                                <Link href="/logout" method="post" as="button" className="flex items-center gap-2 block w-full">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
