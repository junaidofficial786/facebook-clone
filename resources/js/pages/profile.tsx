import { useState } from 'react';
import { Pencil, Camera, Users, Info, List, UserCircle2 } from 'lucide-react';

interface ProfilePageProps {
  user: {
    name: string;
    coverPhoto: string;
    profilePic: string;
    bio: string;
    email: string;
    gender: string;
    birthday: string;
    location: string;
    friends: Array<{ id: number; name: string; profilePic: string }>;
    groups: Array<{ id: number; name: string; cover: string }>;
    posts: Array<{ id: number; content: string; created_at: string }>;
  };
  isOwnProfile: boolean;
}

export function ProfilePage({ user, isOwnProfile }: ProfilePageProps) {
  const [tab, setTab] = useState('posts');

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-60 bg-gray-200">
        <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        {isOwnProfile && (
          <button className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2" title="Edit cover photo">
            <Camera className="w-5 h-5" />
          </button>
        )}
        {/* Profile Pic */}
        <div className="absolute left-8 -bottom-16 flex items-end">
          <div className="relative">
            <img src={user.profilePic} alt="Profile" className="w-36 h-36 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5" title="Edit profile picture">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Name, Bio, Edit Bio */}
      <div className="pt-20 pb-4 px-8 flex flex-col md:flex-row md:items-center md:justify-between border-b">
        <div>
          <div className="text-2xl font-bold text-gray-900">{user.name}</div>
          <div className="flex items-center gap-2 mt-2 text-gray-700">
            <span>{user.bio}</span>
            {isOwnProfile && (
              <button className="ml-2 text-blue-600 hover:text-blue-800" title="Edit bio">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="px-8 pt-2 bg-white sticky top-0 z-10 border-b">
        <div className="flex gap-6 text-gray-600 font-semibold text-base">
          <button className={`py-3 border-b-2 transition-all ${tab === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`} onClick={() => setTab('posts')}><List className="inline w-5 h-5 mr-1" />Posts</button>
          <button className={`py-3 border-b-2 transition-all ${tab === 'friends' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`} onClick={() => setTab('friends')}><Users className="inline w-5 h-5 mr-1" />Friends</button>
          <button className={`py-3 border-b-2 transition-all ${tab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`} onClick={() => setTab('info')}><Info className="inline w-5 h-5 mr-1" />Information</button>
          <button className={`py-3 border-b-2 transition-all ${tab === 'groups' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`} onClick={() => setTab('groups')}><UserCircle2 className="inline w-5 h-5 mr-1" />Groups Joined</button>
        </div>
      </div>
      {/* Tab Content */}
      <div className="px-8 py-6 min-h-[300px] bg-gray-50">
        {tab === 'posts' && (
          <div className="space-y-4">
            {user.posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="text-gray-800">{post.content}</div>
                <div className="text-xs text-gray-500 mt-2">{post.created_at}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'friends' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.friends.map(friend => (
              <div key={friend.id} className="flex flex-col items-center bg-white rounded-lg shadow p-4 border">
                <img src={friend.profilePic} alt={friend.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                <div className="font-medium text-gray-800">{friend.name}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'info' && (
          <div className="space-y-2 text-gray-700">
            <div><span className="font-semibold">Email:</span> {user.email}</div>
            <div><span className="font-semibold">Gender:</span> {user.gender}</div>
            <div><span className="font-semibold">Birthday:</span> {user.birthday}</div>
            <div><span className="font-semibold">Location:</span> {user.location}</div>
          </div>
        )}
        {tab === 'groups' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.groups.map(group => (
              <div key={group.id} className="flex flex-col items-center bg-white rounded-lg shadow p-4 border">
                <img src={group.cover} alt={group.name} className="w-full h-20 object-cover rounded mb-2" />
                <div className="font-medium text-gray-800">{group.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
