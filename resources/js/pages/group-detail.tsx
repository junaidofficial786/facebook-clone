import { AppShell } from '@/layouts/app/app-shell';
import Feed from '@/components/dashboard/feed';

interface GroupDetailProps {
  group: {
    id: number;
    name: string;
    cover?: string | null;
    members_count: number;
  };
}

export default function GroupDetail({ group }: GroupDetailProps) {
  return (
    <AppShell>
      <div className="max-w-7xl w-full mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-60 bg-gray-200">
          <img
            src={group.cover || '/images/cover-image-placeholder.jpg'}
            alt="Group Cover"
            className="w-full h-full object-cover"
          />
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
          <Feed groupId={group.id} />
        </div>
      </div>
    </AppShell>
  );
}
