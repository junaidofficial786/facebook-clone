import { useState, useRef, useEffect } from 'react';
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
        friendshipStatus?: string | null;
        friendshipId?: number | null;
        requestSentByMe?: boolean | null;
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
    const [sendingRequest, setSendingRequest] = useState(false);
    const [acceptingRequest, setAcceptingRequest] = useState(false);
    const [rejectingRequest, setRejectingRequest] = useState(false);
    // Add state for dynamic friendship status updates
    const [currentFriendshipStatus, setCurrentFriendshipStatus] = useState(user.friendshipStatus);
    const [currentFriendshipId, setCurrentFriendshipId] = useState(user.friendshipId);
    const [currentRequestSentByMe, setCurrentRequestSentByMe] = useState(user.requestSentByMe);
    // Add state for friends list to enable dynamic updates
    const [friendsList, setFriendsList] = useState(user.friends);

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

    // Sync friends list when user prop changes
    useEffect(() => {
        setFriendsList(user.friends);
    }, [user.friends]);

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
                // Update state dynamically instead of reloading
                setCurrentFriendshipStatus(null);
                setCurrentFriendshipId(null);
                setCurrentRequestSentByMe(null);
                // Remove the friend from the local friends list
                setFriendsList(prevFriends => prevFriends.filter(friend => friend.friendship_id !== friendshipId));
            } else {
                showToast('Failed to remove friend');
            }
        } catch (error) {
            showToast('Failed to remove friend');
        } finally {
            setUnfriending(null);
        }
    };

    const handleSendFriendRequest = async () => {
        setSendingRequest(true);
        try {
            const res = await fetch('/settings/profile/send-friend-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ friend_id: userIdToShow }),
            });
            const data = await res.json();

            if (data.success) {
                showToast('Friend request sent successfully');
                // Update state dynamically instead of reloading
                setCurrentFriendshipStatus('pending');
                setCurrentRequestSentByMe(true);
                setCurrentFriendshipId(data.friendship_id);
            } else {
                showToast(data.message || 'Failed to send friend request');
            }
        } catch (error) {
            showToast('Failed to send friend request');
        } finally {
            setSendingRequest(false);
        }
    };

    const handleAcceptFriendRequest = async () => {
        setAcceptingRequest(true);
        try {
            const res = await fetch('/settings/profile/accept-friend-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ friendship_id: currentFriendshipId }),
            });
            const data = await res.json();

            if (data.success) {
                showToast('Friend request accepted successfully');
                // Update state dynamically instead of reloading
                setCurrentFriendshipStatus('accepted');
                setCurrentRequestSentByMe(false);
            } else {
                showToast(data.message || 'Failed to accept friend request');
            }
        } catch (error) {
            showToast('Failed to accept friend request');
        } finally {
            setAcceptingRequest(false);
        }
    };

    const handleRejectFriendRequest = async () => {
        setRejectingRequest(true);
        try {
            const res = await fetch('/settings/profile/reject-friend-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ friendship_id: currentFriendshipId }),
            });
            const data = await res.json();

            if (data.success) {
                showToast('Friend request rejected successfully');
                // Update state dynamically instead of reloading
                setCurrentFriendshipStatus(null);
                setCurrentFriendshipId(null);
                setCurrentRequestSentByMe(null);
            } else {
                showToast(data.message || 'Failed to reject friend request');
            }
        } catch (error) {
            showToast('Failed to reject friend request');
        } finally {
            setRejectingRequest(false);
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-y-auto">
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
                <div className="absolute left-8 -bottom-20 flex items-end">
                    <div className="relative">
                        <img src={profilePreview || user.profilePic} alt="Profile" className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover bg-white" />
                        {isOwnProfile && (
                            <>
                                <button className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all duration-200" title="Edit profile picture" onClick={handleProfileEdit}>
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
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg transition-all duration-200" onClick={handleProfileSave} title="Save profile photo"><Check className="w-5 h-5" /></button>
                                        <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-all duration-200" onClick={handleProfileCancel} title="Cancel"><X className="w-5 h-5" /></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Name, Bio, and Friend Button Section */}
            <div className="pt-24 pb-6 px-8 border-b bg-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        {/* User Name */}
                        <div className="text-3xl font-bold text-gray-900 mb-3">{user.name}</div>

                        {/* Bio Section */}
                        <div className="flex items-start gap-2 text-gray-700">
                            {editingBio ? (
                                <div className="flex flex-col gap-2 w-full max-w-md">
                                    <textarea
                                        className="border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={bioInput}
                                        onChange={e => setBioInput(e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        placeholder="Write something about yourself..."
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="default" size="sm" onClick={handleBioSave}>
                                            {loadingBio ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save'
                                            )}
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={handleBioCancel}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-700 leading-relaxed">{user.bio || "No bio yet."}</span>
                                    {isOwnProfile && (
                                                                                <button
                                            className="text-primary hover:text-blue-700 transition-colors duration-200 p-1 rounded-full hover:bg-accent"
                                            title="Edit bio"
                                            onClick={handleBioEdit}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Friend Button - Only show if not own profile */}
                    {!isOwnProfile && (
                        <div className="flex-shrink-0">
                            {currentFriendshipStatus === 'accepted' ? (
                                <Button
                                    variant="outline"
                                    onClick={() => handleUnfriend(currentFriendshipId!, user.name)}
                                    disabled={unfriending === currentFriendshipId}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 px-6 py-2"
                                >
                                    {unfriending === currentFriendshipId ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                            Unfriending...
                                        </>
                                    ) : (
                                        'Unfriend'
                                    )}
                                </Button>
                            ) : currentFriendshipStatus === 'pending' ? (
                                currentRequestSentByMe ? (
                                    // I sent the request - show "Request Sent"
                                    <Button
                                        variant="outline"
                                        disabled
                                        className="text-gray-500 bg-gray-100 cursor-not-allowed px-6 py-2"
                                    >
                                        Request Sent
                                    </Button>
                                ) : (
                                    // I received the request - show Accept/Reject buttons
                                    <div className="flex gap-2">
                                                                                    <Button
                                                variant="default"
                                                onClick={handleAcceptFriendRequest}
                                                disabled={acceptingRequest}
                                                className="px-6 py-2"
                                            >
                                            {acceptingRequest ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Accepting...
                                                </>
                                            ) : (
                                                'Accept Request'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleRejectFriendRequest}
                                            disabled={rejectingRequest}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 px-6 py-2"
                                        >
                                            {rejectingRequest ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                                    Rejecting...
                                                </>
                                            ) : (
                                                'Reject'
                                            )}
                                        </Button>
                                    </div>
                                )
                            ) : (
                                                                    <Button
                                        variant="default"
                                        onClick={handleSendFriendRequest}
                                        disabled={sendingRequest}
                                        className="px-6 py-2"
                                    >
                                    {sendingRequest ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sending Request...
                                        </>
                                    ) : (
                                        'Add Friend'
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
                        {/* Tabs */}
            <div className="px-8 pt-4 bg-card sticky top-0 z-10 border-b shadow-sm">
                <div className="flex gap-8 text-muted-foreground font-medium text-base">
                    <button
                        className={`py-4 border-b-2 transition-all duration-200 hover:text-primary ${tab === 'posts' ? 'border-primary text-primary' : 'border-transparent hover:border-border'}`}
                        onClick={() => setTab('posts')}
                    >
                        <List className="inline w-5 h-5 mr-2" />
                        Posts
                    </button>
                                        <button
                        className={`py-4 border-b-2 transition-all duration-200 hover:text-primary ${tab === 'friends' ? 'border-primary text-primary' : 'border-transparent hover:border-border'}`}
                        onClick={() => setTab('friends')}
                    >
                        <Users className="inline w-5 h-5 mr-2" />
                        Friends
                    </button>
                    <button
                        className={`py-4 border-b-2 transition-all duration-200 hover:text-primary ${tab === 'info' ? 'border-primary text-primary' : 'border-transparent hover:border-border'}`}
                        onClick={() => setTab('info')}
                    >
                        <Info className="inline w-5 h-5 mr-2" />
                        Information
                    </button>
                    <button
                        className={`py-4 border-b-2 transition-all duration-200 hover:text-primary ${tab === 'groups' ? 'border-primary text-primary' : 'border-transparent hover:border-border'}`}
                        onClick={() => setTab('groups')}
                    >
                        <UserCircle2 className="inline w-5 h-5 mr-2" />
                        Groups Joined
                    </button>
                </div>
            </div>
            {/* Tab Content */}
            <div className="px-8 py-8 min-h-[400px] bg-gray-50">
                {tab === 'posts' && (
                    <div>
                        <Feed user_id={userIdToShow} showCreatePost={showCreatePost} />
                    </div>
                )}
                {tab === 'friends' && (
                    <div className="space-y-6">
                        {friendsList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No friends yet</p>
                                <p className="text-sm text-muted-foreground/70 mt-1">Start connecting with people!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {friendsList.map(friend => (
                                    <div key={friend.id} className="flex flex-col items-center bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-border">
                                        <Link href={`/settings/profile/${friend.id}`} className="flex flex-col items-center group">
                                            <img src={friend.profilePic} alt={friend.name} className="w-20 h-20 rounded-full object-cover mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-200" />
                                            <div className="font-semibold text-foreground text-center mb-3 group-hover:text-primary transition-colors">{friend.name}</div>
                                        </Link>
                                        {isOwnProfile && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUnfriend(friend.friendship_id, friend.name)}
                                                disabled={unfriending === friend.friendship_id}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 transition-all duration-200"
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
                    <div className="space-y-6">
                        {user.groups.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <UserCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No groups joined yet</p>
                                <p className="text-sm text-muted-foreground/70 mt-1">Join some groups to get started!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {user.groups.map(group => (
                                    <div key={group.id} className="flex flex-col bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-border">
                                        <Link href={`/groups/${group.id}`} className="flex flex-col group">
                                            <img src={group.cover} alt={group.name} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200" />
                                            <div className="p-4">
                                                <div className="font-semibold text-foreground text-center mb-2 group-hover:text-primary transition-colors">{group.name}</div>
                                                <div className="text-sm text-muted-foreground text-center">{group.members_count} members</div>
                                            </div>
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
