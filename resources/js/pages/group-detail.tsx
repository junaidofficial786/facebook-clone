import { AppShell } from '@/layouts/app/app-shell';
import Feed from '@/components/dashboard/feed';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface GroupDetailProps {
  group: {
    id: number;
    name: string;
    cover?: string | null;
    members_count: number;
    visibility: string; // Added visibility to the interface
  };
}

export default function GroupDetail({ group }: GroupDetailProps) {
  const { data, setData, post, processing, errors, reset } = useForm({ cover: null as File | null });
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          {/* Show upload button for admin (for now, show for all users) */}
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
        {/* End upload UI */}
          <div className="absolute left-8 -bottom-12 flex items-center">
            <div className="text-3xl font-bold text-gray-900 bg-white px-6 py-2 rounded shadow">
              {group.name}
            </div>
          </div>
        </div>
        {/* Members Count */}
        <div className="flex items-center gap-4 px-8 pt-16 pb-4">
          <span className="text-lg font-semibold text-gray-700">
            {group.members_count} Members
          </span>
        </div>
        {/* Feed */}
        <div className="px-8 pb-8">
          <Feed groupId={group.id} groupPrivacy={group.visibility} />
        </div>
      </div>
    </AppShell>
  );
}
