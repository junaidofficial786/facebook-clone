import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';

interface SuggestedPerson {
  id: number;
  name: string;
  profile_pic?: string;
}

interface Friend {
  id: number;
  name: string;
  profile_pic?: string;
}

export default function RightColumn() {
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [sendingRequests, setSendingRequests] = useState<{ [key: number]: boolean }>({});
  const { show: showToast } = useToast();

  const fetchSuggestedPeople = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suggested-people?limit=5');
      if (response.data.success) {
        setSuggestedPeople(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suggested people:', error);
      showToast('Failed to load suggested people');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);
      const response = await axios.get('/api/friends');
      if (response.data.success) {
        setFriends(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      showToast('Failed to load friends');
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedPeople();
    fetchFriends();
  }, []);

  const handleSendFriendRequest = async (personId: number) => {
    setSendingRequests(prev => ({ ...prev, [personId]: true }));
    try {
      const response = await axios.post('/api/friend-request', {
        friend_id: personId
      });

      if (response.data.success) {
        showToast('Friend request sent successfully');
        // Remove the person from the list after sending request
        setSuggestedPeople(prev => prev.filter(person => person.id !== personId));
      } else {
        showToast(response.data.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      showToast('Failed to send friend request');
    } finally {
      setSendingRequests(prev => ({ ...prev, [personId]: false }));
    }
  };

  const getProfileImage = (person: SuggestedPerson | Friend) => {
    if (person.profile_pic) {
      return person.profile_pic;
    }
    return '/images/profile-image-placeholder.jpg';
  };

    return (
    <div className="space-y-6">
      {/* People You May Know Section */}
      <Card>
        <CardHeader>
          <CardTitle>People You May Know</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading...
            </div>
          ) : suggestedPeople.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No suggestions available
            </div>
          ) : (
            suggestedPeople.map(person => (
              <div key={person.id} className="flex items-center gap-3">
                <Link href={`/settings/profile/${person.id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
                  <Avatar>
                    <AvatarImage src={getProfileImage(person)} alt={person.name} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 font-medium truncate">{person.name}</div>
                </Link>
                <Button
                  size="sm"
                  onClick={() => handleSendFriendRequest(person.id)}
                  disabled={sendingRequests[person.id]}
                >
                  {sendingRequests[person.id] ? 'Sending...' : 'Add Friend'}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Your Friends Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {friendsLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading...
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No friends yet
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-3">
              {friends.map(friend => (
                <Link
                  key={friend.id}
                  href={`/settings/profile/${friend.id}`}
                  className="flex items-center gap-3 hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={getProfileImage(friend)} alt={friend.name} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="font-medium truncate">{friend.name}</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
