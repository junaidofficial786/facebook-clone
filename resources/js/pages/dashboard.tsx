import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LeftColumn from '@/components/dashboard/left-column';
import CenterColumn from '@/components/dashboard/center-column';
import RightColumn from '@/components/dashboard/right-column';

export default function Dashboard() {
  return (
    <AppHeaderLayout>
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-2 py-6 min-h-[calc(100vh-4rem)]">
        <div className="hidden lg:block w-1/4">
          <div className="sticky top-24">
            <LeftColumn />
          </div>
        </div>
        <div className="flex-1 min-w-0 h-[calc(100vh-4rem)] overflow-y-auto pb-8">
          <CenterColumn />
        </div>
        <div className="hidden xl:block w-1/4">
          <div className="sticky top-24">
            <RightColumn />
          </div>
        </div>
      </div>
    </AppHeaderLayout>
  );
}
