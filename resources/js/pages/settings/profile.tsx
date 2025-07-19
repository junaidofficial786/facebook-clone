
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { usePage } from '@inertiajs/react';
import { ProfilePage } from '../profile';

export default function ProfileSettingsPage() {
  const { user, isOwnProfile } = usePage().props as any;
  return (
    <AppHeaderLayout>
      <ProfilePage user={user} isOwnProfile={isOwnProfile} />
    </AppHeaderLayout>
  );
}
