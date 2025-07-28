import { AppShell } from '@/layouts/app/app-shell';
import Feed from '@/components/dashboard/feed';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import axios from 'axios';

interface GroupDetailProps {
  group: {
    id: number;
    name: string;
    cover?: string | null;
    members_count: number;
    visibility: string;
    is_member: boolean;
    membership_status: string | null;
    is_admin: boolean;
    members: { id: number; name: string; profile_pic: string | null }[];
  };
}

export default function GroupDetail({ group }: GroupDetailProps) {
  const { data, setData, post, processing, errors, reset } = useForm({ cover: null as File | null });
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const { show: showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('cover', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('groups.cover', group.id), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setPreview(null);
        window.location.reload();
      },
    });
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    try {
      const response = await axios.post(`/groups/${group.id}/join`);
      if (response.data.success) {
        showToast('Successfully joined the group');
        window.location.reload(); // Refresh to update the UI
      } else {
        showToast(response.data.message || 'Failed to join group');
      }
    } catch (error) {
      showToast('Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-60 bg-gray-200">
          <img
            src={preview || group.cover || '/images/cover-image-placeholder.jpg'}
            alt="Group Cover"
            className="w-full h-full object-cover"
          />
          {/* Show upload button only for admin */}
          {group.is_admin && (
            <form onSubmit={handleUpload} className="absolute top-4 right-4 flex gap-2 items-center bg-white/80 p-2 rounded shadow">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={processing}>
                {preview ? 'Change' : 'Upload Cover'}
              </Button>
              {preview && (
                <Button type="submit" variant="primary" size="sm" disabled={processing}>
                  {processing ? 'Saving...' : 'Save'}
                </Button>
              )}
            </form>
          )}
        {/* End upload UI */}
          <div className="absolute left-8 -bottom-12 flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-900 bg-white px-6 py-2 rounded shadow">
              {group.name}
            </div>
            <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${group.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{group.visibility === 'public' ? 'Public' : 'Private'}</span>
          </div>
        </div>
        {/* Members Count */}
        <div className="flex items-center gap-4 px-8 pt-16 pb-4">
          <button type="button" className="text-lg font-semibold text-gray-700 hover:underline focus:outline-none" onClick={() => setMembersOpen(true)}>
            {group.members_count} Members
          </button>
        </div>
        {/* Members Popup */}
        <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
            </DialogHeader>
            <div className="divide-y max-h-96 overflow-y-auto">
              {group.members.length === 0 ? (
                <div className="py-4 text-center text-gray-500">No members yet.</div>
              ) : (
                group.members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 py-3">
                    <img src={member.profile_pic || '/images/profile-image-placeholder.jpg'} alt={member.name} className="w-10 h-10 rounded-full object-cover border" />
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
        {/* Feed or Join Button */}
        <div className="px-8 pb-8">
          {group.is_member ? (
            <Feed groupId={group.id} groupPrivacy={group.visibility} />
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Join this group</h3>
                  <p className="text-gray-500 mb-6">
                    {group.visibility === 'public'
                      ? 'Join this public group to see posts and interact with members.'
                      : 'This is a private group. You need to join to see posts and interact with members.'
                    }
                  </p>
                  <Button
                    onClick={handleJoinGroup}
                    disabled={joining}
                    className="w-full"
                  >
                    {joining ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining...
                      </>
                    ) : (
                      'Join Group'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
