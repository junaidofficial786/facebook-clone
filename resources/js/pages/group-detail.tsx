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
    pending_requests_count: number;
    members: { id: number; name: string; profile_pic: string | null }[];
  };
}

interface PendingRequest {
  id: number;
  user_id: number;
  name: string;
  profile_pic: string | null;
  requested_at: string;
}

export default function GroupDetail({ group }: GroupDetailProps) {
  const { data, setData, post, processing, errors, reset } = useForm({ cover: null as File | null });
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [pendingRequestsOpen, setPendingRequestsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
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
        showToast('Join request sent successfully');
        window.location.reload(); // Refresh to update the UI
      } else {
        showToast(response.data.message || 'Failed to send join request');
      }
    } catch (error) {
      showToast('Failed to send join request');
    } finally {
      setJoining(false);
    }
  };

  const loadPendingRequests = async () => {
    if (!group.is_admin) return;

    setLoadingRequests(true);
    try {
      const response = await axios.get(`/groups/${group.id}/pending-requests`);
      if (response.data.success) {
        setPendingRequests(response.data.pending_requests);
      }
    } catch (error) {
      showToast('Failed to load pending requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (memberId: number) => {
    setProcessingRequest(memberId);
    try {
      const response = await axios.post(`/groups/${group.id}/approve-request`, {
        member_id: memberId
      });
      if (response.data.success) {
        showToast('Request approved successfully');
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(req => req.id !== memberId));
        // Update count
        window.location.reload();
      } else {
        showToast(response.data.message || 'Failed to approve request');
      }
    } catch (error) {
      showToast('Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (memberId: number) => {
    setProcessingRequest(memberId);
    try {
      const response = await axios.post(`/groups/${group.id}/reject-request`, {
        member_id: memberId
      });
      if (response.data.success) {
        showToast('Request rejected successfully');
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(req => req.id !== memberId));
      } else {
        showToast(response.data.message || 'Failed to reject request');
      }
    } catch (error) {
      showToast('Failed to reject request');
    } finally {
      setProcessingRequest(null);
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
                              <Button type="submit" variant="default" size="sm" disabled={processing}>
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
        {/* Members Count and Pending Requests */}
        <div className="flex items-center gap-4 px-8 pt-16 pb-4">
          <button type="button" className="text-lg font-semibold text-gray-700 hover:underline focus:outline-none" onClick={() => setMembersOpen(true)}>
            {group.members_count} Members
          </button>
          {group.is_admin && group.pending_requests_count > 0 && (
            <button
              type="button"
              className="text-lg font-semibold text-blue-600 hover:text-blue-700 focus:outline-none bg-blue-50 px-3 py-1 rounded-full"
              onClick={() => {
                loadPendingRequests();
                setPendingRequestsOpen(true);
              }}
            >
              {group.pending_requests_count} Pending Request{group.pending_requests_count > 1 ? 's' : ''}
            </button>
          )}
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
        {/* Pending Requests Popup */}
        <Dialog open={pendingRequestsOpen} onOpenChange={setPendingRequestsOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Pending Join Requests</DialogTitle>
            </DialogHeader>
            <div className="divide-y max-h-96 overflow-y-auto">
              {loadingRequests ? (
                <div className="py-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading requests...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="py-4 text-center text-gray-500">No pending requests.</div>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.profile_pic || '/images/profile-image-placeholder.jpg'}
                        alt={request.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <span className="font-medium text-gray-900">{request.name}</span>
                        <p className="text-xs text-gray-500">
                          Requested {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processingRequest === request.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {processingRequest === request.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
                {/* Feed or Join Button */}
        <div className="px-8 pb-8">
          {group.is_member ? (
            <Feed groupId={group.id} groupPrivacy={group.visibility} isGroupMember={true} membershipStatus={group.membership_status} />
          ) : group.membership_status === 'pending' ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 rounded-lg p-8 border-2 border-dashed border-blue-300">
                  <div className="text-blue-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Request Sent</h3>
                  <p className="text-blue-700 mb-6">
                    Your join request has been sent to the group admin. You'll be notified when your request is approved.
                  </p>
                  <Button
                    disabled
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 bg-blue-50"
                  >
                    Request Pending
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Request to join this group</h3>
                  <p className="text-gray-500 mb-6">
                    {group.visibility === 'public'
                      ? 'Send a request to join this public group. The admin will review your request.'
                      : 'Send a request to join this private group. The admin will review your request.'
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
                        Sending Request...
                      </>
                    ) : (
                      'Send Join Request'
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
