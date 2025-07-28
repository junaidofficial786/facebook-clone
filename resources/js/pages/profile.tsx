import { useState, useRef } from 'react';
import { Pencil, Camera, Users, Info, List, UserCircle2, Upload, X, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import LoaderOverlay from '@/components/ui/loader';
import Feed from '@/components/dashboard/feed';
import { usePage } from '@inertiajs/react';
import { useParams } from 'react-router-dom';
import { Link } from '@inertiajs/react';

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
        friends: Array<{ id: number; name: string; profilePic: string; friendship_id: number }>;
        groups: Array<{ id: number; name: string; cover: string; members_count: number }>;
        posts: Array<{ id: number; content: string; created_at: string }>;
    };
    isOwnProfile: boolean;
}

export function ProfilePage({ user, isOwnProfile }: ProfilePageProps) {
    const [tab, setTab] = useState('posts');
    // Profile image upload state
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);
    // Cover image upload state
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [editingBio, setEditingBio] = useState(false);
    const [bioInput, setBioInput] = useState(user.bio);
    const [editingInfo, setEditingInfo] = useState(false);
    const [infoInput, setInfoInput] = useState({
        email: user.email,
        gender: user.gender,
        birthday: user.birthday,
        location: user.location,
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingCover, setLoadingCover] = useState(false);
    const [loadingBio, setLoadingBio] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [unfriending, setUnfriending] = useState<number | null>(null);

    const { show: showToast } = useToast();

    let urlUserId: number | undefined = undefined;
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      // Try to get the last segment if it's a number
      const lastPart = pathParts[pathParts.length - 1];
      const parsed = parseInt(lastPart, 10);
      if (!isNaN(parsed)) urlUserId = parsed;
    }
    const authUserId = usePage().props.auth?.user?.id;
    const userIdToShow = urlUserId !== undefined ? urlUserId : authUserId;

    const showCreatePost = userIdToShow === authUserId;

    // Handlers for profile image
    const handleProfileEdit = () => profileInputRef.current?.click();
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB
                showToast('Profile photo must be 2MB or less.');
                if (profileInputRef.current) profileInputRef.current.value = '';
                return;
            }
            setProfileFile(file);
            setProfilePreview(URL.createObjectURL(file));
        }
    };
    const handleProfileCancel = () => {
        setProfileFile(null);
        setProfilePreview(null);
        if (profileInputRef.current) profileInputRef.current.value = '';
    };

    const csrfToken = (typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]'))
    ? (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content
    : '';

    const handleProfileSave = async () => {
        if (!profileFile) return;
        setLoadingProfile(true);
        const formData = new FormData();
        formData.append('type', 'profile');
        formData.append('photo', profileFile);
        const res = await fetch('/settings/profile/photo', {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRF-TOKEN': csrfToken },
        });
        const data = await res.json();
        setLoadingProfile(false);
        if (data.success) {
            setProfilePreview(null);
            setProfileFile(null);
            showToast('Profile photo updated successfully!');
            // Optionally: reload or update image in state
            window.location.reload();
        }
    };

    // Handlers for cover image
    const handleCoverEdit = () => coverInputRef.current?.click();
    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showToast('Cover photo must be 5MB or less.');
                if (coverInputRef.current) coverInputRef.current.value = '';
                return;
            }
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };
    const handleCoverCancel = () => {
        setCoverFile(null);
        setCoverPreview(null);
        if (coverInputRef.current) coverInputRef.current.value = '';
    };

    const handleCoverSave = async () => {
        if (!coverFile) return;
        setLoadingCover(true);
        const formData = new FormData();
        formData.append('type', 'cover');
        formData.append('photo', coverFile);
        const res = await fetch('/settings/profile/photo', {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRF-TOKEN': csrfToken },
        });
        const data = await res.json();
        setLoadingCover(false);
        if (data.success) {
            setCoverPreview(null);
            setCoverFile(null);
            showToast('Cover photo updated successfully!');
            window.location.reload();
        }
    };

    const handleBioEdit = () => {
        setEditingBio(true);
        setBioInput(user.bio);
    };
    const handleBioCancel = () => {
        setEditingBio(false);
        setBioInput(user.bio);
    };
    const handleBioSave = async () => {
        setLoadingBio(true);
        const res = await fetch('/settings/profile/bio', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ bio: bioInput }),
        });
        const data = await res.json();
        setLoadingBio(false);
        if (data.success) {
            setEditingBio(false);
            showToast('Bio updated successfully!');
            window.location.reload();
        }
    };

    const handleInfoEdit = () => {
        setEditingInfo(true);
        setInfoInput({
            email: user.email,
            gender: user.gender,
            birthday: user.birthday,
            location: user.location,
        });
    };
    const handleInfoCancel = () => {
        setEditingInfo(false);
        setInfoInput({
            email: user.email,
            gender: user.gender,
            birthday: user.birthday,
            location: user.location,
        });
    };
    const handleInfoSave = async () => {
        setLoadingInfo(true);
        const payload = {
            ...infoInput,
            birthday: infoInput.birthday ? infoInput.birthday.slice(0, 10) : '', // Ensures YYYY-MM-DD
        };
        const res = await fetch('/settings/profile/info', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        setLoadingInfo(false);
        if (data.success) {
            setEditingInfo(false);
            showToast('Information updated successfully!');
            window.location.reload();
        }
    };

    const handleUnfriend = async (friendshipId: number, friendName: string) => {
        if (!confirm(`Are you sure you want to unfriend ${friendName}?`)) {
            return;
        }

        setUnfriending(friendshipId);
        try {
            const res = await fetch('/settings/profile/unfriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ friendship_id: friendshipId }),
            });
            const data = await res.json();

            if (data.success) {
                showToast('Friend removed successfully');
                window.location.reload(); // Refresh to update the friends list
            } else {
                showToast('Failed to remove friend');
            }
        } catch (error) {
            showToast('Failed to remove friend');
        } finally {
            setUnfriending(null);
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
            {(loadingProfile || loadingCover || loadingBio || loadingInfo) && <LoaderOverlay />}
            {/* Cover Photo */}
            <div className="relative h-60 bg-gray-200">
                <img src={coverPreview || user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                {isOwnProfile && (
                    <>
                        <button className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2" title="Edit cover photo" onClick={handleCoverEdit}>
                            <Camera className="w-5 h-5" />
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                        />
                        {coverPreview && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow" onClick={handleCoverSave} title="Save cover photo"><Check className="w-5 h-5" /></button>
                                <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow" onClick={handleCoverCancel} title="Cancel"><X className="w-5 h-5" /></button>
                            </div>
                        )}
                    </>
                )}
                {/* Profile Pic and Name */}
                <div className="absolute left-8 -bottom-16 flex items-center">
                    <div className="relative">
                        <img src={profilePreview || user.profilePic} alt="Profile" className="w-36 h-36 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
                        {isOwnProfile && (
                            <>
                                <button className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5" title="Edit profile picture" onClick={handleProfileEdit}>
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={profileInputRef}
                                    onChange={handleProfileChange}
                                />
                                {profilePreview && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow" onClick={handleProfileSave} title="Save profile photo"><Check className="w-5 h-5" /></button>
                                        <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow" onClick={handleProfileCancel} title="Cancel"><X className="w-5 h-5" /></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="ml-6">
                        <div className="text-2xl mt-14 font-bold text-gray-900">{user.name}</div>
                    </div>
                </div>
            </div>
            {/* Name, Bio, Edit Bio */}
            <div className="pt-20 pb-4 px-8 flex flex-col md:flex-row md:items-center md:justify-between border-b">
                <div>
                    {/* Name removed from here, only bio and edit bio remain */}
                    {/* <div className="text-2xl font-bold text-gray-900">{user.name}</div> */}
                    <div className="flex items-center gap-2 mt-2 text-gray-700">
                        {editingBio ? (
                            <>
                                <textarea
                                    className="border rounded px-2 py-1 text-sm min-w-[200px] max-w-[400px]"
                                    value={bioInput}
                                    onChange={e => setBioInput(e.target.value)}
                                    maxLength={500}
                                    rows={2}
                                />
                                <Button variant="default" size="sm" className="ml-2" onClick={handleBioSave}>Save</Button>
                                <Button variant="secondary" size="sm" className="ml-2" onClick={handleBioCancel}>Cancel</Button>
                            </>
                        ) : (
                            <>
                                <span>{user.bio}</span>
                                {isOwnProfile && (
                                    <button className="ml-2 text-blue-600 hover:text-blue-800" title="Edit bio" onClick={handleBioEdit}>
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                )}
                            </>
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
                    <div className="h-[600px] overflow-y-auto">
                        <Feed user_id={userIdToShow} showCreatePost={showCreatePost} />
                    </div>
                )}
                {tab === 'friends' && (
                    <div className="space-y-4">
                        {user.friends.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No friends yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.friends.map(friend => (
                                    <div key={friend.id} className="flex flex-col items-center bg-white rounded-lg shadow p-4 border">
                                        <Link href={`/settings/profile/${friend.id}`} className="flex flex-col items-center">
                                            <img src={friend.profilePic} alt={friend.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                                            <div className="font-medium text-gray-800 text-center mb-2 hover:text-blue-600 transition-colors">{friend.name}</div>
                                        </Link>
                                        {isOwnProfile && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUnfriend(friend.friendship_id, friend.name)}
                                                disabled={unfriending === friend.friendship_id}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                {unfriending === friend.friendship_id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                                        Removing...
                                                    </>
                                                ) : (
                                                    'Unfriend'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {tab === 'info' && (
                    <div className="space-y-2 text-gray-700">
                        {editingInfo ? (
                            <>
                                <div>
                                    <span className="font-semibold">Email:</span>
                                    <input
                                        type="email"
                                        className="border rounded px-2 py-1 ml-2 text-sm"
                                        value={infoInput.email}
                                        onChange={e => setInfoInput({ ...infoInput, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <span className="font-semibold">Gender:</span>
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 ml-2 text-sm"
                                        value={infoInput.gender}
                                        onChange={e => setInfoInput({ ...infoInput, gender: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <span className="font-semibold">Birthday:</span>
                                    <input
                                        type="date"
                                        className="border rounded px-2 py-1 ml-2 text-sm"
                                        value={infoInput.birthday}
                                        onChange={e => setInfoInput({ ...infoInput, birthday: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <span className="font-semibold">Location:</span>
                                    <input
                                        type="text"
                                        className="border rounded px-2 py-1 ml-2 text-sm"
                                        value={infoInput.location}
                                        onChange={e => setInfoInput({ ...infoInput, location: e.target.value })}
                                    />
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Button variant="default" size="sm" onClick={handleInfoSave}>Save</Button>
                                    <Button variant="secondary" size="sm" onClick={handleInfoCancel}>Cancel</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div><span className="font-semibold">Email:</span> {user.email}</div>
                                <div><span className="font-semibold">Gender:</span> {user.gender}</div>
                                <div><span className="font-semibold">Birthday:</span> {user.birthday}</div>
                                <div><span className="font-semibold">Location:</span> {user.location}</div>
                                {isOwnProfile && (
                                    <Button variant="secondary" size="sm" className="mt-2" onClick={handleInfoEdit}>Edit</Button>
                                )}
                            </>
                        )}
                    </div>
                )}
                {tab === 'groups' && (
                    <div className="space-y-4">
                        {user.groups.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <UserCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No groups joined yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.groups.map(group => (
                                    <div key={group.id} className="flex flex-col bg-white rounded-lg shadow p-4 border">
                                        <Link href={`/groups/${group.id}`} className="flex flex-col">
                                            <img src={group.cover} alt={group.name} className="w-full h-20 object-cover rounded mb-2" />
                                            <div className="font-medium text-gray-800 text-center mb-1 hover:text-blue-600 transition-colors">{group.name}</div>
                                            <div className="text-sm text-gray-500 text-center">{group.members_count} members</div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
