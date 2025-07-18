import AppLogoIcon from '@/components/app-logo-icon';
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
  Store,
  Users,
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

export function AppHeader() {
  const page = usePage();
  const { auth } = page.props;
  const getInitials = useInitials();

  // Determine if /feed is active
  const isFeedActive = typeof window !== 'undefined' && window.location.pathname.startsWith('/feed');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 items-center gap-2 px-4 md:max-w-7xl">
        {/* Left: Logo */}
        <Link href={route('dashboard')} className="flex items-center mr-2">
          <AppLogoIcon className="h-8 w-8 text-blue-600" />
        </Link>

        {/* Search Box */}
        <div className="hidden md:flex flex-1 max-w-xs ml-2">
          <Input type="text" placeholder="Search Facebook" className="bg-gray-100" />
        </div>

        {/* Center: Navigation Icons */}
        <nav className="flex flex-1 justify-center gap-6">
          <Link
            href={route('dashboard')}
            className={
              'group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-gray-100 ' +
              (isFeedActive ? 'bg-blue-50 text-blue-600' : '')
            }
          >
            <Home className={
              'h-6 w-6 ' + (isFeedActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600')
            } />
          </Link>
          <button className="group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-gray-100">
            <PlaySquare className="h-6 w-6 text-gray-700 group-hover:text-blue-600" />
          </button>
          <button className="group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-gray-100">
            <Store className="h-6 w-6 text-gray-700 group-hover:text-blue-600" />
          </button>
          <button className="group flex flex-col items-center justify-center px-3 py-1.5 rounded-md hover:bg-gray-100">
            <Users className="h-6 w-6 text-gray-700 group-hover:text-blue-600" />
          </button>
        </nav>

        {/* Right: Messages, Notifications, Profile */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="relative rounded-full p-2 hover:bg-gray-100">
            <MessageCircle className="h-6 w-6 text-gray-700" />
          </button>
          <button className="relative rounded-full p-2 hover:bg-gray-100">
            <Bell className="h-6 w-6 text-gray-700" />
          </button>
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 rounded-full border-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={auth?.user?.avatar} alt={auth?.user?.name} />
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
              <DropdownMenuItem asChild>
                <Link href="/settings/appearance" className="flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  Appearance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/logout" method="post" as="button" className="flex items-center gap-2">
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
